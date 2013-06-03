var models = require('../../models'),
    Sequelize = require('sequelize'),
    Utils = Sequelize.Utils,
    utility = require('../logics/utility'),
    extend = require('extend'),
    iconv = require('iconv-lite'),
    moment = require('moment'),
    Q = require('q'),
    async = require('async');

function parseBoolean(value){
  if(value ==='true' || value === true){
    return true;
  }else{
    return false;
  }
}

function dataParse(instance){
  var parsers={
    parseBoolean :['Gender']
  };
  var process = function(parser,field){
    if(!!instance[field]){
      // console.log(field+':'+instance[field]+':'+eval(parser+"(instance[field])"));
      instance[field] = eval(parser+"(instance[field])");
    }
  };
  for(var parser in parsers){
    var fields = parsers[parser];
    for(var i in fields){
      process(parser,fields[i]);
    }
  }
}

exports.index = {
  html: function(req, res){
    var query={},searchParams={};
    query.where = [];
    query.order = '`CreatedAt` DESC';
    query.include = ['Level','Grade','Role'];

    req.fetchParams(['Name','School'],function(name,value){
      searchParams[name] = value;
      query.where.push(Utils.format(['`Customers`.`'+name+'` LIKE ? ','%' + value + '%']));
    });

    req.fetchParams(['CustomerRoleId','GradeId','SchoolType','Gender'],function(name,value){
      searchParams[name] = value;
      query.where.push(Utils.format(['`Customers`.`'+name+'` = ? ',value]));
    });

    req.fetchParam('Valid',function(isValid){
      searchParams['Valid'] = isValid;
      if(isValid == 1){
        query.where.push(Utils.format(['`Customers`.`ExpireDate` > ? ',moment().format('YYYY-MM-DD')]));
      }else{
        query.where.push(Utils.format(['`Customers`.`ExpireDate` < ? ',moment().format('YYYY-MM-DD')]));
      }
    });

    query.where = query.where.join(' AND ');

    models.Customer.pageAll(query,req.param('page'),req.param('per'),function(error,collection){
      if(error){
        return res.send(500,error);
      }
        res.render('customers/index',{collection: extend(collection,searchParams,{searchParams: searchParams})});
    });
  },
  csv: function(req,res){
    models.Customer.findAll({include: ['Level','Grade','Role']}).success(function(customers){
      res.attachment('会员信息导出'+moment().format('YYYYMMDD-Hmmss')+'.csv');
      var line = ['会员ID','会员类别','姓名','身份','用户名','邮箱','性别','学校','年级','班级','最后登陆时间'].join(',');
      res.write( iconv.encode(line, 'GBK') );
      res.write('\n');
      customers.forEach(function(customer){
        line = [];
        line.push(customer.id);
        line.push(customer.levelText() || '');
        line.push(customer.Name);
        line.push(customer.roleText() || '');
        line.push(customer.UserName);
        line.push(customer.Email);
        line.push(customer.Gender ? '男' : '女');
        line.push(customer.School);
        line.push(customer.gradeText() || '');
        line.push(customer.Class);
        line.push(customer.LoginTime ? moment(model.LoginTime).format('YYYY-MM-DD hh:mm:ss') : '');
        res.write( iconv.encode(line.join(','), 'GBK') );
        res.write('\n');
      });
      res.end();
    });
  },
  json: function(req,res){
    var q = (req.param('q') || '').trim();
    var where={};
    if(q.length){
      where = [ "`Customers`.`Name` LIKE ? or `Customers`.`UserName` LIKE ? ", "%"+q+"%","%"+q+"%"];
    }else{
      return res.send({});
    }

    models.Customer.findAll({where:where}).done(function(error,collection){
      if(error){
        logger.log(error);
        return res.send(500,error);
      }
        var results = (collection || []).map(function(model){
          return {Name:model.Name, id:model.id};
        });
        res.send(results);
    });
  }
};

exports['new'] = function(req, res){
  res.render('customers/new',{instance: models.Customer.build(),roles:req.roles});
};


function doLoadRelated(instance,fn){
  var relatedIds = (instance.relatedIds || '').trim();
  if(relatedIds.length ){
    relatedIds = relatedIds.split(',');
    models.Customer.findAll({where: {id: relatedIds}}).done(fn);
  }else{
    fn();
  }
}

function doSetRelated(fn,model,relateds){
  if(relateds && relateds.length){
    model.setRelated(relateds).done(fn);
  }else{
    fn();
  }
}

exports.create = function(req, res){
  var instance = req.param('instance') || {};
  var password = (instance.pass||'').trim();


  dataParse(instance);

  req.customer = models.Customer.build();
  async.auto({
    checkPassword: function(fn){
      if(password.length > 4){
        instance.Password = utility.encode(instance.pass);
        fn();
      }else{
        fn('密码长度不正确');
      }
    },
    loadRelated: function(fn){
      doLoadRelated(instance,fn);
    },
    create: function(fn){
      req.customer = models.Customer.build(instance);
      errors = req.customer.validate();
      if(errors){
        console.log(errors);
        return fn('填写内容错误');
      }
      req.customer.save().done(fn);
    },
    setRelated: ['create','loadRelated',function(fn,results){
      doSetRelated(fn,req.customer,results.loadRelated);
    }]
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('customers/new',{instance:req.customer});
    }else{
      req.flash('success','添加成功');
      res.redirect('customers/'+req.customer.id);
    }
  });
};

exports.show = function(req, res){
  Q.when(req.customer.getCustomerPapers())
  .then(function(customerPapers){
    res.render('customers/show',{instance:req.customer,customerPapers:customerPapers});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.records = function(req, res, next){
  Q.when(req.customer.getCustomerPapers())
  .then(function(customerPapers){
    res.render('customers/records',{instance:req.customer,customerPapers:customerPapers});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.report = function(req, res){
  var report;
  var customerPapers;
  var sql = "SELECT `KnowledgesQuestions`.`KnowledgeId` as `kid` ," +
            "sum(case when `Wrong` = 1  then 1 else 0 end) as `wcount`,"+
            "count(`Questions`.`id`) as `qcount` "+
            "FROM CustomerPapers,CustomerPapersQuestions,Questions,`KnowledgesQuestions` "+
            "where `CustomerPapers`.`CustomerId`= "+ req.customer.id +
            " AND `CustomerPapersQuestions`.`CustomerPaperId` = `CustomerPapers`.`id` AND `CustomerPapersQuestions`.`QuestionId` = `Questions`.`id` AND `KnowledgesQuestions`.`QuestionId` = `Questions`.`id` GROUP BY `kid`";
  Q.when(req.customer.getCustomerPapers())
  .then(function(cps){
    customerPapers = cps;
    return models.sequelize.query(sql);
  })
  .then(function(results){
    report = results;
    var kids = results.map(function(row){return row.kid;});
    return Q.when(models.Question.findAll({where:
    {
      'KnowledgesQuestions.KnowledgeId': kids,
      'CustomerPapersQuestions.Wrong': 1,
      'CustomerPapers.CustomerId': req.customer.id
    },
      include: ['Knowledge','CustomerPaper']}));
  })
  .then(function(questions){
    res.render('customers/report',{instance: req.customer,questions:questions,report:report,customerPapers:customerPapers});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.edit = function(req, res){
  Q.when(req.customer.getCustomerPapers())
  .then(function(customerPapers){
    res.render('customers/edit',{instance:req.customer,customerPapers:customerPapers});
  })
  .fail(function(error){
    logger.log(error);
    next(error);
  });
};

exports.update = function(req, res){
  var instance = req.param('instance') || {};
  if(!!instance.pass && instance.pass.trim() !== ''){
    instance.Password = utility.encode(instance.pass);
  }
  dataParse(instance);

  async.auto({
    loadRelated: function(fn){
      doLoadRelated(instance,fn);
    },
    update: function(fn){
      req.customer.setAttributes(instance);
      errors = req.customer.validate();
      if(errors){
        logger.log(errors);
        return fn('填写内容错误');
      }
      req.customer.save().done(fn);
    },
    setRelated: ['update','loadRelated',function(fn,results){
      doSetRelated(fn,req.customer,results.loadRelated);
    }]
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('customers/edit',{instance:req.customer});
    }else{
      req.flash('success','更新成功');
      res.redirect('customers/'+req.customer.id);
      // res.render('customers/edit',{instance:req.customer});
    }
  });
};

exports.destroy = function(req, res){
  req.customer.destroy().done(function(err){
    if(err){
      req.flash('error','删除失败!');
    }else{
      req.flash('success','删除成功!');
    }
    res.redirect('back');
  });
};

exports.batchDestroy = function(req,res){
  var ids = req.param('ids');
  if(!ids || ids.length === 0){
    res.redirect('back');
  }
  else{
    models.Customer.findAll({where:{id: ids}}).success(function(collection){
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


exports.batch = function(req,res){
  var ids = req.param('ids'),
    levelId= req.param('levelId');
  if(!ids || !levelId || ids.length === 0){
    res.redirect('back');
  }
  else{
    models.Customer.findAll({where:{id: ids}}).success(function(collection){
      var chainer = new Sequelize.Utils.QueryChainer();
      collection.forEach(function(m) {
          chainer.add(m.updateAttributes({LevelId:levelId}));
      });
      return chainer.run().success(function(){
        req.flash('success','更新成功!');
        res.redirect('back');
      }).fail(function(error){
        logger.log(error);
        res.redirect('back');
      });
    });
  }
};

exports.toggleEnabled = function(req,res){
  req.customer.Enabled = !req.customer.Enabled ;
  req.customer.save().success(function(){
    req.flash('success','更新成功!');
    res.redirect('back');
  }).fail(function(){
    res.redirect('back');
  });
};

exports.load = function(req, id, fn){
  models.Customer.find({where:{id:id},include: ['Level','Grade','Role']}).done(fn);
};