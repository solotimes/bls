app.controller('QuestionModalCtrl',['$scope','$http','paper',function(scope,http,paper){
	scope.questionTypes = ['填空题','选择题','主观题'];
	scope.modalMode = true;
	if(angular.isUndefined(scope.mode))
		scope.mode = 0;
	scope.switchMode = function(mode,e){
		if(scope.mode == mode) return;
		scope.mode = mode;
	};
	scope.save = function(){
		paper.saveQuestion(scope.question).then(function(){
			scope.$broadcast('question-saved');
			scope.mode = 0;
			// scope.$emit('ok');
		});
	};
	scope.cancel = function(){
		scope.$emit('cancel');
	};
}]);