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
    if( !!(req.parentModel = req[parentModels[i]]) ){
      break;
    }
  }

  return req.parentModel;
}

exports.index = {
  html: function(req,res,next){
    res.locals.scopes = [
      {
        name: '全部',
        value: ''
      },
      {
        value: '未解答'
      },
      {
        value: '待完善'
      },
      {
        value: '完成解答'
      }
    ];
    var q = (req.param('q') || '').trim();
    var by = (req.param('by')||'').trim();
    var scope = (req.param('scope')||'').trim();
    var condition = '`Status` in(5,6,8) ';
    var where,searchParams={};
    if("undefined" !== typeof models.Question[scope]){
      condition += 'AND `Status` = ' + models.Question[scope];
    }
    if(q.length && by.length && (by == 'CreatedAt')){
      if(condition)
        condition += ' AND `Papers`.`'+by+"` LIKE ?";
      searchParams.q=q;
      searchParams.by=by;
      where = [ condition, "%"+q+"%"];
    }else{
      where = condition;
    }
    models.Question.pageAll({
        where:where,
        order: '`CreatedAt` DESC'
      },
    req.param('page'),req.param('per'),
    function(error,collection){
      if(error){
        logger.log(error);
        return next(error);
      }
      res.render('questions/index',{collection: extend(collection||[],searchParams)});
    });
  },
  json: function(req,res,next){
    fetchParentModel(req);
    var keywords = (req.param('q') || '').trim();
    if(!!req.parentModel){
      p = Q.when(req.parentModel.getFullQuestions());
    }else if(keywords.length){
      p = Q.when(models.Question.findAll({
            include: ['Knowledge'],
            where: ['`Status` in (5,6,8) AND `Excerpt` LIKE ?', "%"+keywords+"%" ],
            limit: 50
          })).then(function(quesions){
            // 删除空的knowledge 记录
            quesions.forEach(function(question){
              if(question.knowledges && question.knowledges.length && !question.knowledges[0].id)
                delete question.knowledges;
            });
            return quesions;
          });
    }else{
      return res.send([]);
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
    res.render('questions/show',{instance: req.question});
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
  req.question.updateAttributes({Status: 0}).done(function(){
    res.redirect('back');
  });
};

exports.batchDestroy = function(req,res){
  var ids = req.param('ids');
  if(!ids || ids.length === 0){
    res.redirect('back');
  }
  else{
    models.Question.findAll({where:{id: ids}}).success(function(collection){
      var chainer = new Sequelize.Utils.QueryChainer();
      collection.forEach(function(m) {
          chainer.add(m.updateAttributes({Status: 0}));
      });
      return chainer.run().success(function(){
        req.flash('success','删除成功!');
        res.redirect('back');
      });
    });
  }
};

exports.load = function(req, id, fn){
  models.Question.find(id).done(fn);
};