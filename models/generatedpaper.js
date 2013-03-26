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
      Status: {type:DataTypes.INTEGER, defaultValue: 0},
      CreatedAt: {type:DataTypes.DATE, defaultValue: DataTypes.NOW},
      RecordedAt: {type:DataTypes.DATE},
      CodeName: {type:DataTypes.STRING},
      AudioPath: {type:DataTypes.STRING},
      QuestionsTotal: {type:DataTypes.INTEGER, defaultValue: 0},
      CorrectRate: {type:DataTypes.INTEGER},
      AppliedTime: {type:DataTypes.DATE},
      Report:{type:DataTypes.TEXT},
      Record:{type:DataTypes.STRING}
    });
};