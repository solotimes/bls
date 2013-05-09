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
      if(method != 'GET')
        window.showSpinner('fail');
      return $q.reject(response);
    });
  };
}])

//试卷相关操作

.factory('paper', ['$http','$window','$q','$rootScope','$filter',function (http,window,Q,rootScope,$filter) {
  Paper = function(attrs,type,questions,grades,conditions,methods){
    angular.copy(attrs,this);
    this.$type = type || 'CustomerPaper';
    this.GradeId = this.GradeId || (this.customer && this.customer.GradeId);
    this.questions = questions || [];
    this.$grades = grades;
    this.$conditions = conditions;
    this.$methods = methods;

    if($type == 'GeneratedPaper'){
      this.QuestionsTotal = questions.length;
    }
    if(!this.id){
      this.Status = 3;
      this.Source = 1;
    }
    this.refresh();
    if(this.id)
      this.reloadQuestions();
  };

  var Type2Path = {
    CustomerPaper: '/customer_papers/',
    Paper: '/papers/',
    GeneratedPaper: '/generated_papers/'
  };

  Paper.prototype.refresh = function(){
    this.$listPath = Type2Path[this.$type];
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
  Paper.prototype.questionTypes = {
                            0: '选择题',
                            1: '填空题',
                            2: '主观题'
                          };
  Paper.prototype.save = function(attrs,events){
    var self = this;
    attrs = attrs || {};
    delete attrs.Status;
    var saveObj = angular.copy(this);
    angular.extend(saveObj,attrs);

    //自动判断状态, 根据保存时设定的参数以及paper当前的状态
    var changeTo = self.checkStatus(events);
    if(angular.isNumber(changeTo))
      saveObj.Status = changeTo;
    // console.log('changeTo:',changeTo);
    if(saveObj.Status !== 0 && saveObj.Status !== 4 && saveObj.Status !== 2 && !saveObj.RecordedAt){
      saveObj.RecordedAt = $filter('date')(new Date(),"yyyy-MM-dd HH:mm:ss");
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

  Paper.prototype.loadPaper = function(paper){
    return http.get('/papers/'+paper.id+'/questions')
    .then(function(res){
        return new Paper(paper,'Paper',res.data);
    });
  };

  Paper.prototype.importPaper = function(paper){
    var self = this;
    return Q.when(paper)
    .then(function(paper){
      if(!paper.questions)
        return self.loadPaper(paper);
      return paper;
    })
    .then(function(paper){
      self.questions = paper.questions;
      self.Name = paper.Name;
      self.GradeId = paper.GradeId;
      self.QuestionsTotal = paper.QuestionsTotal;
      self.Type = paper.Type;
      self.Source = paper.Source;
      self.AudioPath = paper.AudioPath;
      self.Status = 1;
      return self.save();
    })
    .then(function(){
      return self.saveAllQuestions();
    });
    // .then(function(){
    //   return self.save();
    // });
  };

  var _ChnNumbers='一二三四五';
  var _TypeNames = ['选择题','填空题','简答题'];
  var _types;
  Paper.prototype.getQuestionsGroupByTypes = function(){
    var _TypeNames = ['选择题','填空题','简答题'];
    if(_types) return _types;
    if(!this.questions || !this.questions.length) return [];
    var typeOrder = [0,1,2];
    switch(this.questions[0].Type){
      case 1:
        typeOrder = [1,0,2];
        break;
      case 2:
        typeOrder = [2,0,1];
        break;
    }
    _types = [ ];
    var j = 0;
    for(var t in typeOrder){
      i = typeOrder[t];
      if(this.$questionsByType[i].length){
        _types.push({
          order: j,
          value: i,
          long: _ChnNumbers[j] + '、' + _TypeNames[i],
          short: _TypeNames[i],
          questions: this.$questionsByType[i]
        });
        j++;
      }
    }
    return _types;
  };

  Paper.prototype.getQuestionsGroupByKnowledges = function(){
    return this.$questionsByKnowledges;
  };

  Paper.prototype.getKnowledgesOfWrongQuestions = function(){
    if(!this.questions)
      return ;
    var knowledges = {$total:0};
    this.questions.forEach(function(question){
      if(question.Wrong && !!question.knowledges){
        var kname = question.knowledges[0].Name;
        knowledges[kname] = knowledges[kname] || {questions:[]};
        knowledges[kname].questions.push(question);
        knowledges.$total++;
      }
    });
    for( var kname in knowledges){
      if(kname == '$total')
        continue;
      var percentage = Math.round(100 * knowledges[kname].questions.length / knowledges.$total);
      knowledges[kname].percentage = percentage;
    }
    return knowledges;
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
      Description: '',
      Status: 0
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

  Paper.prototype.updateQuestionStatus = function(question){
    if(this.isQuestionFinished(question))
      question.Status = 6;
    else if(!this.isBlank(question.Answer))
      question.Status = 8;
    else
      question.Status = 5;
    // console.log('Status:',question.Status);
  };

  Paper.prototype.saveQuestion = function(indexOrQuestion) {
    var question;
    if(angular.isNumber(indexOrQuestion)){
      question = this.questions[indexOrQuestion];
    }else{
      question = indexOrQuestion;
    }
    this.updateQuestionStatus(question);
    return http.post(this.$questionsPath,{instance:question}).then(function(res){
      var q = res.data;
      $.extend(true,question,q);
    });
  };

  Paper.prototype.saveAllQuestions = function() {
    var self = this;
    if(self.questions.length){
      questions.forEach(function(question){
        self.updateQuestionStatus(question);
      });
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
    this.$questionsByType = [[],[],[]];
    this.$questionsByKnowledges = {};
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
      this.$questionsByType[questions[i].Type].push(questions[i]);
      if(questions[i].knowledges && questions[i].knowledges.length){
        var kname = questions[i].knowledges[0].Name;
        var group = this.$questionsByKnowledges[kname] || [];
        group.push(questions[i]);
        this.$questionsByKnowledges[kname] = group;
      }

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
      }else if(angular.isNumber(val)){
        return isNaN(val);
      }
      return !val;
    }catch(e){
      return false;
    }
  };

  Paper.prototype.isAllWrongQuestionsSolved = function(){
    var select = this.questions.filter(function(q){
      return q.Wrong && $('<div>'+(q.Answer ||'')+'</div>').text().trim().length === 0;
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
           // !this.isBlank(question.Solution) &&
           // !this.isBlank(question.Condition) &&
           // !this.isBlank(question.Method) &&
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

  Paper.prototype.checkStatus = function(events){
    for( var s = 0 ; s < 9 ;s ++){
      if(!!this.readyFor(s,events))
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
  Paper.prototype.readyFor = function(s,events){
    var savedQuestions = this.savedQuestions();
    var wrongQuestionsUnSolved = !this.isAllWrongQuestionsSolved();
    var allQuestionFinished = this.isAllQuestionFinished();
    var needRecapture = this.needRecapture();
    events = events || {};
    switch(s){
      // 待标错题
      case 1:
        return (this.Status === 2 && events.imported) &&
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
        return ((this.Status === 1 && events.finishMarking) ||
                (this.Status === 2 && events.finishWrongRecord)) &&
                savedQuestions > 0 && wrongQuestionsUnSolved;
      // 待录全卷
      case 3:
        return ((this.Status === 2 && events.finishWrongRecord) || this.Status === 5) &&
                savedQuestions > 0 &&
                savedQuestions < this.QuestionsTotal &&
                !wrongQuestionsUnSolved && !allQuestionFinished;
      // 需重拍
      case 4:
        return (this.Status === 0 && needRecapture);
      // 完成解答
      case 6:
        // console.log(allQuestionFinished);
        return (this.Status === 3 ||
                (this.Status === 1 && events.finishMarking) ||
                this.Status === 5 || this.Status === 8 ||
                (this.Status === 10 && events.finishCorrecting) ||
                (this.Status === 2 && events.finishWrongRecord)) &&
               allQuestionFinished;
      // 待完善
      case 8:
        // console.log('finishWrongRecord:',events.finishWrongRecord);
        return (this.Status === 3 || this.Status === 5 ||
              (this.Status === 1 && events.finishMarking) ||
               (this.Status === 2 && events.finishWrongRecord)) &&
              savedQuestions == this.QuestionsTotal &&
              !allQuestionFinished;
      //已推送
      case 7:
        return (this.Status === 3 || this.Status === 8 || this.Status === 6) && events.pushPaper;
      default:
        return false;
    }
  };

  Paper.prototype.readyForAny = function(statusList,events){
    if(!statusList || !statusList.length)
      return false;
    for(var i in statusList){
      if(this.readyFor(statusList[i],events)){
        return true;
      }
    }
    return false;
  };

  Paper.prototype.readyForAll = function(statusList,events) {
    if(!statusList || !statusList.length)
      return false;
    for(var i in statusList){
      if(!this.readyFor(statusList[i],events)){
        return false;
      }
    }
    return true;
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

  Paper.prototype.search = function(params){
    params = angular.extend({},params);
    var empty = true;
    for(var k in params){
      if(this.isBlank(params[k])){
        delete params[k];
      }else{
        empty = false;
      }
    }
    if(params.Order){
      params.Order--;
    }
    if(!empty)
      return http.post('/papers/filter',{searchParams: params});
    else
      return {success:angular.noop};
  };

  Paper.prototype.searchQuestions = function(keywords){
    return http.get('/questions?q='+keywords).then(function(res){
      return res.data;
    });
  };

  Paper.prototype.getQuestionStatistics = function(question){
    return http.get('/questions/'+question.id+'/statistics').then(function(res){
      question.statistics = res.data;
      return res.data;
    });
  };

  Paper.prototype.getQuestionsByKid = function(kid){
    return this.questions.filter(function(question){
      return (!!question.knowledges &&
        question.knowledges.some(function(k){
          return k.id === kid;
        }));
    });
  };

  var paper = new Paper(window.paper,window.paperType,window.questions,window.grades,window.conditions,window.methods);
  rootScope.paper = paper;

  return paper;
}])
.factory('knowledgeTree', ['$http','$window','$q','$rootScope',function (http,window,Q,rootScope) {
  // var knowledges;
  function Tree(){
    var self = this;
    this.loaded = false;
    this.load();
  }

  Tree.prototype.load = function(){
    var self = this;
    return Q.when().then(function(){
      if(this.loaded)
        return this;
      else
        return Q.all([
          http.get('/knowledge-tree.json').then(function(res){
            angular.extend(self,res.data);
          }),
          http.get('/knowledges').then(function(res){
            self.knowledges = res.data;
          })])
          .then(function(){
            self.loaded = true;
            return this;
          });
    });
  };

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

  /*
  * 生成特定知识点的平面表, 若ids为空表示生成所有知识点的平面表
  */
  Tree.prototype.flatten = function(ids){
    if(!this.knowledges){
      return;
    }
    var rows = [];
    function scanKnowledge(path,kid){
      if(!ids || ids.indexOf(kid)!= -1){
        var row = {};
        for(var i in path){
          row[i] = path[i];
        }
        row.knowledge = this.find(kid);
        row[path.length] = row.knowledge.Name;
        if(path.length == 1)
          row[2] = row.knowledge.Name;
        rows.push(row);
      }
    }
    function scanNode(path,node){
      path = angular.copy(path);
      path.push(node.name);
      if(node.children){
        node.children.forEach(angular.bind(this,scanNode,path));
      }
      if(node.pointIds){
        node.pointIds.forEach(angular.bind(this,scanKnowledge,path));
      }
    }
    this.children.forEach(angular.bind(this,scanNode,[]));
    return rows;
  };
  rootScope.knowledgeTree = new Tree();
  return rootScope.knowledgeTree;
}])
;