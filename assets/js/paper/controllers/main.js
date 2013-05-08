app.controller('MainCtrl',['$scope','$window','$http','$route','$location','$q','paper',function(scope,window,http,route,location,Q,paper){
  scope.window = window;
  scope.$root.grades = window.grades;
  if(paper.$type == 'CustomerPaper')
    scope.$root.rootPath = '/customer_papers';
  else if(paper.$type == 'Paper')
    scope.$root.rootPath = '/papers';
  // scope.$root.paper = window.paper;
  // scope.$root.paper_type = 'CustomerPaper';
  // scope.$root.orgStatus = scope.$eval('paper.Status');
  // scope.$root.grades = window.grades;
  // scope.$root.paper.GradeId = scope.$eval('paper.GradeId || paper.customer.GradeId');
  // scope.$root.questions = window.questions || [];
  // scope.$root.paperPath = '/customer_papers/'+scope.paper.id;
  // scope.$root.questionsPath = scope.$root.paperPath + '/questions';
  // scope.$root.questionCount = window.questions.length;

  // scope.questionCount = scope.questions.length;
  // if(scope.paper.QuestionsTotal > 0){
  //   location.path('/question');
  // }
  scope.close = function(){
    if($('.marking').length){
      window.location.href = '/customer_papers/raw/待标错题';
    }else if($('.recording').length){
      window.location.href = paper.$listPath;
    }else{
      window.close();
    }
  };

  window.onbeforeunload = function(e) {
    var event = scope.$root.$broadcast('unload');
    if(event.defaultPrevented){
      return '将丢失未保存的更改,您确定要退出本页?';
    }
  };
  var testElement = $('<div></div>');
  scope.$root.blank = function(val){
    try{
      if(angular.isString(val)){
        return testElement.html(val).text().trim().length === 0;
      }else if(angular.isArray(val)){
        return val.length === 0;
      }
      return !val;
    }catch(e){
      return false;
    }
  };
  if(!paper.id || paper.Status === 0)
    location.path('recording');
  // $scope.$on(
  //     "$routeChangeSuccess",
  //     function( $currentRoute, $previousRoute ){
  //         // Update the rendering.
  //         // render();
  //     }
  // );
}]);