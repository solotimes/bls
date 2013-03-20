/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-3-4
 * Time: 上午10:54
 *
 * 知识点分类
 */
module.exports = function(sequelize, DataTypes)
{
    return sequelize.define('KnowledgeCategory', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    })
}