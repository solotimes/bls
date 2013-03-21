/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:44
 */
var Q = require('q');
var Sequelize = require('sequelize');
var Utils = Sequelize.Utils;

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
            values.Wrong = this.Wrong;
            values.Order = this.Order;
            return values;
        }
      },
      classMethods: {
        getFullQuery: function(){
          return {
            attributes: Utils._.keys(this.attributes).concat(['Wrong','Order']),
            order: Utils.addTicks('Order')
          };
        },
        saveInstance: function(attrs){
            var models = require('../models');
            var self = this;
            try{
              for(var k in attrs){
                if('object' === typeof attrs[k]){
                  attrs[k] = JSON.stringify(attrs[k]);
                }
              }
            }catch(e){}
            var question;
            var p = Q.when(self.upsert(attrs)).then(function(q){
              question = q;
              return q;
            });

            ['Paper','CustomerPaper'].forEach(function(PaperModel){
              var paperIdKey = 'PaperModel'+'Id',
                  paperId = instance[paperIdKey];
              if(!!paperId){
                p = p.then(function(){
                  return Q.when(models[PaperModel].find(paperId));
                }).then(function(paper){
                  return Q.when(question['add'+PaperModel](paper));
                });
                //更新关系表
                if('undefined' !== typeof attrs.Wrong || 'undefined' !== attrs.Order){
                  // var relationship = attrs.relationship[PaperModel];
                  var where = {};
                  where[paperIdKey]=paperId;
                  where.QuestionId = question.id;
                  var sql = qg.updateQuery(models[PaperModel].tableName+'Questions',
                    {Wrong:attrs.Wrong,Order: attrs.Order}, //set
                    where); //where
                  p = p.then(function(){
                    return Q.when(models.sequelize.query(sql));
                  });
                }
              }
            });
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