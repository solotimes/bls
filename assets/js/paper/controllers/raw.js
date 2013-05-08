app.controller('RawCtrl',['$scope','$http' ,'paper','$filter',function(scope,http,paper,$filter){
  //监视是否需要重拍
  scope.showAssgin = !paper.AdminId;
  scope.loadInputers = function(){
    scope.inputers = http.get('/admins/inputers').success(function(res){
      (res||[]).forEach(function(inputer){
        inputer.$label = inputer.Name + '(待录:' + inputer.recordCount + ')' +
        '(待标:' + inputer.markCount + ')';
      });
      scope.inputers= $filter('orderBy')(res, 'markCount+recordCount' , true);
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
  };
}]);