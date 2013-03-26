var extend = require('extend'),
    utility = require('../routes/logics/utility'),
    Sequelize = require('sequelize'),
    Utils = Sequelize.Utils,
		Q = require('q');

exports.globalClassMethods = extend({
	//属性包括id时查找并更新模型 否则验证模型的有效性并添加新记录
	upsert: function(attrs){
    var deferred = Q.defer(),
        reject = deferred.reject.bind(deferred),
        resolve = deferred.resolve.bind(deferred);
    if(attrs.id){
      //update
      this.find(attrs.id).fail(reject).success(function(instance){
        instance.updateAttributes(attrs).done(deferred.makeNodeResolver());
      });
    }else{
      //create
      // attrs = extend(attrs,{CreatedAt: utility.getCurrentTime()});
      var instance = this.build(attrs),
          errors = instance.validate();
      if(errors){
        return reject(errors);
      }else{
        return instance.save().done(deferred.makeNodeResolver());
      }
    }
    return deferred.promise;
  }
},require('./pagination').mixin);

exports.globalInstanceMethods = extend({
  getFullQuestions: function(){
    var models = require('../models');
    var questions;
    //查询试题
    return Q.when(this.getQuestions(models.Question.getFullQuery())).then(function(qs){
      questions = qs;
      var ids = questions.map(function(q){return q.id;});
      //查询知识点
      return models.Question.findAll({
        include: ['Knowledge'],
        where: {id:ids}
      });
    }).then(function(qWithKs){
      //合并两次查询
      questions.forEach(function(q){
        var select = qWithKs.filter(function(qk){return qk.id === q.id;});
        if(!!select && select.length && select[0].knowledges[0].id){
          q.knowledges = select[0].knowledges;
        }
      });
      return questions;
    });
  }
});