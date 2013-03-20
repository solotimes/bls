/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-3-4
 * Time: 上午10:21
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('AdminRole', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    })
}