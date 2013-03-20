/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-3-4
 * Time: 上午10:55
 *
 * 知识点
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Knowledge', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    })
}