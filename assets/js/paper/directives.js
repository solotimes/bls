/* Directives */


angular.module('paper.directives', [])
  .directive('picSelectors', ['$compile', function($compile) {
    return {
      restrict: 'C',
      link: function link(scope, elm, attrs) {
        function createSelectors(pics){
          if(!pics || 'function' !== typeof pics.forEach){
            return;
          }
          pics.forEach(function(pic,index){
            var li = angular.element('<li><span>第'+(index+1)+'面</span></li>').appendTo(elm);
            li.on('click','span',function(){
              scope.$apply(function(){
                scope[attrs.indexVar]=index;
              });
            });
            if(attrs.checkboxField){
              var checkbox = angular.element('<label>'+ attrs.checkboxLabel +'<input type="checkbox" ng-model="'+attrs.pics+'['+index+'].RecaptureMark"/></label>');
              checkbox.appendTo(li);
            }
            if(scope[attrs.indexVar]==index){
              li.addClass('active');
            }
          });
          $compile(elm.contents())(scope);
        }
        scope.$watch(attrs.pics + '.length',function(pics,oldPics){
          elm.empty();
          createSelectors(scope.$eval(attrs.pics));
          scope[attrs.indexVar] = 0;
        },true);
        scope.$watch(attrs.indexVar,function(index){
          elm.find('li').removeClass('active');
          if(!index){
            elm.find('li:first-child').addClass('active');
            return;
          }
          elm.find('li:nth-child('+ (index+1) +')').addClass('active');
        });
        scope.$watch(attrs.showCheckbox,function(value){
          elm.find('li label').toggle(value);
        });
      }
    };
  }])
 .directive('showOverlay', [function() {
    return {
      restrict: 'A',
      link: function link(scope, elm, attrs) {
        if(attrs.showOverlay){
          elm.append('<div class="overlay"></div>');
          var overlay = elm.find('.overlay');
          scope.$watch(attrs.showOverlay,function(value,oldValue){
            if(value){
              // elm.parent().css('overflow','hidden');
              overlay.stop(true,true).fadeIn(200);
            }else{
              overlay.stop(true,true).fadeOut(200);
              // elm.parent().css('overflow','auto');
            }
          },true);
        }
      }
    };
  }])
 .directive('audio',['$compile', function($compile) {
    return {
      restrict: 'C',
      link: function(scope, elm, attrs){
        attrs.playLabel = attrs.playLabel || '播放录音';
        attrs.stopLabel = attrs.stopLabel || '停止播放';
        elm.text(attrs.playLabel);
        if(attrs.audioSrc){
          elm.on('click',function(e){
            e.preventDefault();
            if(scope.sound){
              scope.sound.stop();
              return false;
            }
            var url = scope.$eval(attrs.audioSrc);
            if(url){
              for(var i in buzz.sounds) {
                  buzz.sounds[i].mute();
              }
              scope.sound = new buzz.sound(url);
              scope.sound.bind('playing',function(){
                elm.text(attrs.stopLabel);
              }).bind('abort pause ended',function(){
                scope.sound = null;
                elm.text(attrs.playLabel);
              }).play();
            }
          });
        }
      }
    };
 }])
 .directive('paperStatus',function(){
    var STATUS = {
      0: '未处理',
      1: '待标错题',
      2: '待录错题',
      3: '待录全卷',
      4: '需重拍',
      5: '错题未解答',
      6: '完成解答'
    };

    return function(scope,elm,attrs){
      scope.$watch(attrs.paperStatus,function(value){
        elm.html(STATUS[value]);
        elm.attr('class','status status-'+value);
        window.elm = elm;
        // angular.element(document).after(elm);
      });
    };
 })
.directive('contenteditable', function() {
return {
  restrict: 'A', // only activate on element attribute
  require: '?ngModel', // get a hold of NgModelController
  link: function(scope, element, attrs, ngModel) {
    if(!ngModel) return; // do nothing if no ng-model
    // Specify how UI should be updated
    var editor = CKEDITOR.inline(element[0]);
    ngModel.$render = function() {
      if(ngModel.$viewValue != editor.getData())
       editor.setData(ngModel.$viewValue || '');
    };

    // Listen for change events to enable binding
    element.bind('keyup change blur', function() {
      scope.$apply(read);
    });

    // Write data to the model
    function read() {
     ngModel.$setViewValue(editor.getData());
    }
   }
 };
})
.directive('stars', function() {
return {
  restrict: 'C',
  require: '?ngModel', // get a hold of NgModelController
  link: function(scope, element, attrs, ngModel) {
    if(!ngModel) return; // do nothing if no ng-model
    var width = element.width();
    ngModel.$formatters = [function(){

    }];
    ngModel.$render = function() {
      element.removeClass('stars1 stars2 stars3 stars4 stars5');
      element.addClass('stars'+ngModel.$viewValue);
    };

    element.on('click',function(e){
      var x = e.pageX - $(this).offset().left;
      var n = Math.ceil(x/width*5);
      ngModel.$setViewValue(n);
      ngModel.$render();
    });
   }
 };
})
.directive('beforeChange', [function(){
  // Runs during compile
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller) {
      var scope = $scope.$new();
      iElm.change(function(e){
        scope.$event = e;
        scope.$eval(iAttrs.beforeChange);
      });
    }
  };
}])
.directive('iviewer', [function(){

  return {
    // require: 'src', // Array = multiple requires, ? = optional, ^ = check parent elements
    restrict: 'C', // E = Element, A = Attribute, C = Class, M = Comment
    // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
    link: function($scope, iElm, iAttrs) {
      function imageLoaded(e){
        var el = $(this);
        var state = iElm.parent().is(':visible');
        iElm.parent().show();
        setTimeout(function(){
          var w = el.iviewer('info','orig_width');
          var h = el.iviewer('info','orig_height');
          var cw = iElm.parent().width();
          el.iviewer('set_zoom',cw/w*100);
          el.iviewer('moveTo',0,-1*h/2);
          // el.once('ivieweronafterzoom',function(){
          //   .iviewer('moveTo',0,-1*h/2);
          // });
          iElm.parent().toggle(state);
        },0);
      }
      var viewer = $(iElm).iviewer({
        src: iAttrs.src,
        zoom_max: 120,
        onFinishLoad: imageLoaded
      });
      viewer.on('load','image',imageLoaded);
      iElm.resize(function(){
        viewer.iviewer('update');
      });
    }
    };
}]);
