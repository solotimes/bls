var models = require('../../models'),
    Sequelize = require('sequelize'),
    Utils = Sequelize.Utils,
    utility = require('../logics/utility'),
    extend = require('extend'),
    Q = require('q'),
    async = require('async');

exports.index = function(req, res){
  // var to = req.redirectByRole([
  //   [['分配员'],'/papers/scope/未处理'],
  //   [['录入员'],'/papers/scope/待录错题'],
  //   [['老师','试题库管理员','推送'],'/papers/recorded/']
  // ]);
  res.redirect('/papers/scope');
};

exports.filter = function(req, res ,next){
  var params = req.param('searchParams');
  var include = ['Question'];
  var conditions = {},where = [];
  conditions['Papers.Status'] = [6,8];
  if(Utils._.isNumber(params.GradeId)){
    conditions['Papers.GradeId']=params.GradeId;
  }
  if(Utils._.isNumber(params.Order)){
    conditions['PapersQuestions.Order'] = params.Order;
  }
  conditions = models.sequelize.queryInterface.QueryGenerator.hashToWhereConditions(conditions);
  where.push(conditions);
  if(params.Name){
    where.push(Utils.format(['`Papers`.`Name` LIKE ? ' ,'%'+params.Name+'%']));
  }
  if(params.Body){
    where.push(Utils.format(['`Questions`.`Excerpt` LIKE ? ' ,'%'+params.Body+'%']));
  }
  Q.when(models.Paper.findAll({
    where: where.join(' AND '),
    include: include,
    limit: 200
  }))
  .then(function(papers){
    res.send(papers);
  });
};

exports.scope = function(req, res ,next){
  res.locals.scopes = [
    {
      name: '全部',
      roles: ['分配员','老师','试卷库题库管理'],
      value: ''
    },
    {
      roles: ['分配员','老师','试卷库题库管理'],
      value: '待录全卷'
    },
    {
      roles: ['分配员','老师','试卷库题库管理'],
      value: '待完善'
    },
    {
      roles: ['分配员','老师','试卷库题库管理'],
      value: '完成解答'
    }
  ];
  var q = (req.param('q') || '').trim();
  var by = (req.param('by')||'').trim();
  var scope = (req.param('scope')||'').trim();
  var condition = '`Status` in(3,6,8) ';//'RecordedAt is NULL';
  var where,searchParams={};

  if("undefined" !== typeof models.Paper[scope]){
    // console.log(models.Paper[scope]);
    condition += 'AND `Status` = ' + models.Paper[scope];
  }
  // if(!req.currentUser.checkRoles(['分配员'])){
  //   condition = condition ? (condition + ' AND ') :  '';
  //   condition += ('AdminId = '+req.currentUser.id);
  // }
  if(q.length && by.length && (by == 'Name' || by == 'CodeName' || by == 'CreatedAt')){
    if(condition)
      condition += ' AND `Papers`.`'+by+"` LIKE ?";
    searchParams.q=q;
    searchParams.by=by;
    where = [ condition, "%"+q+"%"];
  }else{
    where = condition;
  }
  models.Paper.pageAll({
      where:where,
      // include: ['Customer','AssignedTo'],
      // addAttributes: ' `Levels`.`Name` as `lname` ,`Levels`.`Order` as `lorder` ',
      // join: ' LEFT OUTER JOIN `Levels` ON `Customers`.`LevelID`=`Levels`.`id` ',
      order: '`CreatedAt` DESC'
    },
  req.param('page'),req.param('per'),
  function(error,collection){
    if(error){
      logger.log(error);
      return next(error);
    }
    res.render('papers/index',{collection: extend(collection||[],searchParams)});
  });
};


exports.show = {
  html: function(req,res,next){
    res.locals.instance = req.paper;
    res.render('papers/show');
  },
  json: function(req,res,next){
    res.send(paper);
  }
};

exports['new'] = function(req,res){
  res.render('papers/new');
};

function upsert(req,res,next){
  var instance = models.Paper.saveInstance(req.paper,req.param('instance'))
  .then(function(paper){
    res.send(paper);
  })
  .fail(errorhandler(req.res,next));
}
exports.create = upsert;
exports.update = upsert;

function errorhandler(req,res,next){
  return function(error){
    if(error){
      logger.log(error.stack);
      next(error);
    }
  };
}

exports.destroy = function(req, res ,next){
  req.paper.destroy().done(function(err){
    if(err){
      logger.log(err);
      return next(err);
    }
    req.flash('success','删除成功!');
    res.redirect('back');
  });
};

exports.batchDestroy = function(req,res){
  var ids = req.param('ids');
  if(!ids || ids.length === 0){
    res.redirect('back');
  }
  else{
    models.Paper.findAll({where:{id: ids}}).success(function(collection){
      var chainer = new Sequelize.Utils.QueryChainer();
      collection.forEach(function(m) {
          chainer.add(m.destroy());
      });
      return chainer.run().success(function(){
        req.flash('success','删除成功!');
        res.redirect('back');
      });
    });
  }
};

exports.load = function(req, id, fn){
  models.Paper.fetch(id).nodeify(fn);
};