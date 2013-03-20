/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-21
 * Time: 上午10:32
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('CustomerRole', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    })
}