/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-10
 * Time: 下午4:14
 */
var messages = require('../messages'),
    format = require('util').format;

module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Customer', {
        Name: {type:DataTypes.STRING,
            validate:{
                len:{
                    args: [0,6],
                    msg: format(messages.noLongerThan, "姓名", "6")
                }
            }},
        UserName: {type:DataTypes.STRING,
            validate:{
                len:{
                    args:[4, 30],
                    msg:format(messages.lengthBetween, "用户名", "4", "30")
                },
                notNull:{
                    msg:format(messages.notNull, "用户名")
                }
        }},
        Password: {type:DataTypes.STRING,
            validate:{
                len:{
                    args:[6, 255],
                    msg:format(messages.lengthBetween, "密码", "6", "255")
                },
                notNull:{
                    msg:format(messages.notNull, "密码")
                }
        }},
        Email:{type:DataTypes.STRING, validate:{
            notNull:{
               msg:format(messages.notNull, "Email")
            },
            isEmail:{
                msg:format(messages.formatError, "Email")
            }
        }},
        School: {type:DataTypes.STRING},
        Class: {type:DataTypes.STRING},
        CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
        LoginIP: {type:DataTypes.STRING},
        LoginTime: {type:DataTypes.DATE},
        LastLoginIP: {type:DataTypes.STRING},
        LastLoginTime: {type:DataTypes.DATE},
        Enabled: {type:DataTypes.BOOLEAN, defaultValue: true},
        Gender: {type:DataTypes.BOOLEAN},
        Birthday: {type:DataTypes.DATE}
    },{
          instanceMethods: {
            roleText: function(){
                if(this.role)return this.role.Name;
            },
            levelText: function(){
                if(this.level)return this.level.Name;
            },
            gradeText: function(){
                if(this.grade)return this.grade.Name;
            },
            // 转化为json时排除密码
            toJSON: function(){
                var values = this.values;
                delete values.Password;
                values.level = this.level;
                values.grade = this.grade;
                values.role = this. role;
                return values;
            }
          },
        classMethods: require('../lib/pagination').mixin
    });
};