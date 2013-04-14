/*
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-10
 * Time: 上午10:13
 */
var Sequelize = require("sequelize"),
    config = require('./config'),
    fs = require('fs'),
    async = require('async'),
    utility = require('./routes/logics/utility'),
    mixins = require('./lib/mixins');

var sequelize = new Sequelize(config.db.name, config.db.user, config.db.pass, {
    host:config.db.host,
    define:{
        charset:'utf8',
        collate:'utf8_general_ci',
        timestamps: false,
        classMethods: mixins.globalClassMethods,
        instanceMethods: mixins.globalInstanceMethods
    },
    sync:{force:true},
    syncOnAssociation:true,
    pool:{maxConnections:5, maxIdleTime:30}
});

require('./lib/patch').patchSequelize(sequelize);

var models = {};
fs.readdirSync(__dirname + '/models').forEach(function(name){
    if(name.match(/^\w*\.js$/)){
        var model = sequelize.import(__dirname+'/models/' + name);
        models[model.name]=model;
    }
});

for(var modelName in models){
    var model = models[modelName];
    eval("var " + modelName + " = model;");
}
module.exports = models;
module.exports.sequelize = sequelize;

Customer.belongsTo(Level);
CustomerRole.hasMany(Customer);
Customer.belongsTo(CustomerRole,{as: 'Role'});
Customer.belongsTo(Grade);
Level.hasMany(Customer);
Grade.hasMany(Customer);
Customer.hasMany(GeneratedPaper);
Customer.hasMany(CustomerPaper);
Customer.hasMany(Customer,{as: 'Related'});
CustomerPaper.belongsTo(Customer);
CustomerPaper.belongsTo(Paper);
CustomerPaper.belongsTo(Grade);
CustomerPaper.hasMany(CustomerPaperPic,{as: 'Pics'});
CustomerPaper.hasMany(Question);
Question.hasMany(CustomerPaper);
CustomerPaperPic.belongsTo(CustomerPaper,{as: 'Paper'});
CustomerPaper.belongsTo(Admin,{as: 'AssignedTo'});
Paper.hasMany(Question);
Paper.hasOne(CustomerPaper);
Paper.belongsTo(Grade);
Question.hasMany(Paper);

Admin.hasMany(AdminRole,{as: 'Roles'});
Admin.hasMany(CustomerPaper,{as: 'AssignedPapers'});
AdminRole.hasMany(Admin);
AdminLog.belongsTo(Admin);

Question.hasMany(Knowledge);
CustomerPaper.hasMany(Knowledge);
Paper.hasMany(Knowledge);
Knowledge.hasMany(Question);
Knowledge.hasMany(Paper);
Knowledge.hasMany(CustomerPaper);

GeneratedPaper.belongsTo(Customer);
GeneratedPaper.belongsTo(CustomerPaper);
GeneratedPaper.hasMany(Question);
GeneratedPaper.hasMany(CustomerPaperPic,{as:'Pics'});
CustomerPaperPic.belongsTo(GeneratedPaper);
Question.hasMany(GeneratedPaper);
