//multi_upload.js
var formidable = require('formidable');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = function (req, options, next) {
    if (typeof options === 'function') {
        next = options;
        options = {};
    }
    //创建上传表单
    var form = new formidable.IncomingForm();
    //设置编辑
    form.encoding = options.encoding || 'utf-8';
    //设置上传目录
    form.uploadDir = options.uploadDir || './servers/static/image/';
    //文件大小
    form.maxFieldsSize = options.maxFieldsSize || 10 * 1024 * 1024;
    //解析
    form.parse(req, function (err, fields, files) {
        if (err) return next(err);
        for (x in files) {
            //后缀名
            var extName = /\.[^\.]+/.exec(files[x].name);
            var ext = Array.isArray(extName)
                ? extName[0]
                : '';
            //重命名，以防文件重复
            var avatarName = uuid() + ext;
            //移动的文件目录
            var newPath = form.uploadDir + avatarName;
            fs.renameSync(files[x].path, newPath);
            fields[x] = {
                size: files[x].size,
                path: newPath,
                name: files[x].name,
                type: files[x].type,
                extName: ext
            };
        }
        next(null, fields);
    });
}
