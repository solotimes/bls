var extend = require('extend');
var moment = require('moment');
var pagination = require('./lib/pagination');
var models = require('./models');

module.exports = function(app){
	app.locals = app.locals || [];
	extend(app.locals,{
		moment: moment,
		models: models,
		paginate: pagination.helper
	});
};