app.controller('RawCtrl',['$scope','$http' ,'paper',function(scope,http,paper){
  //监视是否需要重拍
  scope.showAssgin = !paper.AdminId;
  scope.loadInputers = function(){
    scope.inputers = http.get('/admins.json?by=Role&q=录入员&per=1000').success(function(res){
      scope.inputers=res;
    })
    ;
  };
  scope.assign = function(){
    paper.save({AdminId:scope.adminId}).then(function(){
      scope.showAssgin = false;
    });
  };
  scope.recapture = function(){
    if(confirm("已要求重拍，将返回列表"))
      paper.save().then(function(){
        window.location.href = paper.$listPath;
      });
    // paper.save({Status: 4});
    // .success(function(){
    //   // window.confirm('设置成功, 是否分配下一张试卷?');
    // });
  };
}]);