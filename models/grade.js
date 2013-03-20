/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-21
 * Time: 上午10:43
 */
module.exports = function(sequelize, DataTypes){
    return sequelize.define('Grade', {
        Name: {type:DataTypes.STRING},
        Order: {type:DataTypes.INTEGER}
    });
};