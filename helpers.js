var extend = require('extend');
var moment = require('moment');
var pagination = require('./lib/pagination');
var models = require('./models');
var Utils = require('sequelize').Utils;

module.exports = function(app){
	app.locals = app.locals || [];
	extend(app.locals,{
		moment: moment,
		models: models,
		paginate: pagination.helper,
		utils: Utils
	});
};