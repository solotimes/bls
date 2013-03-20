var uploadObj = require('./logics/upload');

function index(req, res)
{
    res.send({
        success:true,
        message:'welcome'
    });
    //res.render('user/index');
}

function upload(req, res)
{
    res.render('user/upload',{
        title:'upload'
    });
}

function uploadPost(req, res)
{
    uploadObj.uploadFile(req, function(result){
        if(result.success)
        {
            res.render('user/upload', {title:result.msg});
        }
        else
        {
            res.render('user/upload', {title:'failed'});
        }
    });
}

function uploadPaper(req, res)
{
    res.render('user/uploadPaper', {title:'Upload Paper'})
}

function uploadPaperPost(req, res)
{
    var pics = req.body.pic;
    var audios = req.body.audio;
    uploadObj.uploadPaper(req, pics, audios, function(){
        res.render('user/uploadPaper', {title:'Upload Paper'})
    })
    //uploadObj.uploadPaper()
}

exports.index = index;
exports.upload = upload;
exports.uploadPost = uploadPost;
exports.uploadPaper = uploadPaper;
exports.uploadPaperPost = uploadPaperPost;