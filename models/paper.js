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
        Status: {type:DataTypes.INTEGER, defaultValue: 0},
        CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
        RecordedAt: {type:DataTypes.DATE},
        CodeName: {type:DataTypes.STRING},
        AudioPath: {type:DataTypes.STRING},
        QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0},
        //试卷类型 0 增加练习, 1月考, 2期中, 3期末, 4 初三中考模拟, 5中考真题
        Type: {type:DataTypes.INTEGER},
        //0客户上传 1后台录入
        Source: {type:DataTypes.INTEGER}
    });
};