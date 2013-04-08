var extend = require('extend');
var moment = require('moment');
var pagination = require('./lib/pagination');
var models = require('./models');
var Utils = require('sequelize').Utils;

var RequestHelpers = {
  fetchParam: function(name,callback){
    var value = (this.param(name) || '').trim();
    if(value.length && callback){
      callback(value);
    }
    return value;
  },
  fetchParams: function(names,callback){
    var results = {};
    names.forEach(function(name,i){
      results[name] = this.fetchParam(name,callback && function(value){
        callback(name,value,i);
      });
    }.bind(this));
    return results;
  }
};

module.exports = function(app){
  app.locals = app.locals || [];
  extend(app.locals,{
    moment: moment,
    models: models,
    paginate: pagination.helper,
    utils: Utils
  });
  app.use(function(req,res,next){
    extend(req,RequestHelpers);
    next();
  });
};