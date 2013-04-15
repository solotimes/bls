app.controller('PaperCtrl',['$scope','$http' ,'paper','modal','$location',function(scope,http,paper,modal,location){
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
	scope.$on('file-uploaded',function(){
    paper.save();
  });
	scope.addNewQuestion = function(attrs){
		attrs = attrs || {};
		attrs.Order = paper.QuestionsTotal;
		paper.questions.push(paper.newQuestion(attrs));
		paper.QuestionsTotal ++;
		paper.reloadQuestions();
		paper.save();
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
			location.path('/');
		});
	};
	scope.pushPaper = function(){
		if(confirm('推送的试卷将不能编辑, 是否推送试卷? (本操作不可撤销) '))
			paper.save(null,{pushPaper:true});
	};
	scope.dump = function(){
		if(confirm('是否存入试卷库? (本操作不可撤销)'))
			paper.dump();
	};
	// scope.$watch('paper.getQuestionsGroupByTypes()',function(v){console.log(v);},true);
}]);