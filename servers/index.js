var MongoClient = require('mongodb').MongoClient;
const http = require('http');
const fs = require('fs');
const route = require('./route');

http.createServer((req, res) => {
    route.route(req, res);
}).listen(3001)