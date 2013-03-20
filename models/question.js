/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:44
 */
var Q = require('q');

module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Question', {
        Name: {type:DataTypes.STRING},
        Body: {type:DataTypes.TEXT},
        //提干内容缩略 用于搜索
        Excerpt: {type:DataTypes.STRING},
        CreatedAt: {type:DataTypes.DATE},
        Tags: {type:DataTypes.STRING},
        //类型  0 选择题 1 填空题 2主观题
        Type: {type:DataTypes.INTEGER},
        //选择题选项 text/json
        Choices: {type:DataTypes.TEXT},
        //答案
        Answer: {type:DataTypes.TEXT},
        //解答
        Solution: {type:DataTypes.TEXT},
        //条件
        Condition: {type:DataTypes.STRING},
        //难易度 1-5
        Difficulty: {type:DataTypes.INTEGER},
        //问法
        Method: {type: DataTypes.STRING}
    },{
      instanceMethods:{
        toJSON: function(){
            var values = this.values;
            try{
              values.Choices = JSON.parse(this.Choices);
            }catch(e){}
            return values;
        }
      },
      classMethods: {
        createInstance: function(instance){
            var models = require('../models');
            var self = this;
            try{
              for(var k in instance){
                if('object' === typeof instance[k]){
                  instance[k] = JSON.stringify(instance[k]);
                }
              }
            }catch(e){}
            var question;
            var p = Q.when(self.upsert(instance)).then(function(q){
              question = q;
              return q;
            });
            if(!!instance.CustomerPaperId){
              p = p.then(function(){
                return Q.when(models.CustomerPaper.find(instance.CustomerPaperId));
              }).then(function(paper){
                return Q.when(question.addCustomerPaper(paper));
              }).fail(function(errors){
                if(errors[0].code == 'ER_DUP_ENTRY'){
                  return;
                }
              });
            }
            // if(!!instance.PaperId){
            //   p = p.then(function(){
            //     return Q.when(models.Paper.find(instance.PaperId));
            //   }).then(function(paper){
            //     return question.addPaper(paper);
            //   }).fail(function(errors){
            //     if(errors[0].code == 'ER_DUP_ENTRY'){
            //       return;
            //     }
            //   });
            // }
            return p.then(function(){return question;});
          }
        }
      });
};