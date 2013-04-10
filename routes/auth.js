/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-11
 * Time: 下午3:10
 */
var authorization = require('./logics/authorization'),
    util = require('util');
    logger = require('./logics/logger');

function login(req, res)
{
    res.render('auth/login',{layout: false});
}

function loginPost(req, res)
{
    var username = req.param('username');
    var password = req.param('password');
    if(!!req.session.captcha && req.session.captcha != req.param('captcha').trim().toLowerCase()){
        res.flash('error','验证码错误');
        res.render('auth/login');
        console.log('验证码错误:' + req.session.captcha);
    }else{
        authorization.login(req, username, password, function(result, message){
            if(result){
                res.redirect('/');
            }
            else{
                res.flash('error',message);
                res.render('auth/login');
            }
        });
    }
}

function logout(req, res, next)
{
    req.session.userId = null;
    res.redirect('/login');
}

exports.login = login;
exports.loginPost = loginPost;
exports.logout = logout;