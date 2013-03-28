/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:43
 */
 var extend = require('extend');
 var Sequelize = require("sequelize");
 var Q = require('q');
 var moment = require('moment');
 var STATUS = {
  '未处理': 0,
  '待录全卷': 3,
  '完成解答': 6,
  '待完善': 8
};
module.exports = function(sequelize, DataTypes)
{
  return sequelize.define('Paper', {
    Name: {type:DataTypes.STRING},
    Status: {type:DataTypes.INTEGER, defaultValue: 0},
    CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
    RecordedAt: {type:DataTypes.DATE},
    CodeName: {type:DataTypes.STRING},
    AudioPath: {type:DataTypes.STRING},
    QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0},
        //试卷类型 0 增加练习, 1月考, 2期中, 3期末, 4 初三中考模拟, 5中考真题
        Type: {type:DataTypes.INTEGER},
        //0客户上传 1后台录入
        Source: {type:DataTypes.INTEGER}
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
              // values.pics = this.pics; //取paper.pics
              return values;
          }
        },
        classMethods: extend({},
          STATUS
          )
      });
};