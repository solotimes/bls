/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:56
 */
var extend = require('extend');
var Sequelize = require("sequelize");
var Q = require('q');
var moment = require('moment');
var STATUS = {
 '未处理': 0,
 '需重拍': 4,
 '完成解答': 6,
 '已推送': 7,
 '待上传主观': 9,
 '待批改': 10
};
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('GeneratedPaper', {
      Name: {type:DataTypes.STRING},
      Status: {type:DataTypes.INTEGER, defaultValue: 0},
      CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
      RecordedAt: {type:DataTypes.DATE},
      CodeName: {type:DataTypes.STRING},
      AudioPath: {type:DataTypes.STRING},
      QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0},
      CorrectRate: {type:DataTypes.INTEGER},
      AppliedTime: {type:DataTypes.DATE},
      Report:{type:DataTypes.TEXT},
      Record:{type:DataTypes.STRING}
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
          toJSON: function(){
              var values = this.values;
              values.pics = this.pics; //取paper.pics
              return values;
          },
          update: function(attrs){
            var models = require('../models'),
                self = this;
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
          }
        },
        classMethods: extend({},
          STATUS
          )
      });
};