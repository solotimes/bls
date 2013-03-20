var app = angular.module('Paper', ['paper.filters', 'paper.services', 'paper.directives'])
.config(['$routeProvider','$locationProvider', function($routeProvider,$locationProvider) {
    $routeProvider.when('/question/', {templateUrl: '/templates/question.html', controller: 'QuestionCtl'});
    // $routeProvider.when('/question/:qid', {templateUrl: '/templates/question.html', controller: 'QuestionCtl'});
    // $routeProvider.otherwise();
  }]);


app.controller('QuestionCtl',['$scope','$http','$routeParams','$location',function(scope,http,routeParams,location){
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
      correct: true //用户答案是否正确
    },attrs);
  }

  scope.saveQuestion = function(index){
    var question = scope.questions[index];
    return http.post('/questions/',{instance:question}).then(function(res){
      var q = res.data;
      $.extend(true,question,q);
      question.meta.id = q.id;
      // scope.nextQuestion(index);
      scope.qform.$setPristine();
      return scope.savePaper();
    });
  };
  scope.nextQuestion = function(index){
    if(index < scope.questions.length-1){
      scope.question = scope.questions[index+1];
    }
  };

  scope.loadQuestions = function(paper,questions){
    if(scope.paper.Meta){
      //加载试卷数
      scope.$root.questionCount = scope.paper.Meta.questions.length;
      // console.log(scope.questionCount);
    }else{
      scope.paper.Meta = {
        questions: []
      };
      var nAdd = Math.max(scope.$root.questionCount,routeParams.i||1);
      //创建空题
      for(var i=0; i< nAdd ;i++){
        scope.paper.Meta.questions.push({});
      }
      //保存试卷信息
      scope.savePaper();
    }

    scope.$root.questions = [];
    //按照试卷信息排序问题
    scope.paper.Meta.questions.forEach(function(q,i){
      try{
        var qAdd = newQuestion({});
        if(q.id){
          var select = scope.questionsData.filter(function(qu){return qu.id == q.id;});
          if(select.length){
            qAdd = select[0];
          }
        }
        qAdd.meta = q;
        qAdd.CustomerPaperId = scope.paper.id;
        scope.questions.push(qAdd);
      }catch(e){}
    });

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

  scope.$watch('qform.$dirty',function(value){
    //监视编辑状态
    scope.$root.dirtyForms = scope.$root.dirtyForms || {};
    scope.$root.dirtyForms[scope.qid]=value;
  });
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