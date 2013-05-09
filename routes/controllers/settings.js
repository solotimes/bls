var models = require('../../models'),
    Sequelize = require('sequelize'),
    utility = require('../logics/utility'),
    extend = require('extend'),
    Q = require('q'),
    Utils = Sequelize.Utils;

exports.index = function(req,res){
  res.render('settings/index');
};

exports.create = function(req,res){
  var settings = req.param('settings');
  if(!settings || !settings.length)
    return res.redirect('back');
  settings.forEach(function(setting){
    models.Settings.set(setting.key,(setting.value || '').trim().replace(/\r/g,'').split('\n'));
  });
  res.redirect('back');
};