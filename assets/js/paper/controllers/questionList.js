app.controller('QuestionListCtrl',['$scope','$http','$routeParams','modal','paper',function(scope,http,routeParams,modal,paper){
  scope.questions = window.questions;
  scope.edit = function(question){
    modal.show("/templates/question-modal.html",{question:question,mode:1});
  };
  scope.view = function(question){
    modal.show("/templates/question-modal.html",{question:question,mode:0});
  };
  scope.addNew = function(){
    modal.show("/templates/question-modal.html",{mode:1});
  };
  scope.$root.$on('question-saved',function(e,question){
    if(scope.questions.indexOf(question) == -1){
      scope.questions.unshift(question);
    }
  });
}]);