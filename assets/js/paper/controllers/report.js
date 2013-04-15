app.controller('ReportCtrl',['$scope','$http','paper','knowledgeTree','modal',function(scope,http,paper,knowledgeTree){
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
      var wrongQuestions = questions.filter(function(q){return q.Wrong;});
      row[4] = wrongQuestions.length;
      row[3] = Math.round(100* row[4] / questions.length);
      row[5] = wrongQuestions;
    });
  });

}]);

app.controller('PaperReportCtrl',['$scope','$http','paper','knowledgeTree','modal',function(scope,http,paper,knowledgeTree){
  // scope.$watch('paper.questions',function(questions){
    scope.kids = [];
    if(paper.questions){
      paper.questions.forEach(function(q){
        if(q.knowledges)
          q.knowledges.forEach(function(k){
            if(scope.kids.indexOf(k.id) == -1){
              scope.kids.push(k.id);
              scope.counts = scope.counts || {};
              scope.counts[k.id] = scope.counts[k.id] || [0,0,0];
              scope.counts[k.id][q.Type]++;
            }
          });
      });
    }

  scope.knowledgeTree = knowledgeTree;

  knowledgeTree.load().then(function(){
    // console.log(knowledgeTree.knowledges);
    // console.log(scope.kids);
    scope.knowledges = knowledgeTree.knowledges.filter(function(knowledge){
      if(scope.kids.indexOf(knowledge.id) != -1){
        knowledge.counts = scope.counts[knowledge.id];
        return true;
      }
      return false;
    });
    console.log(scope.knowledges);
    // scope.rows.forEach(function(row){
    //   var questions = paper.getQuestionsByKid(row.knowledge.id);
    //   var wrongQuestions = questions.filter(function(q){return q.Wrong;});
    //   row[4] = wrongQuestions.length;
    //   row[3] = Math.round(100* row[4] / questions.length);
    //   row[5] = wrongQuestions;
    // });
  });

}]);

app.controller('CustomerReportCtrl',['$scope','$http','paper','knowledgeTree','modal',function(scope,http,paper,knowledgeTree,modal){
  // scope.$watch('paper.questions',function(questions){
  var report = window.report;
  if(report){
    scope.kids = report.map(function(record){
      return record.kid;
    });
  }
  scope.viewQuestion = function(question){
    modal.show("/templates/question-modal.html",{question:question,mode:0});
  };
  scope.knowledgeTree = knowledgeTree;

  knowledgeTree.load().then(function(){
    scope.rows = knowledgeTree.flatten(scope.kids);
    scope.rows.forEach(function(row){
      var questions = paper.getQuestionsByKid(row.knowledge.id);
      var record = report.filter(function(record){return record.kid == row.knowledge.id;})[0];
      row[4] = record.wcount;
      row[3] = Math.round(100 * record.wcount / record.qcount);
      row[5] = questions;
    });
  });
}]);


app.controller('StatisticsReportCtrl',['$scope','$http','paper','modal',function(scope,http,paper,modal){
  scope.report = window.report;
  scope.viewQuestion = function(question){
    modal.show("/templates/question-modal.html",{question:question,mode:0});
  };
}]);