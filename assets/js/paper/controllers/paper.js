app.controller('PaperCtrl',['$scope','$http' ,'paper','modal',function(scope,http,paper,modal){
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
	scope.editQuestion = function(question){
		modal.show("/templates/question-modal.html",{question:question,mode:1});
	};
	scope.viewQuestion = function(question){
		modal.show("/templates/question-modal.html",{question:question,mode:0});
	};
	scope.removeQuestion = function(question){
		if(window.confirm('你确定要从本试卷中移除这道试题?')){
			paper.removeQuestion(question);
		}
	};
	scope.moveUp = function(question){
		paper.moveUpQuestion(question);
	};
	scope.moveDown = function(question){
		paper.moveDownQuestion(question);
	};
	scope.swapQuestions = function(q1,q2){
		paper.swapQuestions(q1,q2);
	};
	scope.save = function(){
		paper.saveAllQuestions().then(function(){
			paper.save();
		});
	};
	// scope.$watch('paper.getQuestionsGroupByTypes()',function(v){console.log(v);},true);
}]);