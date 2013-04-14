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
        //可实现性
        Difficulty: {type:DataTypes.INTEGER},
        Level1: {type:DataTypes.STRING},
        Level2: {type:DataTypes.STRING}
    });
}