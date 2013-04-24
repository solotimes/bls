/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:44
 */
var Q = require('q');
var Sequelize = require('sequelize');
var Utils = Sequelize.Utils;
var extend = require('extend');
var STATUS = {
  '未解答': 5,
  '完成解答': 6,
  '待完善': 8
};
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Question', {
        // Name: {type:DataTypes.STRING},
        Body: {type:DataTypes.TEXT},
        //提干内容缩略 用于搜索
        Excerpt: {type:DataTypes.STRING},
        UpdatedAt: {type:DataTypes.DATE ,defaultValue: DataTypes.NOW},
        CreatedAt: {type:DataTypes.DATE ,defaultValue: DataTypes.NOW},
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
        Description: {type: DataTypes.STRING},
        //状态 5未解答 8待完善 6完成解答
        Status: {type: DataTypes.INTEGER, defaltValue: 5}
    },{
      instanceMethods:{
        statusText: function(){
          if(undefined === typeof this.Status)
            return '';
          for(var text in STATUS){
            if(STATUS[text] === this.Status)
              return text;
          }
          return '';
        },
        toJSON: function(){
            var values = this.values;
            try{
              values.Choices = JSON.parse(this.Choices);
            }catch(e){}
            values.Wrong = this.Wrong;
            values.Order = this.Order;
            values.knowledges = this.knowledges;
            for(var k in values){
              if(Sequelize.Utils._.isDate(values[k]))
                values[k]=moment(values[k]).format('YYYY-MM-DD HH:mm:ss');
            }
            return values;
        }
      },
      classMethods: extend({
        getFullQuery: function(){
          return {
            attributes: Utils._.keys(this.attributes).concat(['Wrong','Order']),
            order: Utils.addTicks('Order')
          };
        },
        saveInstance: function (attrs,parentModel){
            var models = require('../models');
            var self = this; // Question
            try{
                // [''].forEach(function(key){
                //   if('object' === typeof attrs[k]){
                //     attrs[k] = JSON.stringify(attrs[k]);
                //   }
              if(Utils._.isArray(attrs.Choices))
                attrs.Choices = JSON.stringify(attrs.Choices);
            }catch(e){}
            attrs.UpdatedAt = (new Date());
            var association;
            var question,qg = models.sequelize.queryInterface.QueryGenerator;
            var p = Q.when(self.upsert(attrs)).then(function(q){
              question = q;
            });
            if(parentModel){
              //保存各类试卷关联
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
            if(attrs.knowledges){
              //保存知识点
              p = p.then(function(){
                var ids = attrs.knowledges.map(function(k){
                  return k.id;
                });
                return models.Knowledge.findAll({where:{id: ids}});
              }).then(function(knowledges){
                return question.setKnowledges(knowledges);
              });
            }
            return p.then(function(){return question;});
          }
        },STATUS,{
          Types:{
            0: '选择题',
            1: '填空题',
            2: '主观题'
          }
        })
      });
};