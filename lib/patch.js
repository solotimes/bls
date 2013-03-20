require("sequelize").Utils.CustomEventEmitter.prototype.then =  function(fct,err) {
    this.on('error', err).on('success', fct );
    return this;
};
var q = require('q');
q.end = q.done;


var Utils     = require("sequelize").Utils,DataTypes = {
  STRING: 'VARCHAR(255)',
  TEXT: 'TEXT',
  INTEGER: 'INTEGER',
  DATE: 'DATETIME',
  BOOLEAN: 'TINYINT(1)',
  FLOAT: 'FLOAT',
  NOW: 'NOW'
},
util      = require("util");

exports.patchSequelize = function(sequelize){
  sequelize.getQueryInterface().QueryGenerator.selectQuery= function(tableName, options) {
    var query = "SELECT <%= attributes %> FROM <%= table %>",
     table = null;

    options            = options || {};
    options.table      = table = Array.isArray(tableName) ? tableName.map(function(tbl){ return Utils.addTicks(tbl); }).join(", ") : Utils.addTicks(tableName);
    options.attributes = options.attributes && options.attributes.map(function(attr){
      if(Array.isArray(attr) && attr.length == 2) {
        return [attr[0], Utils.addTicks(attr[1])].join(' as ');
      } else {
        return attr.indexOf(Utils.TICK_CHAR) < 0 ? Utils.addTicks(attr) : attr;
      }
    }).join(", ");
    options.attributes = options.attributes || '*';

    if (options.include) {
      var optAttributes = [options.table + '.*'];

      for (var daoName in options.include) {
        if (options.include.hasOwnProperty(daoName)) {
          var dao         = options.include[daoName]
            , daoFactory  = dao.daoFactoryManager.getDAO(tableName, {
                attribute: 'tableName'
              })
            , _tableName  = Utils.addTicks(dao.tableName)
            , association = dao.getAssociation(daoFactory);

          if (association.connectorDAO) {
            var foreignIdentifier = Utils._.keys(association.connectorDAO.rawAttributes).filter(function(attrName) {
              return (!!attrName.match(/.+Id$/) || !!attrName.match(/.+_id$/)) && (attrName !== association.identifier);
            })[0]

            query += ' LEFT OUTER JOIN ' + Utils.addTicks(association.connectorDAO.tableName) + ' ON ';
            query += Utils.addTicks(association.connectorDAO.tableName) + '.';
            query += Utils.addTicks(foreignIdentifier) + '=';
            query += Utils.addTicks(table) + '.' + Utils.addTicks('id');

            query += ' LEFT OUTER JOIN ' + Utils.addTicks(dao.tableName) + ' ON ';
            query += Utils.addTicks(dao.tableName) + '.';
            query += Utils.addTicks('id') + '=';
            query += Utils.addTicks(association.connectorDAO.tableName) + '.' + Utils.addTicks(association.identifier);
          } else {
            query += ' LEFT OUTER JOIN ' + Utils.addTicks(dao.tableName) + ' ON ';
            query += Utils.addTicks(association.associationType === 'BelongsTo' ? dao.tableName : tableName) + '.';
            query += Utils.addTicks(association.identifier) + '=';
            query += Utils.addTicks(association.associationType === 'BelongsTo' ? tableName : dao.tableName) + '.' + Utils.addTicks('id');
          }

          var aliasAssoc = daoFactory.getAssociationByAlias(daoName),
           aliasName  = !!aliasAssoc ? Utils.addTicks(daoName) : _tableName;

          optAttributes = optAttributes.concat(
            Utils._.keys(dao.attributes).map(function(attr) {
              return '' +
                [_tableName, Utils.addTicks(attr)].join('.') +
                ' AS ' +
                Utils.addTicks([aliasName, attr].join('.'));
            })
          );
        }
      }

      options.attributes = optAttributes.join(', ');
    }

    if(options.addAttributes){
      options.attributes += (' , ' + options.addAttributes);
    }

    if(options.join) {
      query += options.join;
    }
    if(options.where) {
      options.where = this.getWhereConditions(options.where, tableName);
      query += " WHERE <%= where %>";
    }

    if(options.group) {
      options.group = Utils.addTicks(options.group);
      query += " GROUP BY <%= group %>";
    }

    if(options.order) {
      query += " ORDER BY <%= order %>";
    }


    if(options.limit && !(options.include && (options.limit === 1))) {
      if(options.offset) {
        query += " LIMIT <%= offset %>, <%= limit %>";
      } else {
        query += " LIMIT <%= limit %>";
      }
    }

    query += ";";

    return Utils._.template(query)(options);
  };
};