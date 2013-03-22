app.controller('QuestionCtl',['$scope','$http','$routeParams','$location',function(scope,http,routeParams,location){

  scope.$on('unload',function(e){
    // e.preventDefault();
  });

  function newQuestion(attrs){
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
  }

  scope.saveQuestion = function(index){
    var question = scope.questions[index];
    return http.post(scope.questionsPath,{instance:question}).then(function(res){
      var q = res.data;
      $.extend(true,question,q);
      // scope.qform.$setPristine();
      // return scope.savePaper();
    });
  };

  scope.nextQuestion = function(index){
    if(index < scope.questions.length-1){
      scope.question = scope.questions[index+1];
    }
  };

  scope.loadQuestions = function(){
    if(scope.paper.QuestionsTotal > scope.questions.length){
      // 加载试卷数
      // scope.$root.questionCount = scope.paper.Meta.questions.length;
      // console.log(scope.questionCount);
      // 生成空题
      var questions = [];
      for(var i = 0,j=0; i < scope.paper.QuestionsTotal ; i++){
        if(j >= scope.questions.length || i < scope.questions[j].Order){
          questions.push(newQuestion({Order:i}));
        }else{
          questions.push(scope.$root.questions[j++]);
        }
      }
      scope.$root.questions = questions;
    }else{

    }

    scope.question = scope.questions[0];
  };
  scope.$watch('questions',function(questions){
    scope.questionsWithLabels = questions.map(function(q,i){
      q.Excerpt = $(q.Body).text().substring(0,20);
      return {
        label: (i+1)+'. '+q.Excerpt,
        question: q,
        index: i
      };
    });
  },true);

  scope.$watch('question',function(question){
    scope.qid = scope.questions.indexOf(question);
  });

  // scope.$watch('qform.$dirty',function(value){
  //   //监视编辑状态
  //   scope.$root.dirtyForms = scope.$root.dirtyForms || {};
  //   scope.$root.dirtyForms[scope.qid]=value;
  // });
  scope.loadQuestions();
}]);

app.controller('MultipleChoiceCtrl',['$scope',function(scope){
  scope.removeChoice = function(i){
    scope.question.Choices.splice(i,1);
  };
  scope.addChoice = function(){
    scope.question.Choices = scope.question.Choices || [];
    scope.question.Choices.push({body:''});
  };
  var nCount = scope.$eval('question.Choices.length');
  if(!nCount){
    for(var i=0;i<4;i++){
      scope.addChoice();
    }
    scope.answer = 'A';
  }
}]);

app.controller('FillinBlanksCtrl',['$scope',function(scope){

}]);