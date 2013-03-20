/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-3-4
 * Time: 上午10:20
 */
var messages = require('../messages'),
    format = require('util').format;

module.exports = function(sequelize, DataTypes)
{
    model =  sequelize.define('Admin', {
        Name: {type:DataTypes.STRING,
            validate:{
                len:{
                    args: [0,6],
                    msg: format(messages.noLongerThan, "姓名", "6")
                }
            }},
        UserName: {type:DataTypes.STRING,
            unique: true,
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
        Email:{type:DataTypes.STRING,
            validate:{
                notNull:{
                    msg:format(messages.notNull, "Email")
                },
                isEmail:{
                    msg:format(messages.formatError, "Email")
                }
            }},
        CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
        LoginIP: {type:DataTypes.STRING},
        LoginTime: {type:DataTypes.DATE},
        LastLoginIP: {type:DataTypes.STRING},
        LastLoginTime: {type:DataTypes.DATE}
        },
        {
          instanceMethods: {
            rolesList: function(){
                if(!this.roles) return [];
                return this.roles.map(function(role){ return role.Name;});
            },
            /**
             * 若roles中任一角色符合用户对象的角色,则返回true
             */
            checkRoles: function(roles,scope){
                if(!roles || !roles.length)
                    return false;
                var rolesList = this.rolesList();

                //"管理员" 拥有所有操作的权限
                if(rolesList.indexOf('管理员') != -1)
                    return true;
                //"分配员" 可以操作整个上传试卷部分
                if(rolesList.indexOf('分配员') != -1 && scope =='上传试卷')
                    return true;
                //"试卷库管理员"
                if(rolesList.indexOf('试卷库管理员') != -1 && scope == '试卷库')
                    return true;

                var passed = false;
                roles.forEach(function(role){
                    if(rolesList.indexOf(role) != -1){
                        passed = true;
                    }
                });
                return passed;
            },
            toJSON: function(){
                var values = this.values;
                delete values.Password;
                values.roles = this.roles;
                return values;
            }
          }
    });
    return model;
};