app.controller('CorrectingCtrl',['$scope','$http' ,'paper','modal','$timeout',function(scope,http,paper,modal,$timeout){
	scope.$on('unload',function(e){
		// if(scope.markingForm.$dirty){
			// e.preventDefault();
		// }
	});
	scope.isFinished = function(question){
		return !scope.missingSolution(question) && !scope.missingKnowledges(question);
	};
	scope.missingSolution = function(question){
		return $(question.Solution).text().trim().length === 0;
	};
	scope.missingKnowledges = function(question){
		return !question.knowledges || !question.knowledges.length;
	};
	scope.save = function(){
		paper.saveAllQuestions().then(function(){
			paper.save(null,{finishCorrecting:true});
		});
	};
	scope.viewQuestion = function(question){
		modal.show("/templates/question-modal.html",{question:question,mode:0});
	};
	scope.questionStateChange = function(){
		$timeout(function(){
			scope.wrongKnowledges = paper.getKnowledgesOfWrongQuestions();
		},100);
	};
	scope.wrongKnowledges = paper.getKnowledgesOfWrongQuestions();
}]);