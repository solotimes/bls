var fs = require('fs'),
    util = require('util'),
    path = require('path');
exports.index = function(req,res,next){
  res.render('uploads/upload');
};

exports.create = function(req,res,next){
  if(!req.files || !req.files.file)
    return res.send(200);
  var tempFile = req.files.file;
  var fileName = require('moment')().format('YYYYMMDDHHMM') +
                 require('crypto').randomBytes(4).toString('hex') +
                 path.extname(tempFile.name).toLowerCase();
  var targetPath = config.uploadDir + fileName;
  function errHandler(err){
    if (err){
      logger.log(err);
      return next(err);
    }
  }

  var is = fs.createReadStream(tempFile.path);
  var os = fs.createWriteStream(targetPath);
  util.pump(is, os, function(err) {
    if (err)
      return errHandler(err);
    // 删除临时文件夹文件
    fs.unlink(tempFile.path, function() {
       if (err)
         return errHandler(err);
       res.send(config.uploadPath + fileName);
    });
  });
};