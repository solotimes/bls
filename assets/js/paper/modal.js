angular.module( 'facebox', [] )
.factory( 'modal', ['$http','$rootScope','$compile','$templateCache',function ( $http, $rootScope, $compile, $templateCache )
{
	modal = {};
	modal.show = function(templateUrl,data,callback){
		var scope = $rootScope.$new();
		angular.extend(scope, data);
		scope.$on('ok',function(){
			if(callback){
				callback.apply(scope,arguments);
			}
			jQuery(document).trigger('close.facebox');
		});
		scope.$on('cancel',function(){
			jQuery(document).trigger('close.facebox');
		});
		var el = $('<div ng-include src="\''+templateUrl+'\'"></div>');
		$compile(el)(scope);
		$.facebox('');
		$('#facebox .content').empty().append(el);
		$(document).one('afterClose.facebox',function(){
			scope.$destroy();
		});
	};
	return modal;
}]);