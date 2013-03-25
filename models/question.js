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
        // Name: {type:DataTypes.STRING},
        Body: {type:DataTypes.TEXT},
        //提干内容缩略 用于搜索
        Excerpt: {type:DataTypes.STRING},
        CreatedAt: {type:DataTypes.DATE},
        // Tags: {type:DataTypes.STRING},
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
        Method: {type: DataTypes.STRING},
        //备注信息
        Description: {type: DataTypes.STRING}
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
        saveInstance: function(attrs,parentModel){
            var models = require('../models');
            var self = this; // Question
            try{
              for(var k in attrs){
                if('object' === typeof attrs[k]){
                  attrs[k] = JSON.stringify(attrs[k]);
                }
              }
            }catch(e){}
            var association;
            var question,qg = models.sequelize.queryInterface.QueryGenerator;
            var p = Q.when(self.upsert(attrs)).then(function(q){
              question = q;
            });
            if(parentModel){
              association = self.getAssociation(parentModel.__factory);
              var accessor = !!attrs._delete ? association.accessors.remove : association.accessors.add;
              p = p.then(function(){
                // return parentModel.addQuestion(question);
                return Q.when(question[accessor](parentModel));
              }).fail(function(error){
                //忽略错误
                logger.log(error);
                return ;
              });
              //更新关系表
              if(!attrs._delete || 'undefined' !== typeof attrs.Wrong || 'undefined' !== attrs.Order){
                p = p.then(function(){
                  var keys = Utils._.keys(association.connectorDAO.primaryKeys);
                  var where = {};
                  where[association.foreignIdentifier]=parentModel.id;
                  where[association.identifier] = question.id;
                  var sql = qg.updateQuery(association.connectorDAO.tableName,
                    {Wrong:attrs.Wrong,Order: attrs.Order}, //set
                    where); //where
                    return Q.when(models.sequelize.query(sql));
                });
              }
            }
            return p.then(function(){return question;});
          }
        }
      });
};