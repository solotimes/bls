app.controller('RecordingCtrl',['$scope','$http','paper','$location',function(scope,http,paper,location){

  scope.initPaper = function(){
    if( angular.isUndefined(paper.QuestionsTotal) || paper.QuestionsTotal <= 0 ){
      return alert('请设定题目总数');
    }
    if(paper.isBlank(paper.Name)){
      return alert('请设定试卷标题');
    }
    if(!paper.GradeId)
      return alert('请设定试卷年级');
    paper.questions = [];
    paper.reloadQuestions();
    paper.save().success(_beginRecording);
  };

  function _beginRecording(){
    scope.question = paper.questions[0];
    scope.subview = 'question';
  }

  scope.$watch('paper.questions',function(questions){
    scope.questionsWithLabels = questions.map(function(q,i){
      var typeStr = q.Excerpt.length ? '['+paper.questionTypes[q.Type]+']' : '';
      var label = (i+1)+'.'+typeStr+(q.Excerpt.length ? q.Excerpt : '--未录入--');
      return {
        label: label,
        question: q,
        index: i
      };
    });
  },true);

  scope.$on('paper-imported',function(){
    location.path('/marking');
  });

  scope.nextQuestion = function(){
    if(!scope.isLastQuestion()){
      scope.question = paper.questions[scope.question.Order+1];
    }
  };

  scope.saveQuestion = function(){
    scope.$broadcast('save-question');
  };

  scope.saveQuestionAndNext = function(){
    scope.goNext = true;
    scope.saveQuestion();
  };

  scope.searchPapers = function(){
    scope.subview = 'search';
  };

  scope.$on('question-saved',function(){
    paper.save();
    if(scope.goNext){
      setTimeout(function(){
        scope.nextQuestion();
        scope.goNext = false;
      },0);
    }
  });

  scope.isLastQuestion = function(){
    if(scope.question)
      return scope.question.Order >= (paper.questions.length - 1);
    return false;
  };

  scope.$on('dirty-state-change',function(e,value){
    scope.dirty = value;
  });

  function switchable(){
    if(scope.dirty && !window.confirm('当前试题未保存,切换将丢失修改,是否切换?')){
      return false;
    }
    return true;
  }
  scope.$watch('question',function(v,old){
    if(scope.switching){
      scope.switching = false;
      return;
    }

    if(!switchable()){
      scope.switching = true;
      scope.question = old;
    }
  });

  if(paper.QuestionsTotal > 0){
    scope.subview = 'question';
  }else{
    scope.subview = 'init';
  }

  if(paper.questions.length)
    scope.question = paper.questions[0];
}]);

app.controller('PaperSearchCtrl',['$scope','$http','paper',function(scope,http,paper){
  scope.subview = 'filter';
  scope.readonly = true;
  scope.searchParams = {};
  scope.search = function(){
    paper.search(scope.searchParams).success(function(papers){
      scope.papers = papers;
    });
  };
  scope.preview = function(p){
    paper.loadPaper(p).then(function(p){
      scope.subview = 'preview';
      scope.paper = p;
    });
  };
  scope.import = function(p){
    if(!confirm('确定要选定并导入本试卷? (本操作不可撤销)'))
      return;
    paper.importPaper(p).then(function(){
      scope.$emit('paper-imported');
    });
  };
}]);