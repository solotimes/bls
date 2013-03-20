/* Filters */

angular.module('paper.filters', [])
.filter('toABC', function() {
    return function(num) {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num];
    };
  });
