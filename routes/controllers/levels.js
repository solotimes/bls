var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend'),
    iconv = require('iconv-lite'),
    moment = require('moment'),
    async = require('async');

exports.index = function(req, res){
  models.Level.findAll({order: '`Order`'}).done(function(error,collection){
    if(error){
      logger.log(error);
      return res.send(500,error);
    }
      res.render('levels/index',{collection: collection});
  });
};

exports['new'] = function(req, res){
  res.render('levels/new',{instance: models.Level.build()});
};

exports.create = function(req, res){
  var instance = req.param('instance') || {};

  req.level = models.Level.build();
  async.auto({
    create: function(fn){
      req.level = models.Level.build(instance);
      errors = req.level.validate();
      if(errors){
        console.log(errors);
        return fn('填写内容错误');
      }
      req.level.save().done(fn);
    }
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('levels/new',{instance:req.level});
    }else{
      req.flash('success','添加成功');
      res.redirect('levels/');
    }
  });
};

exports.edit = function(req, res){
  res.render('levels/edit',{instance:req.level});
};

exports.update = function(req, res){
  var instance = req.param('instance') || {};

  async.auto({
    update: function(fn){
      req.level.setAttributes(instance);
      errors = req.level.validate();
      if(errors){
        return fn('填写内容错误');
      }
      req.level.save().done(fn);
    }
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('levels/edit',{instance:req.level});
    }else{
      req.flash('success','更新成功');
      res.redirect('/levels');
      // res.render('levels/edit',{instance:req.level});
    }
  });
};

exports.destroy = function(req, res){
  req.level.destroy().done(function(err){
    if(err){
      req.flash('error','删除失败!');
    }else{
      req.flash('success','删除成功!');
    }
    res.redirect('back');
  });
};


exports.load = function(req, id, fn){
  models.Level.find(id).done(fn);
};