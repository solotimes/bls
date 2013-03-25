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
    this.$type = 'CustomerPaper';
    this.GradeId = this.GradeId || (this.customer && this.customer.GradeId);
    this.questions = window.questions || [];
    this.$path = '/customer_papers/'+this.id;
    this.$questionsPath = this.$path + '/questions';
    this.$grades = window.grades;

    this.reloadQuestions();
  };

  Paper.prototype.save = function(attrs){
    var self = this;
    var saveObj = angular.copy(this);
    if(attrs)
      angular.extend(saveObj,attrs);
    if(!attrs || !attrs.Status){
      delete saveObj.Status;
    }
    if(this.Status !== 0 && this.Status !== 4 && this.Status !== 2 && !saveObj.RecordedAt){
      saveObj.RecordedAt = new Date();
    }
    saveObj.CorrectRate = this.getCorrectRate();
    return http.put(this.$path,{instance: saveObj}).success(function(res){
      $.extend(true,self,res);
    });
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
    return  angular.extend({
      Type: 0,// 0 选择题 1 填空题 2主观题
      knowledges: [], //知识点
      Body: "", //提干
      Excerpt: '', //缩略
      Choices: [{},{},{},{}], //答案或选项
      Solution: "", //解题思路
      Difficulty: 3, //难易度 1-5
      Condition: '', //条件
      Method: '',    //问法
      Wrong: false
    },attrs);
  };

  Paper.prototype.savedQuestions = function (){
    if(!angular.isArray(this.questions)) return 0;
    return this.questions.filter(function(q){
      return !angular.isUndefined(q.id);
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
    if(this.questions.length){
      return http.post(this.$questionsPath,{instance:this.questions}).then(function(res){
        var qs = res.data;
        if(!qs.length) qs = [qs];
        qs.forEach(function(q,i){
          $.extend(true,this.questions[i],q);
        });
        this.reloadQuestions();
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
    // self.questions.forEach(function(q,i){
      // console.log(i,q.id,q.Order);
    // });
    // self.questions.splice(question.Order,1);
    // console.log('del',question.id,question.Order,question);
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

  Paper.prototype.isAllWrongQuestionsSolved = function(){
    var select = this.questions.filter(function(q){
      return q.Wrong && $(q.Solution||'').text().trim().length === 0;
    });
    return select.length === 0;
  };

  Paper.prototype.readyFor = function(s){
    switch(s){
      case 1:
        return (this.Status === 0 || this.Status == 2 && this.savedQuestions() === this.QuestionsTotal);
      case 2:
        return (this.Status === 0 && this.AdminId);
      case 3:
        return (this.Status === 1 || this.Status === 2 && this.savedQuestions()!==0);
      case 4:
        return (this.Status === 0 && this.needRecapture());
      case 5:
        return (this.Status === 1 || this.Status === 3 && !this.isAllWrongQuestionsSolved());
      case 6:
        return (this.Status === 1 || this.Status === 3 || this.Status === 5 && this.isAllWrongQuestionsSolved());
    }
  };
  Paper.prototype.readyForStatus = function(/*status*/){
    var statusList = arguments;
    if(!statusList.length)
      return false;
    for(var i in statusList){
      if(this.readyFor(statusList[i])){
        return true;
      }
    }
    return false;
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
    if(this.readyFor(5)){
      if(window.confirm('有错题未解答,将试卷状态更改为"错题未解答"'))
        return this.save({Status:5});
    }else if(this.readyFor(6)){
      if(window.confirm('全部错题都已解答, 将试卷状态更改为"完成解答."'))
        return this.save({Status:6});
    }else if(this.Status ===6 ){
      this.save();
    }
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
}]);