var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend');
    async = require('async');

function fetchAdmin(req, res, fn){
   var q = (req.param('q') || '').trim();
   var by = (req.param('by')||'').trim();
   var query,searchParams={},where;
   if(q.length && by.length && (by == 'UserName' || by == 'Email' || by == 'Role')){
    if(by != 'Role'){
      query = {where: [ by+" LIKE ?", "%"+q+"%"]};
    }else{
      query = {};
      where = {'AdminRoles.Name': q};
    }

     searchParams.q=q;
     searchParams.by=by;
   }
   // 若直接使用关联 + 分页查询 实际返回的记录数可能与limit的值不一样
   // 解决方法: 查询两次, 一次取 id 一次取内容
   models.Admin.pageAll(query,req.param('page'),req.param('per'),function(error,idCollection){
      if(error){
        return fn(error);
      }
      // 获取id
      var ids = idCollection.map(function(item){
       return item.id;
      });

     // 获取内容 同时使用 inlude 参数 关联 roles 避免 n+1 查询
    models.Admin.findAll({where:extend({id: ids},where),include:['Roles']}).done(function(error,collection){
       if(error){
          return fn(error);
         // return res.end(error);
       }
       collection.pageVars = idCollection.pageVars;
       fn(null,extend(collection,searchParams));
    });
  });
}

exports.index = {
  json: function(req, res, next){
    fetchAdmin(req,res,function(error,collection){
      if(error){
        return next(error);
      }
      res.send(collection);
    });
  },
  html: function(req, res ,next){
    fetchAdmin(req,res,function(error,collection){
      if(error){
        return next(error);
      }
      res.render('admins/index',{collection: collection});
    });
  }
};

exports['new'] = function(req, res){
  res.render('admins/new',{instance: models.Admin.build(),roles:req.roles});
};

exports.create = function(req, res){
  var roleIds = req.param('roleIds') || [];
  var instance = req.param('instance') || {};
  var password = (instance.pass||'').trim();
  req.admin = models.Admin.build();
  async.auto({
    checkPassword: function(fn){
      if(password.length > 4){
        instance.Password = utility.encode(instance.pass);
        fn();
      }else{
        fn('密码长度不正确');
      }
    },
    create: function(fn){
      req.admin = models.Admin.build(instance);
      errors = req.admin.validate();
      if(errors){
        console.log(errors);
        return fn('填写内容错误');
      }
      req.admin.save().done(fn);
    },
    getRoles: ['create',function(fn){
      models.AdminRole.findAll({where: {id: roleIds}}).done(fn);
    }],
    setRoles: ['getRoles',function(fn,results){
      req.admin.setRoles(results.getRoles).done(fn);
    }]
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('admins/new',{instance:req.admin,roles: req.roles});
    }else{
      req.flash('success','添加');
      res.redirect('admins/'+req.admin.id);
    }
  });
};

exports.show = function(req, res){
  res.render('admins/show',{instance:req.admin});
};

exports.edit = function(req, res){
  res.render('admins/edit',{instance:req.admin});
};

exports.update = function(req, res){
  var roleIds = req.param('roleIds') || [];
  var instance = req.param('instance') || {};
  if(!!instance.pass && instance.pass.trim() !== ''){
    instance.Password = utility.encode(instance.pass);
  }
  async.auto({
    update: function(fn){
      req.admin.setAttributes(instance);
      errors = req.admin.validate();
      if(errors){
        return fn('填写内容错误');
      }
      req.admin.save().done(fn);
    },
    getRoles: ['update',function(fn){
      models.AdminRole.findAll({where: {id: roleIds}}).done(fn);
    }],
    setRoles: ['getRoles',function(fn,results){
      req.admin.setRoles(results.getRoles).done(fn);
    }]
  },function(err,results){
    if(err){
      res.flash('error',err);
      res.render('admins/edit',{instance:req.admin,roles: req.roles});
    }else{
      req.flash('success','更新成功');
      res.redirect('admins/'+req.admin.id);
    }
  });
};

exports.destroy = function(req, res){
  req.admin.destroy().done(function(err){
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
    models.Admin.findAll({where:{id: ids}}).success(function(collection){
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
  models.Admin.find({where:{id:id},include: ['Roles']}).done(fn);
};