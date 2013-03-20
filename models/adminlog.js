/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-3-5
 * Time: 上午11:47
 */
var messages = require('../messages'),
    format = require('util').format;

module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('AdminLog', {
        LogText: {type:DataTypes.TEXT}
    });
}