var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend');
    async = require('async');
exports.index = function(req, res ,next){
  models.Knowledge.all().success(function(knowledges){
    res.send(knowledges);
  }).fail(function(err){
    logger.log(err);
    next(err);
  });
};