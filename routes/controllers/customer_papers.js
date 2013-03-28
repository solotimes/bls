var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend'),
    Q = require('q'),
    async = require('async');

exports.index = function(req, res){
  var to = req.redirectByRole([
    [['分配员'],'/customer_papers/raw/未处理'],
    // [['标错题'],'/customer_papers/scope/待标错题'],
    [['录入员'],'/customer_papers/raw/待录错题'],
    [['老师','试题库管理员','推送'],'/customer_papers/recorded/']
  ]);
  res.redirect(to);
};


//未录入的试卷管理
exports.raw = function(req, res ,next){
  res.locals.scopes = [
    {
      name: '全部',
      roles: ['分配员','推送'],
      value: ''
    },
    {
      roles: ['分配员'],
      value: '未处理'
    },
    {
      roles: ['标错题','录入员'],
      value: '待标错题'
    },
    {
      roles: ['录入员','推送'],
      value: '待录全卷'
    },
    {
      roles: ['录入员'],
      value: '待录错题'
    },
    {
      roles: ['分配员'],
      value: '需重拍'
    }
  ];

  var q = (req.param('q') || '').trim();
  var by = (req.param('by')||'').trim();
  var scope = (req.param('scope')||'').trim();
  var condition = '`Status` in(0,1,2,3,4) ';//'RecordedAt is NULL';
  var where,searchParams={};

  if("undefined" !== typeof models.CustomerPaper[scope]){
    // console.log(models.CustomerPaper[scope]);
    condition += 'AND `Status` = ' + models.CustomerPaper[scope];
  }
  if(!req.currentUser.checkRoles(['分配员'])){
    condition = condition ? (condition + ' AND ') :  '';
    condition += ('AdminId = '+req.currentUser.id);
  }
  if(q.length && by.length && (by == 'Name' || by == 'CodeName' || by == 'CreatedAt')){
    if(condition)
      condition += ' AND `CustomerPapers`.`'+by+"` LIKE ?";
    searchParams.q=q;
    searchParams.by=by;
    where = [ condition, "%"+q+"%"];
  }else{
    where = condition;
  }

  models.CustomerPaper.pageAll({
      where:where,
      include: ['Customer','AssignedTo'],
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
    res.render('customer_papers/index',{collection: extend(collection||[],searchParams)});
  });


};

exports.recorded = function(req,res){
  res.locals.scopes = [
    {
      name: '全部',
      roles: ['分配员','推送','老师','试题库管理员'],
      value: ''
    },
    {
      roles: ['老师','试题库管理员','分配员','录入员'],
      value: '错题未解答'
    },
    {
      roles: ['老师','试题库管理员','分配员','录入员','推送'],
      value: '待完善'
    },
    {
      roles: ['老师','试题库管理员','分配员','推送'],
      value: '完成解答'
    },
    {
      roles: ['老师','试题库管理员','分配员','推送'],
      value: '已推送'
    }
  ];

  var q = (req.param('q') || '').trim();
  var by = (req.param('by')||'').trim();
  var scope = (req.param('scope')||'').trim();
  var condition = '`Status` in(5,6,7,8) ';//'RecordedAt is NULL';
  var where,searchParams={};

  if("undefined" !== typeof models.CustomerPaper[scope]){
    // console.log(models.CustomerPaper[scope]);
    condition += 'AND `Status` = ' + models.CustomerPaper[scope];
  }
  if(!req.currentUser.checkRoles(['分配员','老师','试题库管理员','推送'])){
    condition = condition ? (condition + ' AND ') :  '';
    condition += ('AdminId = '+req.currentUser.id);
  }
  if(q.length && by.length && (by == 'Name' || by == 'CodeName' || by == 'CreatedAt')){
    if(condition)
      condition += ' AND `CustomerPapers`.`'+by+"` LIKE ?";
    searchParams.q=q;
    searchParams.by=by;
    where = [ condition, "%"+q+"%"];
  }else{
    where = condition;
  }

  models.CustomerPaper.pageAll({
      where:where,
      include: ['Customer','AssignedTo'],
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
    res.render('customer_papers/recorded',{collection: extend(collection||[],searchParams)});
  });
};

exports.show = {
  html: function(req,res,next){
    var paper = req.customer_paper;
    async.auto({
      paper: function(fn){
        if(!paper){
          findPaperAndCustomer(req,null,fn);
        }else{
          fn(null,paper);
        }
      }
    },function(error,results){
      if(error){
        logger.log(error);
        return next(error);
      }

      res.locals.instance = results.paper;
      res.render('customer_papers/show');
    });

  },
  json: function(req,res,next){
    var paper = req.customer_paper;
    if(paper)
      res.send(paper.toJson());
    else
      res.send(404);
  }
};

exports.assign = function(req,res){

};

exports.update = function(req, res ,next){
  var instance = req.customer_paper;
  if(instance){
    var attrs = req.param('instance');
    try{
      attrs.Meta = JSON.stringify(attrs.Meta);
    }catch(e){}
    req.customer_paper.update(req.param('instance'))
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
      logger.log(error);
      next(error);
    }
  };
}

function doDump(format){
  return function(req,res,next){
    req.customer_paper.dump().then(function(paper){
      if(format == 'json')
        return res.send(paper);
      res.redirect('back');
    }).fail(errorhandler(req,res,next));
  };
}

exports.dump = {
  html: doDump(),
  json: doDump('json')
};

exports.destroy = function(req, res ,next){
  req.customer_paper.destroy().done(function(err){
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
    models.CustomerPaper.findAll({where:{id: ids}}).success(function(collection){
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
  var query = {where: {id:id},include: ['AssignedTo','Pics'],order: '`Pics.PicIndex`'};
  //不指定特定的paper则找到被指派的paper中优先级最高的
  if(!id){
    query = {
      where:{ AdminId: req.currentUser.id },
      include: ['AssignedTo','Pics'],
      addAttributes: '`Levels`.`Order` as `lorder` ',
      join: ' LEFT OUTER JOIN `Levels` ON `Customers`.`LevelID`=`Levels`.`id` ',
      order: ' `lorder` DESC ,`CreatedAt`,`CustomerPaperPic`.`Index`',
      limit: 1
    };
  }
  models.CustomerPaper.find(query).fail(fn).success(function(paper){
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