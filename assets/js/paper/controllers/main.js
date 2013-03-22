app.controller('MainCtrl',['$scope','$window','$http','$route','$location','$q',function(scope,window,http,route,location,Q){
  scope.window = window;
  scope.$root.paper = window.paper;
  scope.$root.paper_type = 'CustomerPaper';
  scope.$root.orgStatus = scope.$eval('paper.Status');
  scope.$root.grades = window.grades;
  scope.$root.paper.GradeId = scope.$eval('paper.GradeId || paper.customer.GradeId');
  scope.$root.questions = window.questions || [];
  scope.$root.paperPath = '/customer_papers/'+scope.paper.id;
  scope.$root.questionsPath = scope.$root.paperPath + '/questions';
  // scope.$root.questionCount = window.questions.length;

  // scope.questionCount = scope.questions.length;
  scope.savePaper = function(attrs){
    var instance = angular.copy(scope.paper);
    if(attrs)
      angular.extend(instance,attrs);
    if(!attrs || !attrs.Status){
      delete instance.Status;
    }
    return http.put('/customer_papers/'+scope.paper.id,{instance: instance}).success(function(res){
      // alert('修改成功');
      delete res.meta;
      $.extend(true,scope.paper,res);
      // scope.$digest();
      // console.log(res);
      // scope.paper = res;
      // window.paper = scope.paper;
      // console.log(paper);
    });
  };
  scope.finishPaper = function(questions){
    if(scope.savedQuestions() < scope.paper.Meta.questions.length){
      alert('发现未录入问题.请录入!');
      return;
    }

    // var dirtyForms = scope.$root.dirtyForms || {};
    // var questionsToSave = [];
    // for(var i in dirtyForms){
    //   if(dirtyForms[i]){
    //     questionsToSave.push(root.questions[i]);
    //   }
    // }
    var promise = Q.when();
    // if(scope.questions){
    //   promise = http.post('/questions/',{instance:scope.questions}).then(function(res){
    //     var qs = res.data;
    //     if(!qs.length) qs = [qs];
    //     qs.forEach(function(q,i){
    //       delete q.Meta;
    //       $.extend(true,scope.questions[i],q);
    //       scope.questions[i].meta.id = q.id;
    //     });
    //     // scope.$root.dirtyForms = null;
    //   });
    // }
    return promise.then(function(){
      //检查所有错题是否解答
      var select = questions.filter(function(q){
        return q.meta.wrong && $(q.Solution||'').text().trim().length === 0;
      });
      if(select.length){
        if(window.confirm('有错题未解答,将试卷状态更改为"错题未解答"'))
          return scope.savePaper({Status:5});
      }else{
        if([6,7].indexOf(scope.paper.Status)!=-1 || window.confirm('全部错题都已解答, 将试卷状态更改为"完成解答."'))
          return scope.savePaper({Status:6});
      }
    });
  };
  scope.finishWrongQuestions = function(){
    if(window.confirm('将试卷状态更改为"待录全卷"?')){
      scope.savePaper({Status:3});
    }
  };
  scope.savedQuestions = function (){
    if(!scope.$root.questions) return 0;
    return scope.$root.questions.filter(function(q){
      return angular.isUndefined(q.id);
    }).length;
  };
  scope.createNewPaper = function(){
    if(scope.$root.paper.QuestionsTotal > 0){
      scope.savePaper().success(function(){
        location.path('/question');
      });
    }else{
      alert('请输入题目总数');
    }
  };
  if(scope.paper.QuestionsTotal > 0){
    location.path('/question');
  }

  window.onbeforeunload = function(e) {
    var event = scope.$root.$broadcast('unload');
    if(event.defaultPrevented){
      return '将丢失未保存的更改,您确定要退出本页?';
    }
  };

  // $scope.$on(
  //     "$routeChangeSuccess",
  //     function( $currentRoute, $previousRoute ){
  //         // Update the rendering.
  //         // render();
  //     }
  // );
}]);