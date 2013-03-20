/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-1-11
 * Time: 下午2:00
 */

var auth = require('./auth'),
    authorization = require('./logics/authorization'),
    message = require('../messages');

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

var admins = app.resource('admins',require('./controllers/admins'));
admins.map('delete','/',require('./controllers/admins').batchDestroy);
var customers = app.resource('customers',require('./controllers/customers'));
customers.map('delete','/',require('./controllers/customers').batchDestroy);
customers.map('put','toggle_enabled',require('./controllers/customers').toggleEnabled);
customers.map('put','/',require('./controllers/customers').batch);
var levels = app.resource('levels',require('./controllers/levels'));

app.get('/customer_papers/raw/:scope?',require('./controllers/customer_papers').raw);
app.get('/customer_papers/recorded/:scope?',require('./controllers/customer_papers').recorded);
var customer_papers = app.resource('customer_papers',require('./controllers/customer_papers'));
customer_papers.map('delete','/',require('./controllers/customer_papers').batchDestroy);
customer_papers.map('get','/record',require('./controllers/customer_papers').show);
customer_papers.map('get','assign',require('./controllers/customer_papers').assign);
var questions = app.resource('questions',require('./controllers/questions'));

// app.get('/register', authorization.checkNotLogin);
// app.get('/register', auth.register);
// app.post('/register', authorization.checkNotLogin);
// app.post('/register', auth.registerPost);

// app.get('/user', authorization.checkLogin);
// app.get('/user', user.index);

// app.get('/user/upload', authorization.checkLogin);
// app.get('/user/upload', user.upload);
// app.post('/user/upload', authorization.checkLogin);
// app.post('/user/upload', user.uploadPost);

// app.get('/user/uploadPaper', authorization.checkLogin);
// app.get('/user/uploadPaper', user.uploadPaper);
// app.post('/user/uploadPaper', authorization.checkLogin);
// app.post('/user/uploadPaper', user.uploadPaperPost);