app.controller('RawCtrl',['$scope','$http',function(scope,http){
  //监视是否需要重拍
  scope.needRecapture = function(){
    var mark = false;
    try{
      mark = (scope.paper.pics.filter(function(pic){
        return pic.RecaptureMark;
      }).length !== 0);
    }catch(err){
      mark= false;
    }
    return mark;
  };

  scope.loadInputers = function(){
    scope.inputers = http.get('/admins.json?by=Role&q=录入员&per=1000').success(function(res){
      scope.inputers=res;
    })
    ;
  };
  scope.assign = function(){
    scope.savePaper({Status: 2});
  };
  scope.recapture = function(){
    scope.savePaper({Status: 4}).success(function(){
      // window.confirm('设置成功, 是否分配下一张试卷?');
    });
  };
}]);