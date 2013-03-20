/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午5:56
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('GeneratedPaper', {
        Name: {type:DataTypes.STRING},
        AppliedTime: {type:DataTypes.DATE},
        CreatedAt:{type:DataTypes.DATE},
        Report:{type:DataTypes.TEXT},
        Record:{type:DataTypes.STRING}
    })
}