/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-15
 * Time: 下午6:04
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('GeneratedPaperResult', {
        Order: {type:DataTypes.INTEGER},
        Answer: {type:DataTypes.TEXT}
    })
}