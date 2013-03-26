/* Filters */

angular.module('paper.filters', [])
.filter('toABC', function() {
    return function(num) {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num];
    };
  })
.filter('blank',function(){
	return function(val){
		try{
			if(angular.isString(val)){
				return $(val).text().trim();
			}else if(angular.isArray(val)){
				return val.length > 0;
			}
			return !!val;
		}catch(e){
			return false;
		}
	};
})
;
