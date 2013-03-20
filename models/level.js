/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午4:31
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Level', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    })
}