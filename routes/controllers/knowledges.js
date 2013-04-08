var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend');
    async = require('async');
exports.index = function(req, res ,next){
  var query;
  var q = (req.param('q') || '').trim();
  if(q.length)
    query = models.Knowledge.findAll({
      where: ['Name LIKE ?','%'+q+'%']
    });
  else
    query = models.Knowledge.all();
  query.success(function(knowledges){
    res.send(knowledges);
  }).fail(function(err){
    logger.log(err);
    next(err);
  });
};