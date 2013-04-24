/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:20
 */
var Q = require('q');
var Sequelize = require('sequelize');
var moment = require('moment');

module.exports = function(sequelize, DataTypes){
    return sequelize.define('CustomerPaperPic', {
        PicIndex: {type:DataTypes.INTEGER},
        CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
        PicPath: {type:DataTypes.STRING},
        AudioPath: {type:DataTypes.STRING},
        //需要重拍的标记
        RecaptureMark: {type:DataTypes.BOOLEAN, defaultValue: false}
    },{
      instanceMethods: {
        toJSON: function(){
          var values = this.values;
          values.image = config.uploadPath + this.PicPath;
          values.audio = this.AudioPath ? (config.uploadPath + this.AudioPath) : null;
          for(var k in values){
            if(Sequelize.Utils._.isDate(values[k]))
              values[k]=moment(values[k]).format('YYYY-MM-DD HH:mm:ss');
          }
          return values;
        }
      }
    });
};