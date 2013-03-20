/* Services */


angular.module('paper.services', [])
    .config(['$httpProvider',function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            if(data)
              window.showSpinner('sending');
            else
              window.showSpinner('loading');
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    }])
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', ['$q','$window',function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                var method = response.config.method;
                if(method === 'GET'){
                  window.hideSpinner();
                }else{
                  window.showSpinner('success',1000);
                }
                return response;

            }, function (response) {
                window.showSpinner('fail');
                return $q.reject(response);
            });
        };
    }]);