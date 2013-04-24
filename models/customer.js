/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-10
 * Time: 下午4:14
 */
var messages = require('../messages'),
    format = require('util').format;
var Sequelize = require('sequelize');
var moment = require('moment');

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
        Birthday: {type:DataTypes.DATE},
        MaxPaper: {type:DataTypes.INTEGER},//最大上传
        BeginDate: {type:DataTypes.DATE}, //起始日期
        ExpireDate: {type:DataTypes.DATE}, //过期日期
        StudentNumber: {type:DataTypes.STRING}, //学号
        Dob: {type:DataTypes.DATE},//出生年月
        SchoolType: {type:DataTypes.INTEGER}, //学校类型 0 公立 1私立
        EnrollTime: {type:DataTypes.DATE}, //入学时间
        Mobile: {type:DataTypes.STRING}, //手机号码
        Address: {type:DataTypes.STRING}, //地址
        ZipCode: {type:DataTypes.STRING}, //邮编
        Amount: {type:DataTypes.FLOAT}, //储值金额
        Comment: {type:DataTypes.TEXT} //备注
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
                for(var k in values){
                  if(Sequelize.Utils._.isDate(values[k]))
                    values[k]=moment(values[k]).format('YYYY-MM-DD HH:mm:ss');
                }
                return values;
            }
          },
        classMethods: require('../lib/pagination').mixin
    });
};