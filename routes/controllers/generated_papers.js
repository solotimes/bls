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
  res.redirect('/generated_papers/scope');
};


exports.scope = function(req, res ,next){
  res.locals.scopes = [
    {
      name: '全部',
      roles: ['分配员','老师','试题库管理员'],
      value: ''
    },
    {
      roles: ['分配员','老师','试题库管理员'],
      value: '待批改'
    },
    {
      roles: ['分配员','老师','试题库管理员'],
      value: '完成解答'
    },
    {
      roles: ['分配员','老师','试题库管理员'],
      value: '已推送'
    }
  ];
  var q = req.fetchParam('q');
  var by = req.fetchParam('by');
  var scope = req.fetchParam('scope');
  var condition = '`Status` in(7,9,6,10) ';
  var where,searchParams={};

  if("undefined" !== typeof models.GeneratedPaper[scope]){
    condition += 'AND `Status` = ' + models.GeneratedPaper[scope];
  }
  if(q.length && by.length && (by == 'Name' || by == 'CodeName' || by == 'CreatedAt')){
    if(condition)
      condition += ' AND `Papers`.`'+by+"` LIKE ?";
    searchParams.q=q;
    searchParams.by=by;
    where = [ condition, "%"+q+"%"];
  }else{
    where = condition;
  }
  models.GeneratedPaper.pageAll({
      where:where,
      include: ['Customer'],
      addAttributes: ' `Levels`.`Name` as `lname` ,`Levels`.`Order` as `lorder` ',
      join: ' LEFT OUTER JOIN `Levels` ON `Customers`.`LevelID`=`Levels`.`id` ',
      order: ' `lorder` DESC ,`CreatedAt` '
    },
      req.param('page'),req.param('per'),
  function(error,collection){
    if(error){
      logger.log(error);
      return next(error);
    }
    res.render('generated_papers/index',{collection: extend(collection||[],searchParams)});
  });

};


exports.show = {
  html: function(req,res,next){
    res.locals.instance = req.generated_paper;
    res.render('generated_papers/show');
  },
  json: function(req,res,next){
    res.send(paper);
  }
};

exports.update = function(req, res ,next){
  var instance = req.generated_paper;
  if(instance){
    var attrs = req.param('instance');
    req.generated_paper.update(req.param('instance'))
    .then(function(){
      return Q.nfcall(findPaperAndCustomer,req,instance.id);
    })
    .then(function(reload){
      res.send(reload);
    })
    .fail(function(error){
      logger.log(error);
      next(error);
    });
  }else{
    res.send(404);
  }
};

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
    models.GeneratedPaper.findAll({where:{id: ids}}).success(function(collection){
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

function findPaperAndCustomer(req, id ,fn){
  var query = {where: {id:id},include: ['Pics'],order: '`Pics.PicIndex`'};
  models.GeneratedPaper.find(query).fail(fn).success(function(paper){
    if(!paper){
      return fn('Not Found!');
    }
    var cid = paper.CustomerId;
    if(cid){
      return models.Customer.find({where:{id:cid},include:['Level','Grade','Role']}).fail(fn).success(function(customer){
        paper.customer = customer;
        fn(null,paper);
      });
    }
    return fn(null,paper);
  });
}

exports.load = function(req, id, fn){
  findPaperAndCustomer(req,id,fn);
};