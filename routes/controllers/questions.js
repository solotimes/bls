var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend'),
    Q = require('q'),
    async = require('async');

exports.index = function(req, res){
  res.send(200);
};


exports.show = {
  html: function(req,res,next){
  },
  json: function(req,res,next){
  }
};



exports.create = {
  json:function(req, res ,next){
        var instance = req.param('instance');
        if(!instance.length){
          instance = [instance];
        }
        Q.all(instance.map(function(question){
          //并发写入所有试题
          return models.Question.createInstance(question);
        }))
        .then(function(questions){
          if(questions.length==1)
            res.send(questions[0]);
          else
            res.send(questions);
        }).fail(function(error){
          logger.log(error);
          next(error);
        });
    }
};

exports.destroy = function(req, res ,next){
  res.send(200);
};

exports.batchDestroy = function(req,res){
  res.send(200);
};

exports.load = function(req, id, fn){
  findPaperAndCustomer(req,id,fn);
};