/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:43
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('Paper', {
        Name: {type:DataTypes.STRING},
        CreatedAt: {type:DataTypes.DATE},
        UpdatedAt: {type:DataTypes.DATE}
    })
}