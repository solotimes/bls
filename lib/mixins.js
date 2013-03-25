var extend = require('extend'),
    utility = require('../routes/logics/utility'),
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
});