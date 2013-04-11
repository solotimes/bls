/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:17
 */

var extend = require('extend');
var Sequelize = require("sequelize");
var Q = require('q');
var moment = require('moment');
var STATUS = {
	'未处理': 0,
	'待标错题': 1,
	'待录错题': 2,
	'待录全卷': 3,
	'需重拍': 4,
  '错题未解答': 5,
  '完成解答': 6,
  '已推送': 7,
  '待完善': 8
};

module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('CustomerPaper', {
        Name: {type:DataTypes.STRING},
        Status: {type:DataTypes.INTEGER, defaultValue: STATUS['未处理']},
        CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
        RecordedAt: {type:DataTypes.DATE},
        CodeName: {type:DataTypes.STRING},
        AudioPath: {type:DataTypes.STRING},
        QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0},
        CorrectRate: {type:DataTypes.INTEGER}
    },{
      instanceMethods: {
        statusText: function(){
          if(undefined === typeof this.Status)
            return '';
          for(var text in STATUS){
            if(STATUS[text] === this.Status)
              return text;
          }
          return '';
        },
        update: function(attrs){
          var models = require('../models'),
              oldStatus = this.Status,
              self = this;

          // var chainer = new Sequelize.Utils.QueryChainer();
          var p = Q.resolve();

          if(attrs.Status == STATUS['需重拍'] && attrs.pics){
              p = p.then(function(){
                return attrs.pics.map(function(pic){
                        return models.CustomerPaperPic.upsert(pic);
                      });
              }).all();
          }

          p = p.then(function(){
            return self.updateAttributes(attrs);
          });

          return p;
        },
        toJSON: function(){
            var values = this.values;
            values.customer = this.customer;
            values.pics = this.pics;
            values.assignedTo = this.assignedTo;
            values.audio = this.AudioPath ? (config.uploadPath + this.AudioPath) : null;
            return values;
        },
        //导出到试卷库
        dump: function(){
          var self = this;
          var models = require('../models');
          var attrs = extend({},this.values);
          delete attrs.CreatedAt;
          delete attrs.id;
          attrs.RecordedAt = moment().format("YYYY-MM-DD HH:mm:ss");
          attrs.CodeName = moment().format('YYYYMDD-X');
          attrs.Source = 0;
          attrs.Status = (this.Status == 6) ? 6 : 8;
          var paper,questions;
          return Q.when(models.Paper.create(attrs)).then(function(p){
            paper = p;
            return self.getFullQuestions();
          }).then(function(qs){
            questions = qs;
            // questions.push(null); //增加reduce操作需要的结束元素
            return questions.reduce(function(p,question){
              return p.then(function(previous){
                return models.Question.saveInstance({
                  id: question.id, //只需要复制id和Order 到paper
                  Order: question.Order
                },paper);
              });
            },Q.resolve());
          }).then(function(){
            return self.setPaper(paper);
          }).then(function(){
            return paper;
          });
        }
      },
      classMethods: extend({},
          STATUS
      )
    });
};