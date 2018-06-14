var MongoClient = require('mongodb').MongoClient;
const http = require('http');
const route = require('./route');
const url = require('url');
const moggoUrl = 'mongodb://localhost:27017/haiying';
const https = require('https');
const querystring = require('querystring');
var ObjectID = require('mongodb').ObjectID;

http.createServer((req, res) => {
    const path = url.parse(req.url).pathname;

    let data = '';

    // 接收数据
    if (req.method === 'GET') {
        data = querystring.parse(url.parse(req.url).query);
    } else {
        req.on('data', function (chunk) {
            data += chunk;
        });
        req.on('end', function () {
            data = JSON.parse(data);
        })
    }
    if (path === '/api/login') {
        // 登录
        const wxLogin = `/sns/jscode2session?appid=wx3efb2a6b9e27f092&secret=65ffe10b9e3db2954f3602f056bfcc97&js_code=${data.code}&grant_type=authorization_code`;

        const options = {
            hostname: 'api.weixin.qq.com',
            path: wxLogin,
            method: 'GET'
        };
        const request = https.request(options, (httpReq) => {
            let wxData = '';
            httpReq.on('data', (d) => {
                wxData += d;
            });
            httpReq.on('end', () => {
                wxData = JSON.parse(wxData);
                if (wxData.openid) {
                    connectMogo('user', 'findOne', { openid: wxData.openid }).then(x => {
                        if (x.arr && x.arr.openid === wxData.openid) {
                            x.db.close();
                            console.log(x.arr.nickName + "---登录");
                            connectMogo('user', 'updateOne', { _id: ObjectID(x.arr._id) }, { $set: { ...x.arr, session_key: wxData.session_key } }).then(x => {
                                console.log('修改session_key成功！');
                                x.db.close();
                            }).catch(err => {
                                console.log(err);
                            })
                            res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                            res.end(JSON.stringify({
                                status: 1, msg: "登录成功", data: {
                                    ...data,
                                    ...wxData
                                }
                            }));
                            return
                        }
                        const user = {
                            ...data,
                            ...wxData,
                            addTime: new Date(),
                        };
                        connectMogo('user', 'insertOne', user).then(z => {
                            z.db.close();
                            res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                            res.end(JSON.stringify({ status: 1, msg: "添加成功！", data: user }));
                        }).catch(err => {
                            console.log(err)
                        })
                    }).catch(err => {
                        console.log(err);
                    })
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end(JSON.stringify({ status: 0, msg: "微信登录失败！", data: "" }));
                }
            })
        });

        request.on('error', (e) => {
            console.error(e);
        });
        request.end();
    } else if (!data.session_key) {
        res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
        res.end(JSON.stringify({ status: 0, msg: "请登录！", data: [] }));
    } else {
        MongoClient.connect(moggoUrl, function (err, db) {
            if (err) {
                console.log('错误', err);
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 0, msg: "服务器异常！", data: "" }));
                return
            };
            var dbase = db.db("haiying");
            dbase.collection('user').findOne({ session_key: data.session_key }, (err, arr) => {
                if (err || !arr) {
                    console.log('错误', err);
                    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end(JSON.stringify({ status: 0, msg: "非法用户，请登录！", data: [] }));
                    return
                };
                route.route(req, res, arr);
            })

        })

    }
}).listen(3001);


function connectMogo(name, type, data = {}, updata = {}) {
    return new Promise((res, rej) => {
        try {
            MongoClient.connect(moggoUrl, function (err, db) {
                if (err) rej(err);
                var dbase = db.db("haiying");
                if (type === 'find') {
                    dbase.collection(name)[type](data).toArray((err, arr) => {
                        if (err) rej(err);
                        res({ db, arr })
                    });
                    return
                }

                dbase.collection(name)[type](data, updata, (err, arr) => {
                    if (err) rej(err);
                    res({ db, arr });
                })

            })
        } catch (error) {
            rej(error)
        }
    })
}