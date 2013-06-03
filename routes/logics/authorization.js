/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-9
 * Time: 上午9:54
 */
var models = require('../../models'),
    utility = require('./utility'),
    messages = require('../../messages');

function validateUser(req, username, password, callback)
{
    if(username.trim().length>0 && password.trim().length>0)
    {
        var user = models.Admin.find({where: {Username:username}})
            .success(function(admin){
                if(admin && utility.encode(password) === admin.Password)
                {
                    admin.LastLoginIP = admin.LoginIP;
                    admin.LastLoginTime = admin.LoginTime;
                    admin.LoginIP = req.ip;
                    admin.LoginTime = utility.getCurrentTime();
                    admin.Online = true;
                    admin.save().success(function(){
                        callback(true, admin);
                    }).failure(function(){
                        callback(false,messages.dbError);
                    });
                }
                else
                {
                    callback(false,messages.notFoundUser);
                }
            })
            .failure(function(){
                callback(false, messages.dbError);
            });
    }
    else
    {
        callback(false, messages.usernameCannotNull);
    }
}

function setLoginSession(req, admin)
{
    logger.log(admin.Name + ' logged in from '+req.id);
    req.session.userId=admin.id;
}

function destroySession(req, callback)
{
    req.session.destroy(function(err){
        if(err)
        {
            logger.log(err);
            callback(false);
        }
        callback(true);
    });
}

function login(req, username, password, callback)
{
    validateUser(req, username, password, function(result, entity){
        if(result)
        {
            setLoginSession(req, entity);
            callback(true);
        }
        else
        {
            callback(false, entity);
        }
    });
}

function authenticateRoles(roles){
  return function(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.session.flash = 'Access denied!';
      res.redirect('/login');
    }
  };
}

function authenticateUser(req, res, next) {
  if (req.session.userId) {
      models.Admin.find({where:{id: req.session.userId},include: ['Roles']}).done(function(error,admin){
        if(error || !admin){
            logout(req,function(){
                if(req.xhr){
                    res.end();
                }else{
                    res.flash('error','权限不足');
                    res.redirect('/login');
                }
            });
        }
        req.currentUser = admin;
        res.locals.currentUser = admin;
        next();
      });
  } else {
    if(req.xhr){
        res.send(401);
    }else{
        res.flash('error','请登陆');
        res.redirect('/login');
    }
  }
}

function logout(req, callback)
{
    destroySession(req, function(result){
        callback(result);
    });
}

function checkLogin(req, res, next)
{
    if(!req.session.userId)
    {
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next)
{
  // if(req.session.userId)
  // {
  //     // return res.redirect('/user');
  // }
  next();
}

exports.login = login;

exports.logout = logout;

exports.checkLogin = checkLogin;

exports.checkNotLogin = checkNotLogin;

exports.authenticateUser = authenticateUser;