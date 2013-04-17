app.controller('MarkingCtrl',['$scope','$http' ,'paper',function(scope,http,paper){
	scope.questionTypes = [
	{
		order: 0,
		short:'选择题',
		long: '一、选择题'
	},{
		order: 1,
		short:'填空题',
		long: '二、填空题'
	},{
		order: 2,
		short:'主观题',
		long: '三、主观题'
	}
	];
	scope.$on('unload',function(e){
		if(scope.markingForm.$dirty){
			e.preventDefault();
		}
	});
	scope.mark = function(){
		if(confirm('是否确定完成错题标记? (本操作不可撤销)'))
		paper.saveAllQuestions().then(function(){
			scope.markingForm.$setPristine();
			paper.save(null,{finishMarking:true}).then(function(){
				window.location = paper.$listPath+'raw/待标错题';
			});
		});
	};
}]);