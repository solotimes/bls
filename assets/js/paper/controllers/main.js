app.controller('MainCtrl',['$scope','$window','$http','$route','$location','$q',function(scope,window,http,route,location,Q){
  scope.window = window;
  scope.$root.paper = window.paper;
  scope.$root.orgStatus = scope.$eval('paper.Status');
  scope.$root.grades = window.grades;
  scope.$root.paper.GradeId = scope.$eval('paper.GradeId || paper.customer.GradeId');
  scope.$root.questionsData = window.questions || [];
  scope.$root.questionCount = 0;

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
    if(scope.questions){
      promise = http.post('/questions/',{instance:scope.questions}).then(function(res){
        var qs = res.data;
        if(!qs.length) qs = [qs];
        qs.forEach(function(q,i){
          delete q.Meta;
          $.extend(true,scope.questions[i],q);
          scope.questions[i].meta.id = q.id;
        });
        // scope.$root.dirtyForms = null;
      });
    }
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
    if(!scope.paper.Meta) return 0;
    return scope.paper.Meta.questions.filter(function(q){
      return ('undefined' != typeof q.id);
    }).length;
  };
  scope.createNewPaper = function(){
    if(scope.$root.questionCount > 0){
      location.path('/question');
    }else{
      alert('请输入题目总数');
    }
  };
  if(scope.paper.Meta){
    location.path('/question');
  }

  window.onbeforeunload = function(e) {
    // // if(scope.$root.dirtyForms){
    //   // var dirty = false;
    //   // var msg = [];
    //   // for(var i in scope.$root.dirtyForms){
    //   //   var value =scope.$root.dirtyForms[i];
    //   //   dirty =  value || dirty;
    //   //   if(value){
    //   //     msg.push('第'+(i+1)+'题');
    //   //   }
    //   // }
    //   // if(dirty){
    //     return '未保存的数据将丢失,确定要离开本页?';
    //   // }
    // // }
  };
}]);