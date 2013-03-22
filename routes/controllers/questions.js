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
      p = Q.when(paperModel.getQuestions(models.Question.getFullQuery()));
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
        if(!instance.length){
          instance = [instance];
        }
        Q.all(instance.map(function(question){
          //并发写入所有试题
          return models.Question.saveInstance(question,req.parentModel);
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