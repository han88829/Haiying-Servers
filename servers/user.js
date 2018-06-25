const router = require('koa-router')();
const connectMogo = require('./utils/connectMogo');

router.get('/api/user/list', (ctx, next) => {
    const id = ctx.query.id;

    if (id != 326688829) {
        ctx.body = { status: 0, msg: "你不是管理员", data: null };
        return
    }

    connectMogo.connectMogo('user', 'find').then(x => {
        x.db.close();
        ctx.body = { status: 1, msg: "查询成功！", data: x.arr };
    }).catch(err => {
        console.log(err);
    })

})