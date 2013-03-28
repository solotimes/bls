/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-11
 * Time: 下午2:00
 */

var auth = require('./auth'),
    authorization = require('./logics/authorization'),
    message = require('../messages'),
    controllers = require('require-all')({
      dirname     :  __dirname + '/controllers',
      filter      :  /(.+)\.js$/,
      excludeDirs :  /^\.(git|svn)$/
    });

app.get('/', function(req,res){
  var to = req.redirectByRole([
    [['分配员','录入员','标错题','推送'],'/customer_papers'],
    [['试卷库题库管理','老师'],'/papers'],
    [['管理员'],'/customers']
  ]);
  res.redirect(to);
});

app.get('/login', auth.login);
app.post('/login', auth.loginPost);
app.get('/logout', authorization.checkLogin);
app.get('/logout', auth.logout);

var admins = app.resource('admins',controllers.admins);
admins.map('delete','/',controllers.admins.batchDestroy);
var customers = app.resource('customers',controllers.customers);
customers.map('delete','/',controllers.customers.batchDestroy);
customers.map('put','toggle_enabled',controllers.customers.toggleEnabled);
customers.map('put','/',controllers.customers.batch);
var levels = app.resource('levels',controllers.levels);

app.get('/customer_papers/raw/:scope?',controllers.customer_papers.raw);
app.get('/customer_papers/recorded/:scope?',controllers.customer_papers.recorded);
var customer_papers = app.resource('customer_papers',controllers.customer_papers);
customer_papers.map('delete','/',controllers.customer_papers.batchDestroy);
customer_papers.map('post','dump',controllers.customer_papers.dump);

// app.get('/customer_papers/:customer_paper_id/questions.:format?',controllers.questions.index);
var questions = app.resource('questions',controllers.questions);
customer_papers.add(questions);

var knowledges = app.resource('knowledges',controllers.knowledges);
var uploads = app.resource('uploads',controllers.uploads);