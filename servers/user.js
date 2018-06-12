
// 封装路由

const url = require('url');
const http = require('http');

let data = {

}

let app = (req, res) => {
    const path = url.parse(req.url).pathname;

    if (data[path]) {
        data[path](req, res);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
        res.end('未匹配到路由')
    }
}

app.get = (path, callback) => {
    data[path] = callback;
}


http.createServer(app).listen(3003);


app.get('/', function (req, res) {
    res.end('/');
})

app.get('/login', function (req, res) {
    res.end('login');
})

app.get('/home', function (req, res) {
    res.end('home');
})