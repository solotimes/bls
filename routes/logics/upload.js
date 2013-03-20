/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-9
 * Time: 上午9:55
 */
var fs = require('fs'),
    format = require('util').format,
    config = require('../../config'),
    logger = require('./logger'),
    uuid = require('node-uuid'),
    messages = require('../../messages'),
    model = require('../../models/models');

function mkdir(path, root)
{
    var dirs = path.split('/'),
        dir = dirs.shift(),
        root = (root||'')+dir+'/';
    try { fs.mkdirSync(root); }
    catch (e) {
        if(!fs.statSync(root).isDirectory()) throw new Error(e);
    }
    return !dirs.length||mkdir(dirs.join('/'), root);
}

function uploadFile(req, callback)
{
    if(req.files.file)
    {
        var uploadedFile = req.files.file;
        var tmpPath = uploadedFile.path;
        var date = new Date();
        var newFolder = config.uploadDir
            + date.getFullYear().toString() + '/'
            + (date.getMonth()+1).toString() + '/'
            + date.getDate().toString();
        if(!fs.existsSync(newFolder))
        {
            mkdir(newFolder);
        }
        var fileExt = uploadedFile.name.substring(uploadedFile.name.lastIndexOf('.') + 1);
        var newFileName = uuid.v1().replace(/-/g,'') + '.' + fileExt;
        var targetPath = newFolder + '/'+ newFileName;
        var is = fs.createReadStream(tmpPath);
        var os = fs.createWriteStream(targetPath);
        is.pipe(os);

        is.on('end', function(){
            fs.unlink(tmpPath, function(uErr){
                if(uErr){
                    logger.log(uErr);
                    callback({
                        success:false,
                        msg:''
                    });
                }
                callback(
                    {
                        success:true,
                        msg:targetPath
                    });
            });
        });
    }
}

function uploadPaper(req, pictures, audios, callback)
{
    if(pictures.length == 0 || pictures.length != audios.length)
    {
        callback(false, messages.wrongData);
    }
    else
    {
        var CustomerPaper = model.CustomerPaper;
        var CustomerPaperPic = model.CustomerPaperPic;

        CustomerPaper.build({
            Name:"",
            CustomerId:req.session.user.id,
            CustomerPaperStatusId:1
        }).save().success(function(savedPaper){
            for(var picIndex in pictures)
            {
                var pic = pictures[picIndex];
                if(pic.trim().length>0)
                {
                    CustomerPaperPic.build({
                        PicIndex:picIndex,
                        PicPath:pic,
                        AudioPath:audios[picIndex],
                        CustomerPaperId:savedPaper.Id
                    }).save().success(function(){
                            logger.log('Pic Saved');
                        });
                }
            }
            callback(true);
        }).failure(function(){
            callback(false, messages.wrongData);
            });
    }
}

exports.uploadFile = uploadFile;

exports.uploadPaper = uploadPaper;