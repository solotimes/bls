app.controller('QuestionModalCtrl',['$scope','$http','paper',function(scope,http,paper){
  if(!scope.question){
    scope.question = window.question || paper.newQuestion();
  }
  if(!!scope.question.id){
    paper.getQuestionStatistics(scope.question);
  }
  scope.modalMode = true;
  if(angular.isUndefined(scope.mode))
    scope.mode = 0;
  scope.switchMode = function(mode,e){
    if(scope.mode == mode) return;
    if(mode === 0 && scope.dirty && confirm('未保存的数据将丢失, 是否取消?')){
      scope.$broadcast('reset-question');
      scope.mode = mode;
    }else if(mode != 0){
      scope.mode = mode;
    }
  };
  scope.save = function(){
    scope.$broadcast('save-question');
  };
  scope.$on('question-saved',function(){
    scope.dirty = false;
    scope.mode = 0;
  });
  scope.cancel = function(e){
    if(!scope.dirty){
      scope.$emit('cancel');
    }
    else if(confirm('未保存的数据将丢失, 是否取消?')){
      scope.$broadcast('reset-question');
      scope.$emit('cancel');
    }
  };

  scope.$on('modal-closing',function(e){
    if(scope.dirty){
      if(!confirm('未保存的数据将丢失, 是否取消?')){
        return e.preventDefault();
      }
      scope.$broadcast('reset-question');
    }
  })

  scope.$on('dirty-state-change',function(e,value){
    scope.dirty = value;
  });
}]);