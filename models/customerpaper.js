/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:17
 */

var extend = require('extend');
var Sequelize = require("sequelize");
var Q = require('q');
var STATUS = {
	'未处理': 0,
	'待标错题': 1,
	'待录错题': 2,
	'待录全卷': 3,
	'需重拍': 4,
  '错题未解答': 5,
  '完成解答': 6,
  '已推送': 7
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
        QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0}
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
          // if(!this.RecordedAt && !attrs.RecordedAt){
          //   //状态0-4
          //   if(attrs.Recapture){
          //     attrs.Status = STATUS['需重拍'];
          //   }else if(this.AdminId){

          //   }
          //   //   attrs.Status = ;
          //   // }
          // }else{
          //   //状态5-7
          // }
        },
        getFullQuestions: function(){
          var models = require('../models');
          return this.getQuestions(models.Question.getFullQuery());
        },
        toJSON: function(){
            var values = this.values;
            values.customer = this.customer;
            values.pics = this.pics;
            values.assignedTo = this.assignedTo;
            try{
              values.Meta = JSON.parse(this.Meta);
            }catch(e){}
            return values;
        }
      },
      classMethods: extend({},
          STATUS
      )
    });
};