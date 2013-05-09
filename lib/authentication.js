var models = require('../models');
var authorization = require('../routes/logics/authorization');
var extend = require('extend');

var helper = {
  redirectByRole: function(rules){
      for(var i in rules){
        var rule = rules[i];
        if(this.currentUser.checkRoles(rule[0]))
          return rule[1];
      }
      return '/login';
  }
};

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
            req.session.userId = null;
            if(req.xhr){
                res.send(401);
            }else{
                req.flash('error','权限不足');
                res.redirect('/login');
            }
        }
        req.currentUser = admin;
        extend(req, helper);
        res.locals.currentUser = admin;
        res.locals.req = req;
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

module.exports = function(req,res,next){
  var pattern = /^(\/$|\/admins|\/customers|\/levels|\/customer_papers|\/papers|\/generated_papers|\/questions|\/uploads|\/statistics|\/settings)/;
  if(req.url.match(pattern)){
    authenticateUser(req,res,next);
  }else{
    next();
  }
};