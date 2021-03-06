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
    [['分配员'],'/customer_papers/raw'],
    [['标错题'],'/customer_papers/raw/%E5%BE%85%E6%A0%87%E9%94%99%E9%A2%98'],
    [['录入员'],'/customer_papers/raw/%E5%BE%85%E5%BD%95%E9%94%99%E9%A2%98'],
    [['推送'],'/customer_papers/recorded'],
    [['试卷库题库管理','老师'],'/papers'],
    [['管理员'],'/customers']
  ]);
  res.redirect(to);
});

app.get('/login', auth.login);
app.post('/login', auth.loginPost);
app.get('/logout', auth.logout);

app.get('/admins/inputers',controllers.admins.inputers);
var admins = app.resource('admins',controllers.admins);
admins.map('delete','/',controllers.admins.batchDestroy);
var customers = app.resource('customers',controllers.customers);
customers.map('delete','/',controllers.customers.batchDestroy);
customers.map('put','toggle_enabled',controllers.customers.toggleEnabled);
customers.map('put','/',controllers.customers.batch);
customers.map('get','records',controllers.customers.records);
customers.map('get','report',controllers.customers.report);
var levels = app.resource('levels',controllers.levels);

app.get('/customer_papers/raw/:scope?',controllers.customer_papers.raw);
app.get('/customer_papers/recorded/:scope?',controllers.customer_papers.recorded);
var customer_papers = app.resource('customer_papers',controllers.customer_papers);
customer_papers.map('delete','/',controllers.customer_papers.batchDestroy);
customer_papers.map('put','/',controllers.customer_papers.assign);
customer_papers.map('post','dump',controllers.customer_papers.dump);

app.get('/papers/scope/:scope?',controllers.papers.scope);
var papers = app.resource('papers',controllers.papers);
papers.map('get','print',controllers.papers.print);
papers.map('delete','/',controllers.papers.batchDestroy);
papers.map('post','/filter',controllers.papers.filter);

app.get('/generated_papers/scope/:scope?',controllers.generated_papers.scope);
var generated_papers = app.resource('generated_papers',controllers.generated_papers);

// app.get('/customer_papers/:customer_paper_id/questions.:format?',controllers.questions.index);
customer_papers.add(app.resource('questions',controllers.questions));
papers.add(app.resource('questions',controllers.questions));
generated_papers.add(app.resource('questions',controllers.questions));

app.get('/questions/wrong',controllers.questions.wrong);
app.get('/questions/scope/:scope?',controllers.questions.index.html);
var questions = app.resource('questions',controllers.questions);
questions.map('delete','/',controllers.questions.batchDestroy);
questions.map('get','statistics',controllers.questions.statistics);

var knowledges = app.resource('knowledges',controllers.knowledges);
var uploads = app.resource('uploads',controllers.uploads);

app.get('/statistics/',controllers.statistics.report1);
for(var action in controllers.statistics){
  app.get('/statistics/'+action, controllers.statistics[action]);
}

var settings = app.resource('settings',controllers.settings);
