/* Services */


angular.module('paper.services', [])
.config(['$httpProvider',function ($httpProvider) {
  $httpProvider.responseInterceptors.push('myHttpInterceptor');
  var spinnerFunction = function (data, headersGetter) {
    if(data)
      window.showSpinner('sending');
    else
      window.showSpinner('loading');
    return data;
  };
  $httpProvider.defaults.transformRequest.push(spinnerFunction);
}])


// register the interceptor as a service, intercepts ALL angular ajax http calls
.factory('myHttpInterceptor', ['$q','$window',function ($q, $window) {
  return function (promise) {
    return promise.then(function (response) {
      var method = response.config.method;
      if(method === 'GET'){
        window.hideSpinner();
      }else{
        window.showSpinner('success',1000);
      }
      return response;

    }, function (response) {
      window.showSpinner('fail');
      return $q.reject(response);
    });
  };
}])

//试卷相关操作

.factory('paper', ['$http','$window','$q',function (http,window,Q) {
  Paper = function(){
    angular.copy(window.paper,this);
    this.$type = window.paperType || 'CustomerPaper';
    this.GradeId = this.GradeId || (this.customer && this.customer.GradeId);
    this.questions = window.questions || [];
    this.$grades = window.grades;
    if(!this.id){
      this.Status = 3;
      this.Source = 1;
    }
    this.refresh();
    this.reloadQuestions();
  };

  var Type2Path = {
    CustomerPaper: '/customer_papers/',
    Paper: '/papers/',
    GeneratedPaper: '/generated_papers/'
  };

  Paper.prototype.refresh = function(){
    this.$path = Type2Path[this.$type] + (this.id || '');
    this.$questionsPath =  !!this.id ? (this.$path + '/questions') : '/questions';
  };

  Paper.prototype.types = {
                            '增加练习': 0,
                            '月考': 1,
                            '期中': 2,
                            '期末': 3,
                            '初三中考模拟': 4,
                            '中考真题': 5
                          };
  Paper.prototype.save = function(attrs){
    var self = this;
    attrs = attrs || {};
    delete attrs.Status;
    var saveObj = angular.copy(this);
    angular.extend(saveObj,attrs);

    //自动判断状态, 根据保存时设定的参数以及paper当前的状态
    var changeTo = self.checkStatus(attrs,saveObj);
    if(angular.isNumber(changeTo))
      saveObj.Status = changeTo;
    // console.log('changeTo:',changeTo);
    if(saveObj.Status !== 0 && saveObj.Status !== 4 && saveObj.Status !== 2 && !saveObj.RecordedAt){
      saveObj.RecordedAt = new Date();
      // console.log('createdAt:',saveObj.Status);
    }
    saveObj.CorrectRate = this.getCorrectRate();

    var method = !!this.id ? 'put' : 'post';
    return http[method](this.$path,{instance: saveObj}).success(function(res){
      $.extend(true,self,res);
      self.refresh();
    });
  };

  Paper.prototype.dump = function(){
    if(this.dumpable()){
      return http.post(this.$path+'/dump').success(angular.bind(this,function(res){
        this.PaperId = res.id;
      }));
    }
  };

  Paper.prototype.dumpable = function(){
    return this.$type == 'CustomerPaper' && !this.PaperId && (this.Status == 6 || this.Status == 8);
  };

  var _ChnNumbers='一二三四五';
  var _TypeNames = ['选择题','填空题','简答题'];
  var _types;
  Paper.prototype.getQuestionsGroupByTypes = function(){
    if(_types) return _types;
    _types = [ ];
    for(var i = 0,j = 0; i< 3; i++){
      if(this.questionsByType[i].length){
        _types.push({
          order: j,
          value: i,
          long: _ChnNumbers[j] + '、' + _TypeNames[i],
          short: _TypeNames[i],
          questions: this.questionsByType[i]
        });
        j++;
      }
    }
    return _types;
  };

  Paper.prototype.getCorrectRate = function(){
    if(!this.QuestionsTotal){
      return 0;
    }
    var wrongCount = this.questions.filter(function(q){return q.Wrong;}).length;
    return Math.ceil((this.QuestionsTotal-wrongCount)/this.QuestionsTotal * 100);
  };

  Paper.prototype.newQuestion = function(attrs){
    attrs = attrs || {};
    var res = angular.extend({
      Type: 0,// 0 选择题 1 填空题 2主观题
      knowledges: [], //知识点
      Body: "", //提干
      Excerpt: '', //缩略
      Choices: [{},{},{},{}], //答案或选项
      Solution: "", //解题思路
      Difficulty: 3, //难易度 1-5
      Condition: '', //条件
      Method: '',    //问法
      Wrong: false,
      Answer: '',
      Description: ''
    },attrs);
    return res;
  };

  Paper.prototype.savedQuestions = function (){
    var self = this;
    if(!angular.isArray(this.questions)) return 0;
    return this.questions.filter(function(q){
      return !angular.isUndefined(q.id) && !self.isBlank(q.Body);
    }).length;
  };

  Paper.prototype.saveQuestion = function(indexOrQuestion) {
    var question;
    if(angular.isNumber(indexOrQuestion)){
      question = this.questions[indexOrQuestion];
    }else{
      question = indexOrQuestion;
    }
    return http.post(this.$questionsPath,{instance:question}).then(function(res){
      var q = res.data;
      $.extend(true,question,q);
    });
  };

  Paper.prototype.saveAllQuestions = function() {
    var self = this;
    if(self.questions.length){
      return http.post(self.$questionsPath,{instance:self.questions}).then(function(res){
        var qs = res.data;
        if(!qs.length) qs = [qs];
        qs.forEach(function(q,i){
          $.extend(true,self.questions[i],q);
        });
        self.reloadQuestions();
      });
    }
    return Q.when();
  };

  Paper.prototype.removeQuestion = function(indexOrQuestion){
    var question,self=this;
    if(angular.isNumber(indexOrQuestion)){
      question = this.questions[indexOrQuestion];
    }else{
      question = indexOrQuestion;
    }

    var p;
    if(!angular.isUndefined(question.id)){
      question._delete = true;
      p = this.saveQuestion(question);
    }else{
      p = Q.when();
    }

    return p.then(function(){
      self.QuestionsTotal--;
      self.save();
    }).then(function(){
      self.questions.splice(question.Order,1);
      self.questions.forEach(function(q){
        if(q.Order > question.Order){
          q.Order--;
        }
      });
      return self.saveAllQuestions();
    });
  };

  Paper.prototype.moveUpQuestion = function(indexOrQuestion){
    var question,self=this;
    if(angular.isNumber(indexOrQuestion)){
      question = this.questions[indexOrQuestion];
    }else{
      question = indexOrQuestion;
    }
    if(question.Order === 0)
      return;
    var swap = self.questions[question.Order-1];
    swap.Order++;
    question.Order--;
    self.questions.splice(question.Order,2,question,swap);
    return self.saveAllQuestions();
  };

  Paper.prototype.moveDownQuestion = function(indexOrQuestion){
    var question,self=this;
    if(angular.isNumber(indexOrQuestion)){
      question = this.questions[indexOrQuestion];
    }else{
      question = indexOrQuestion;
    }
    if(question.Order >= self.QuestionsTotal-1)
      return;
    var swap = self.questions[question.Order+1];
    swap.Order--;
    question.Order++;
    self.questions.splice(swap.Order,2,swap,question);
    self.reloadQuestions();
    return self.saveAllQuestions();
  };

  Paper.prototype.swapQuestions = function(q1,q2) {
    if(!q1 || !q2)
      return ;
    this.questions[q2.Order]=q1;
    this.questions[q1.Order]=q2;
    var o1 = q1.Order;
    q1.Order = q2.Order;
    q2.Order = o1;
    this.saveAllQuestions();
  };

  Paper.prototype.reloadQuestions = function(){
    this.questionsByType=[[],[],[]];
    // if(this.QuestionsTotal > this.questions.length){
      // 生成空题
      var questions = [];
      for(var i = 0,j=0; i < this.QuestionsTotal ; i++){
        if(j >= this.questions.length || i < this.questions[j].Order){
          questions.push(this.newQuestion({Order:i}));
        }else{
          questions.push(this.questions[j++]);
        }
        // if(!questions[i]._delete)
        this.questionsByType[questions[i].Type].push(questions[i]);
      }
      this.questions = questions;
      _types = null;
    // }
  };
  Paper.prototype.needRecapture = function() {
    var mark = false;
    try{
      mark = (this.pics.filter(function(pic){
        return pic.RecaptureMark;
      }).length !== 0);
    }catch(err){
      mark= false;
    }
    return mark;
  };

  /**
  * 工具方法,检查变量是否为逻辑空值
  */
  var testElement = $('<div></div>');
  Paper.prototype.isBlank = function(val){
    try{
      if(angular.isString(val)){
        return testElement.html(val).text().trim().length === 0;
      }else if(angular.isArray(val)){
        return val.length === 0;
      }
      return !val;
    }catch(e){
      return false;
    }
  };

  Paper.prototype.isAllWrongQuestionsSolved = function(){
    var select = this.questions.filter(function(q){
      return q.Wrong && $(q.Solution||'').text().trim().length === 0;
    });
    return select.length === 0;
  };

  //检查所有问题是否都已完善
  Paper.prototype.isAllQuestionFinished = function(){
    var self = this;
    var select = this.questions.filter(function(q){
      return !self.isQuestionFinished(q);
    });
    return select.length === 0;
  };

  Paper.prototype.isQuestionFinished = function(question){
    var res =  !!question.id &&
           !this.isBlank(question.Body) &&
           !this.isBlank(question.Solution) &&
           !this.isBlank(question.Condition) &&
           !this.isBlank(question.Method) &&
           !this.isBlank(question.Answer) &&
           !this.isBlank(question.knowledges);
    // console.log(question.Order,'Body',!this.isBlank(question.Body));
    // console.log(question.Order,'Solution',!this.isBlank(question.Solution));
    // console.log(question.Order,'Condition',!this.isBlank(question.Condition),question.Condition);
    // console.log(question.Order,'Method',!this.isBlank(question.Method),question.Method);
    // console.log(question.Order,'Answer',!this.isBlank(question.Answer),question.Answer);
    // console.log(question.Order,'knowledges',!this.isBlank(question.knowledges));
    // console.log('#########');
    return res;
  };

  Paper.prototype.checkStatus = function(params){
    for( var s = 0 ; s < 9 ;s ++){
      if(!!this.readyFor(s,params))
        return s;
    }
    return false;
  };

   // '未处理',0
   //     =>  '需重拍',4
   //     =>  '待标错题',1   =>  '完成解答',6
   //     =>  '待录错题',2,  *=>  '错题未解答',5 => '待完善',8  =>  '完成解答',6
   //                       *=>  '待录全卷',3  => '待完善',8  =>  '完成解答',6
   // '已推送',7
  Paper.prototype.readyFor = function(s,params){
    var savedQuestions = this.savedQuestions();
    var wrongQuestionsUnSolved = !this.isAllWrongQuestionsSolved();
    var allQuestionFinished = this.isAllQuestionFinished();
    var needRecapture = this.needRecapture();
    params = params || {};
    // console.log(angular.copy(params));
    switch(s){
      // 待标错题
      case 1:
        return (this.Status === 2 && params.copyed) &&
                savedQuestions > 0 &&
                savedQuestions === this.QuestionsTotal;
      // 待录错题
      case 2:
        return (this.Status === 0 &&
                (this.QuestionsTotal > 0 && savedQuestions < this.QuestionsTotal) &&
                this.AdminId &&
                !needRecapture);
      // 错题未解答
      case 5:
        return ((this.Status === 2 && params.finishWrongRecord) &&
                savedQuestions > 0 &&
                wrongQuestionsUnSolved);
      // 待录全卷
      case 3:
        return ((this.Status === 2 && params.finishWrongRecord) || this.Status === 5) &&
                savedQuestions > 0 &&
                savedQuestions < this.QuestionsTotal &&
                !wrongQuestionsUnSolved &&
                !allQuestionFinished;
      // 需重拍
      case 4:
        return (this.Status === 0 && needRecapture);
      // 完成解答
      case 6:
        // console.log(allQuestionFinished);
        return (this.Status === 1 || this.Status === 3 ||
                this.Status === 5 || this.Status === 8 ||
                (this.Status === 2 && params.finishWrongRecord)) &&
               allQuestionFinished;
      // 待完善
      case 8:
        // console.log('finishWrongRecord:',params.finishWrongRecord);
        return (this.Status === 3 || this.Status === 5 ||
               (this.Status === 2 && params.finishWrongRecord)) &&
              savedQuestions == this.QuestionsTotal &&
              !allQuestionFinished;
      //已推送
      case 7:
        return (this.Status === 3 || this.Status === 8 || this.Status === 6) && params.pushed;
      default:
        return false;
    }
  };

  Paper.prototype.readyForEither = function(statusList,params){
    if(!statusList || !statusList.length)
      return false;
    for(var i in statusList){
      if(this.readyFor(statusList[i],params)){
        return true;
      }
    }
    return false;
  };

  Paper.prototype.readyForAll = function(statusList,params) {
    if(!statusList || !statusList.length)
      return false;
    for(var i in statusList){
      if(!this.readyFor(statusList[i],params)){
        return false;
      }
    }
    return true;
  };

  Paper.prototype.changeStatus = function(status,force){
    var deferred = Q.defer();
    if(force || this.readyFor(status)){
      return this.save({Status: status});
    }
    window.setTimeout(function(){deferred.reject('无法改变到指定状态');},0);
    return deferred.promise;
  };

  Paper.prototype.finish = function() {
    this.save();
  };

  Paper.prototype.GradeName = function(){
    var self = this;
    try{
      return this.$grades.filter(function(g){return self.GradeId == g.id;})[0].Name;
    }catch(e){
      return '';
    }
  };

  return new Paper();
}])
.factory('knowledgeTree', ['$http','$window','$q','$rootScope',function (http,window,Q,rootScope) {
  // var knowledges;
  function Tree(){
    var self = this;
    http.get('/knowledge-tree.json').success(function(data){
      angular.copy(data, self);
      http.get('/knowledges').success(function(data){
        self.knowledges = data;
      });
    });
  }

  Tree.prototype.find = function(id){
    if(!this.knowledges){
      return;
    }
    var select = this.knowledges.filter(function(knowledge){
      return knowledge.id == id;
    });
    if(select && select.length)
      return select[0];
    return;
  };
  rootScope.knowledgeTree = new Tree();
  return rootScope.knowledgeTree;
}])
;