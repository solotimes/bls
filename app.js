require('./lib/patch');
var express = require('express');
require('express-resource');
var http = require('http');
var path = require('path');
var config = require('./config');
// var mysql = require('mysql').createConnection({
//         host:config.db.host,
//         user:config.db.user,
//         password:config.db.pass,
//         database:config.db.name
//     });
// var captcha = require('./lib/captcha');
var authentication = require('./lib/authentication');
// var MySQLStore = require('connect-mysql')(express);
var flashify = require('flashify');
var app = express();

require('./helpers')(app);

app.disable('x-powered-by');
GLOBAL.app = module.exports = app;
GLOBAL.config = config;
app.configure(function(){
  app.set('env', config.env);
  app.set('port', config.port);
  app.set('views', __dirname + '/views');
  app.engine('jade',require('then-jade').renderFile);
  app.set('view engine', 'jade');
  // app.engine('ejs', require('ejs-locals'));
  app.use(express.compress());
  app.use(express.favicon());
  app.use(express.logger(config.loggerType));
  app.use(express.bodyParser({
      keepExtensions: true
  }));
  app.use(express.limit(config.maxUpload));
  app.use(express.methodOverride());
  app.use(express.cookieParser(config.cookieKey));
  app.use(express.cookieSession({
      key:config.sessionKey,
      secret:config.sessionSecrect,
      cookie:{path:'/', httpOnly: true, maxAge: 365*24*60*60*1000}
      // store: new MySQLStore({client:mysql})
  }));
  // app.use(captcha({ url: '/captcha.jpg'}));
  app.use(flashify);
  app.use(require('connect-assets')());
  app.use(express.static(path.join(__dirname, 'public')));
  // app.use(express.csrf());
  app.use(authentication);
  app.use(app.router);
  app.use(express.errorHandler());
});

require('./routes/routes_list');
app.listen(3000);
console.log("Express server listening on port " + app.get('port') + " in " + app.get('env') + " mode");