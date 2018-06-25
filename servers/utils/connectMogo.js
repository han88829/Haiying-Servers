const MongoClient = require('mongodb').MongoClient;
const moggoUrl = 'mongodb://localhost:27017/haiying';

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


exports.connectMogo = connectMogo;