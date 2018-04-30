```
sudo perf stat -d node src/lib/temp2.js
docker run --privileged --name lab1 -d mathsum
sudo perf stat docker start lab1
sudo perf stat node labs/functions/@my-company/math.sum/test/index.js

time docker start lab1
```

* time node labs/functions/@my-company/math.sum/test/index.js
075,
076,
083,
084,
072,
083,
078,
092,
092,
098,
085,
082,
092,
083,
097,
090,
085,
084,
089,
090
* * Média: 85.5
* * Desvio padrão: 7.04

* time node labs/math.sum.test.js
108,
109,
115,
106,
112,
112,
110,
109,
115,
104,
124,
116,
110,
113,
114,
125,
104,
107,
115,
111
* * Média: 111.95
* * Desvio padrão: 5.58

* time docker start lab1
1130,
884,
912,
868,
934,
857,
884,
846,
955,
819,
919,
852,
884,
882,
1359,
863,
904,
837,
879,
1032
* * Média: 925
* * Desvio padrão: 124.54

* com nodejs carregado
9,
13,
10,
8,
9,
9,
10,
9,
10,
10,
9,
11,
9,
9,
9,
9,
9,
9,
9,
10
* * Média: 9.5
* * Desvio padrão: 1.05