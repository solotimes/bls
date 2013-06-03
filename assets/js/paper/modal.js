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
		$('#facebox .close').off('click');
		$('#facebox .close').on('click',function(e){
			e.preventDefault();
			console.log('!!!!');
			var event = scope.$broadcast('modal-closing');
			if(!event.defaultPrevented)
				return $.facebox.close(e)
		});

		$(document).one('afterClose.facebox',function(){
			scope.$destroy();
		});
	};
	return modal;
}]);