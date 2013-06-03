var extend = require('extend');
var Sequelize = require('sequelize');
var Utils = Sequelize.Utils;
var qs = require('querystring');

function paginate (count, nPerPage, pageNumber, opts) {
  var dots, link, n, n_display, output, page_links, settings = {};
  opts = opts || {};
  settings['base'] = '%_%';
  settings['format'] = '?page=%#%';
  settings['total'] = parseInt(Math.ceil(count / nPerPage),10);
  settings['current'] = parseInt(pageNumber,10);
  settings['show_all'] = false;
  settings['prev_next'] = true;
  settings['prev_text'] = '&laquo';
  settings['next_text'] = '&raquo';
  settings['end_size'] = 10;
  settings['mid_size'] = 10;
  settings['add_args'] = parseAdditionalArgs(opts.add_args || '');
  page_links = [];
  dots = false;
  if (settings['prev_text'] && settings['current'] && 1 < settings['current']) {
    link = settings["base"].replace("%_%", settings["format"]);
    link = link.replace("%#%", settings["current"] - 1);
    page_links.push('<li><a class="prev" href="' + link + settings["add_args"] + '">' + settings["prev_text"] + '</a></li>');
  }
  for (n=1; n <= settings["total"]; n++) {
    n_display = n;
    if (n === settings["current"]) {
      page_links.push('<li class="active">' + n_display + '</li>');
      dots = true;
    } else {
      if (settings["show_all"] || (n <= settings["end_size"] || (settings["current"] && n >= settings["current"] - settings["mid_size"] && n <= settings["current"] + settings["mid_size"]) || n > settings["total"] - settings["end_size"])) {
        link = settings["base"].replace("%_%", settings["format"]);
        link = link.replace("%#%", n);
        page_links.push('<li><a href="' + link + settings["add_args"] + '">' + n_display + '</a></li>');
        dots = true;
      } else if (dots && !settings["show_all"]) {
        page_links.push('<li class="disabled"><a href="#">&#8230;</a></li>');
        dots = false;
      }
    }
  }
  if (settings["prev_next"] && settings["current"] && (settings["current"] < settings["total"] || -1 === settings["total"])) {
    link = settings["base"].replace("%_%", settings["format"]);
    link = link.replace("%#%", parseInt(settings["current"],10) + 1);
    page_links.push('<li><a class="next" href="' + link + settings["add_args"] + '">' + settings["next_text"] + '</a></li>');
  }
  return '<div class="pages"><ul>' + page_links.join("\n") + '</ul></div>';
}

function parseAdditionalArgs(args){
  return args === ''? args: '&'+qs.stringify(args);
}

module.exports = {
  helper: function(collection,options){
    options = options || {};
    if(!collection || !collection.pageVars)
      return;
    var actionStr = options.action ? "action = '"+options.action+"'" : '';
    var pageVars = collection.pageVars;
    var output = '共'+ pageVars.total + '条记录';
    options.params = extend({per: pageVars.per,q: collection.q, by: collection.by},options.params);

    output += '<form method="get" '+actionStr+'>每页显示<input type="text" name="per" value="'+ pageVars.per +'"/>条记录';
    for(var k in options.params){
      if(k !='per' && options.params[k])
        output += '<input type="hidden" name="'+k+'" value="'+ options.params[k] +'"/>';
    }
    output += '</form>';
    if(pageVars.totalPages > 1){
      output += paginate(pageVars.total,pageVars.per,pageVars.page,{add_args:options.params});
    }
    return output;
  },
  mixin: {
    _countTotal: function(options){
      options = Utils._.extend({ attributes: [] }, options || {});
      if(options.countAttributes)
        options.attributes.push(['count('+options.countAttributes+')', 'count']);
      else
        options.attributes.push(['count(*)', 'count']);
      options.parseInt = true;
      return this.QueryInterface.rawSelect(this.tableName, options, 'count');
    },
    pageAll: function(query,page,per,fn){
      var pageVars = {};
      query = query || {};
      pageVars.page = page || 1;
      pageVars.per = per || 20;
      pageVars.offset = (pageVars.page -1) * pageVars.per;
      var self = this;
      self._countTotal({
        where: query.where,
        join: query.countJoin,
        countAttributes: query.countAttributes
      }).done(function(error,c){
        if(error){
          return fn(error,null);
        }
        pageVars.total = c;
        pageVars.totalPages = Math.ceil(pageVars.total / pageVars.per);
        extend(query,{offset: pageVars.offset, limit: pageVars.per});
        self.findAll(query).done(function(error,collection){
          if(error){
            fn(error,null);
          }else{
            collection = collection || [];
            collection.pageVars = pageVars;
            fn(null,collection);
          }
        });
      });
    }
  }
};