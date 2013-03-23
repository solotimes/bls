app.controller('RawCtrl',['$scope','$http' ,'paper',function(scope,http,paper){
  //监视是否需要重拍
  scope.loadInputers = function(){
    scope.inputers = http.get('/admins.json?by=Role&q=录入员&per=1000').success(function(res){
      scope.inputers=res;
    })
    ;
  };
  scope.assign = function(){
    paper.changeStatus(2);
  };
  scope.recapture = function(){
    paper.changeStatus(4);
    // paper.save({Status: 4});
    // .success(function(){
    //   // window.confirm('设置成功, 是否分配下一张试卷?');
    // });
  };
}]);