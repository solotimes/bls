var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend'),
    Q = require('q'),
    async = require('async'),
    Utils = Sequelize.Utils;

function fetchParentModel(req){
  var parentModels = ['customer_paper','paper'];
  var p;
  for(var i in parentModels){
    if( (req.parentModel = req[parentModels[i]]) ){
      break;
    }
  }

  return req.parentModel;
}

exports.index = {
  json: function(req,res,next){
    fetchParentModel(req);
    if(req.parentModel){
      p = Q.when(paperModel.getFullQuestions());
    }else{
      p = Q.when(models.Question.all());
    }
    p.then(function(quesions){
      res.send(quesions);
    })
    .fail(function(err){
      logger.log(err);
      res.send(err);
    });
  }
};


exports.show = {
  html: function(req,res,next){
  },
  json: function(req,res,next){
  }
};



exports.create = {
  json:function(req, res ,next){
        fetchParentModel(req);
        var instance = req.param('instance');
        var questions = [];
        if(!instance.length){
          instance = [instance];
        }
        instance.reduce(function(p,attrs){
          return p.then(function(previous){
            if(previous){
              questions.push(previous);
            }
            return models.Question.saveInstance(attrs,req.parentModel);
          });
        },Q.resolve())
        .then(function(previous){
          if(previous){
            questions.push(previous);
          }
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