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
        //试卷类型 增加练习,月考,期中,期末,初三中考模拟,中考真题
        Type: {type:DataTypes.INTEGER},
        CorrectRate: {type:DataTypes.INTEGER}
    });
};