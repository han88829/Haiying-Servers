const url = require('url');
const MongoClient = require('mongodb').MongoClient;
const querystring = require('querystring');
const moggoUrl = 'mongodb://localhost:27017/haiying';
const http = require('https');
var ObjectID = require('mongodb').ObjectID;

exports.route = (req, res, userInfo) => {
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
    delete data.session_key;
    switch (path) {
        case '/':
            console.log('我是默认页面');
            res.end(`111`);
            break;
        case '/api/type/add':
            connectMogo('type', 'findOne', { name: data.name }).then(x => {
                if (x.arr && x.arr.name === data.name) {
                    x.db.close();
                    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end(JSON.stringify({ status: 0, msg: "数据已存在！", data: "" }));
                    return
                }
                connectMogo('type', 'insertOne', { ...data, addTime: new Date() }).then(z => {
                    x.db.close();
                    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end(JSON.stringify({ status: 1, msg: "添加成功！", data: data }));
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err);
            })

            break;
        case '/api/type/list':
            // 返回所有的分类列表
            let typeName = {
                name: new RegExp(data.name),
            };
            connectMogo('type', 'find', typeName).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "查询成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/type/edit':
            // 编辑分类
            connectMogo('type', 'updateOne', { _id: ObjectID(data._id) }, { $set: { ...data, _id: ObjectID(data._id) } }).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "编辑成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/type/delete':
            // 删除
            connectMogo('type', 'deleteOne', { _id: ObjectID(data._id) }).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "删除成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/list/add':
            // 添加列表数据
            connectMogo('list', 'insertOne', { ...data, addTime: new Date() }).then(z => {
                z.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "添加成功！", data: data }));
            }).catch(err => {
                console.log(err)
            })
            break;
        case '/api/list/list':
            let where = {
                year: data.year || { $ne: null },
                month: data.month || { $ne: null }
            };

            // 返回所有的列表
            connectMogo('list', 'find', where).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "查询成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/list/edit':
            // 编辑
            connectMogo('list', 'updateOne', { _id: ObjectID(data._id) }, { $set: { ...data, _id: ObjectID(data._id) } }).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "编辑成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/list/delete':
            // 删除
            connectMogo('list', 'deleteOne', { _id: ObjectID(data._id) }).then(x => {
                x.db.close();
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 1, msg: "删除成功！", data: x.arr }));

            }).catch(err => {
                console.log(err);
            })
            break;
        case '/api/user/list':
            // 返回所有的列表
            if (data.id === '326688829') {
                connectMogo('user', 'find').then(x => {
                    x.db.close();
                    res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                    res.end(JSON.stringify({ status: 1, msg: "查询成功！", data: x.arr }));

                }).catch(err => {
                    console.log(err);
                })
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8' });
                res.end(JSON.stringify({ status: 0, msg: "你不是管理员", data: [] }))
            }

            break;
        default:
            // console.log(111);
            // res.end('else')
            break;
    }
}


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