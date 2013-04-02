app.controller('CustomerPaperReportCtrl',['$scope','$http','paper','knowledgeTree','modal',function(scope,http,paper,knowledgeTree){
  // scope.$watch('paper.questions',function(questions){
    scope.kids = [];
    if(paper.questions){
      paper.questions.forEach(function(q){
        if(q.knowledges)
          q.knowledges.forEach(function(k){
            if(scope.kids.indexOf(k.id) == -1)
              scope.kids.push(k.id);
          });
      });
    }
  // },true);
  scope.viewQuestion = function(question){
    modal.show("/templates/question-modal.html",{question:question,mode:0});
  };
  scope.knowledgeTree = knowledgeTree;

  knowledgeTree.load().then(function(){
    scope.rows = knowledgeTree.flatten(scope.kids);
    scope.rows.forEach(function(row){
      var questions = paper.getQuestionsByKid(row.knowledge.id);
      row[4] = questions.filter(function(q){return q.Wrong;}).length;
      row[3] = Math.round(100* row[4] / questions.length);
      row[5] = questions;
    });
  });


}]);