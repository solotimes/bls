app.controller('QuestionModalCtrl',['$scope','$http','paper',function(scope,http,paper){
  if(!scope.question){
    scope.question = window.question || paper.newQuestion();
  }
  if(!!scope.question.id){
    paper.getQuestionStatistics(scope.question);
  }
  scope.questionTypes = ['填空题','选择题','主观题'];
  scope.modalMode = true;
  if(angular.isUndefined(scope.mode))
    scope.mode = 0;
  scope.switchMode = function(mode,e){
    if(scope.mode == mode) return;
    scope.mode = mode;
  };
  scope.save = function(){
    scope.$broadcast('save-question');
  };
  scope.$on('question-saved',function(){
    scope.mode = 0;
  });
  scope.cancel = function(){
    scope.$emit('cancel');
  };

}]);