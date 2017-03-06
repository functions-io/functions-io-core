"use strict";

//types => integer, long, float, double, string, byte, binary, boolean, date, dateTime, password
//code {0=required, 1=valueIsNotType, 2=enum, 3=minLength, 4=maxLength, 5=regex}

var InputValidate = function(){
    this.parse = function(functionName, dataParse, inputDefinition){
        var error = null;
        var dataParsed = null;

        function process(data, inputDefinition){
            var keys = Object.keys(inputDefinition);
            var itemDefinition;
            var value;
            var name;

            for (var i = 0; i < keys.length; i++){
                name = keys[i];
                itemDefinition = inputDefinition[name];

                value = data[name];

                if (itemDefinition.required){
                    if ((value === undefined) || (value === null)){
                        error = {name:"ValidateError", message:"Value required", code:0, functionName:functionName, attributeName:name};
                        return null;
                    }
                }
                else{
                    if ((value === undefined) || (value === null)){
                        if ((itemDefinition.default !== undefined) && (itemDefinition.default !== null)){
                            value = itemDefinition.default;
                            data[name] = value;
                        }
                        else{
                            continue;
                        }
                    }
                }
                
                if ((itemDefinition.type === "integer") || (itemDefinition.type === "long") || (itemDefinition.type === "float") || (itemDefinition.type === "double")){
                    if (typeof(value) !== "number"){
                        if ((itemDefinition.type === "integer") || (itemDefinition.type === "long")){
                            value = parseInt(value);
                        }
                        if ((itemDefinition.type === "float") || (itemDefinition.type === "double")){
                            value = parseFloat(value);
                        }
                        if (isNaN(value)){
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                        data[name] = value;
                    }
                    if (itemDefinition.minimum !== undefined){
                        if (value < itemDefinition.minimum){
                            error = {name:"ValidateError", message:"Value should not be less than " + itemDefinition.minimum, code:3, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.minimum};
                            return null;
                        }
                    }
                    if (itemDefinition.maximum !== undefined){
                        if (value > itemDefinition.maximum){
                            error = {name:"ValidateError", message:"Value should not be greater than " + itemDefinition.maximum, code:4, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.maximum};
                            return null;
                        }
                    }
                }

                if ((itemDefinition.type === "string") || (itemDefinition.type === "password")){
                    if (typeof(value) !== "string"){
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
                    }
                    if (itemDefinition.minLength !== undefined){
                        if (value.length < itemDefinition.minLength){
                            error = {name:"ValidateError", message:"Length should not be less than " + itemDefinition.minLength, code:3, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.minLength};
                            return null;
                        }
                    }
                    if (itemDefinition.maxLength !== undefined){
                        if (value.length > itemDefinition.maxLength){
                            error = {name:"ValidateError", message:"Length should not be greater than " + itemDefinition.maxLength, code:4, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.maxLength};
                            return null;
                        }
                    }
                    if (itemDefinition.pattern !== undefined){
                        if (itemDefinition.pattern.test(value) === false){
                            error = {name:"ValidateError", message:"Text not permited", code:5, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.pattern.source};
                            return null;
                        }
                    }
                }

                if (itemDefinition.type === "boolean"){
                    if (typeof(value) !== "boolean"){
                        if (value === "true"){
                            data[name] = true;
                        }
                        else if (value === "false"){
                            data[name] = false;
                        }
                        else{
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                    }
                }

                if ((itemDefinition.type === "date") || (itemDefinition.type === "dateTime")){
                    if (!(value instanceof Date)){
                        value = Date.parse(value);
                        if (isNaN(value)){
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                            return null;
                        }
                        data[name] = new Date(value);
                    }
                }

                if (itemDefinition.type === "array"){
                    if (Array.isArray(value)){
                        if (itemDefinition.minItems !== undefined){
                            if (value.length < itemDefinition.minItems){
                                error = {name:"ValidateError", message:"Length should not be less than " + itemDefinition.minItems, code:3, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.minItems};
                                return null;
                            }
                        }
                        if (itemDefinition.maxItems !== undefined){
                            if (value.length > itemDefinition.maxItems){
                                error = {name:"ValidateError", message:"Length should not be greater than " + itemDefinition.maxItems, code:4, functionName:functionName, attributeName:name, attributeRestriction:itemDefinition.maxItems};
                                return null;
                            }
                        }
                        for (var i_array = 0; i_array < value.length; i_array++){
                            data[name][i_array] = process(value[i_array], itemDefinition.items);
                            if (data[name][i_array] === null){
                                return null;
                            }
                        }
                    }
                    else{
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
                    }
                }

                if (itemDefinition.type === "object"){
                    if ((typeof(value) === "undefined") || (typeof(value) === "null") || (typeof(value) === "object")){
                        if (itemDefinition.required === true && typeof(value) !== "object"){
                            error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        }
                        else{
                            if (value){
                                value = process(value, itemDefinition.properties);
                                if (value === null){
                                    return null;
                                }
                                else{
                                    data[name] = value;
                                }
                            }
                        }
                    }
                    else{
                        error = {name:"ValidateError", message:"Value is not " + itemDefinition.type, code:1, functionName:functionName, attributeName:name};
                        return null;
                    }
                }

                if (Array.isArray(itemDefinition.enum)){
                    for (var i_enum = 0; i_enum < itemDefinition.enum.length; i_enum++){
                        if (value === itemDefinition.enum[i_enum]){
                            i_enum = -1;
                            break;
                        }
                    }
                    if (i_enum >= 0){
                        error = {name:"ValidateError", message:"Value is not in domain", code:2, functionName:functionName, attributeName:name};
                        return;
                    }
                }

                //console.log("debug => " + itemDefinition.type + " -> " + value);
            }
            //console.log(data);
            return data;
        }

        if (inputDefinition){
            dataParsed = process(dataParse || {}, inputDefinition); 
        }
        else{
            dataParsed = dataParse;
        }

        return {error: error, data: dataParsed};
    };
};

module.exports = InputValidate;