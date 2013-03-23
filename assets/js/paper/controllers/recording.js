app.controller('RecordingCtrl',['$scope','$http','paper',function(scope,http,paper){

  scope.initPaper = function(){
    if(paper.QuestionsTotal > 0){
      paper.save().success(function(){
        paper.reloadQuestions();
        scope.question = paper.questions[0];
        scope.subview = 'question';
      });
    }else{
      alert('请设定题目总数');
    }
  };

  scope.$watch('paper.questions',function(questions){
    scope.questionsWithLabels = questions.map(function(q,i){
      q.Excerpt = $(q.Body).text().substring(0,20);
      return {
        label: (i+1)+'. '+q.Excerpt,
        question: q,
        index: i
      };
    });
  },true);

  scope.nextQuestion = function(){
    if(!scope.isLastQuestion()){
      scope.question = paper.questions[scope.question.Order+1];
    }
  };

  scope.saveQuestion = function(){
    scope.$broadcast('save-question');
  };

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