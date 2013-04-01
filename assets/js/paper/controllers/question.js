app.controller('QuestionCtrl',['$scope','$http','$routeParams','$location','paper',function(scope,http,routeParams,location,paper){
  scope.$on('unload',function(e){
    if(scope.qform.$dirty)
      e.preventDefault();
  });

  scope.$watch('question',function(question){
    scope.qform.$setPristine();
      // scope.question = question;
  });

  scope.$on('save-question',function(){
    if(paper.isBlank(scope.question.Body))
      return window.alert('提干未填写');
    paper.saveQuestion(scope.question).then(function(){
      scope.qform.$setPristine();
      scope.$emit('question-saved',scope.question);
    });
  });

  scope.removeKnowledge = function(knowledge){
    if(!scope.question.knowledges)
      return;
    for( var i in scope.question.knowledges){
      if(scope.question.knowledges[i].id ===  knowledge.id){
        scope.question.knowledges.splice(i,1);
        break;
      }
    }
  };

  scope.addDesc = function(text){
    if(!!scope.question.Description){
      scope.question.Description += (' '+text);
    }else{
      scope.question.Description = text;
    }
  };

  scope.$watch('qform.$dirty',function(value){
    scope.$emit('dirty-state-change',value);
  });

  scope.$watch('question.Body',function(value){
    var temp = $(value);
    temp.find('.math').mathquill();
    temp.find('.selectable').remove();
    scope.question.Excerpt = temp.text().substring(0,20);
    temp.remove();
  });

  scope.setQuestion = function(question){
    var attrs = angular.copy(question);
    delete attrs.CreatedAt;
    delete attrs.UpdatedAt;
    angular.copy(attrs,scope.question);
  };
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

app.controller('KnowledgeCtrl',['$scope','$http' ,'paper' ,'knowledgeTree',function(scope,http,paper,knowledgeTree){
  scope.setLevel1 = function(node){
    scope.level1 = node;
    scope.level2 = null;
  };
  scope.setLevel2 = function(node){
    scope.level2 = node;
  };
  scope.isKnowledgeAdded = function(kid){
    if(!scope.question)return false;
    return scope.question.knowledges && !!(scope.question.knowledges.filter(function(knowledge){
      return knowledge.id === kid;
    }).length);
  };
  scope.select = function(kid){
    if(!scope.question || scope.isKnowledgeAdded(kid))
      return;
    var knowledge = knowledgeTree.find(kid);
    scope.question.knowledges = scope.question.knowledges || [];
    scope.question.knowledges.push(knowledge);
  };
}]);