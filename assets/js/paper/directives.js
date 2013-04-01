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
 .directive('questionStatus',function(){
    var STATUS = {
      5: '未解答',
      6: '完成解答',
      8: '待完善'
    };

    return function(scope,elm,attrs){
      scope.$watch(attrs.questionStatus,function(value){
        elm.html(STATUS[value]);
        elm.attr('class','status status-'+value);
      });
    };
 })
 .directive('paperStatus',function(){
    var STATUS = {
      0: '未处理',
      1: '待标错题',
      2: '待录错题',
      3: '待录全卷',
      4: '需重拍',
      5: '错题未解答',
      6: '完成解答',
      7: '已推送',
      8: '待完善',
      9: '待上传主观',
      10: '待批改'
    };

    return function(scope,elm,attrs){
      scope.$watch(attrs.paperStatus,function(value){
        elm.html(STATUS[value]);
        elm.attr('class','status status-'+value);
      });
    };
 })
.directive('contenteditable', function() {
return {
  restrict: 'A', // only activate on element attribute
  require: '?ngModel', // get a hold of NgModelController
  link: function(scope, element, attrs, ngModel) {
    if(!ngModel) return; // do nothing if no ng-model
    var editor = CKEDITOR.inline(element[0]);
    function initMath(){
      element.find('.math').mathquill('editable');
    }
    ngModel.$render = function() {
      editor.setData(ngModel.$viewValue || '');
      if(editor.instanceReady)
        initMath();
      else
        editor.once('instanceReady',initMath);
      // },10);
      // initMath();
    };
    scope.$on('$destroy',function(){
      editor.destroy();
    });
    // element.one('click',function(){
    //   if(!editor)
    //     editor = CKEDITOR.inline(element[0]);
    // });

    // element.on('keyup','.math', function(e) {
    //   var code = (e.keyCode ? e.keyCode : e.which);
    //   if(code == 13 && $(this).data('editing') === true) { //Enter keycode
    //     $(this).mathquill('revert').mathquill().data('editing',false);
    //     e.preventDefault();
    //     e.stopPropagation();
    //   }
    // });

    // element.on('blur','.math',function(e){
    //   var span = $(this);
    //   if(span.is('.mathquill-editable'))
    //     return;
    //   span.replaceWith($('<span class="math">'+span.mathquill('latex')+'</span>'));
    // });

    // element.on('click','.math',function(e) {
    //   var span = $(this);
    //   if(span.is('.mathquill-editable'))
    //     return;
    //   span.replaceWith($('<span class="math">'+span.mathquill('latex')+'</span>'));
    // });

    element.on('keyup blur',function(e){
      // if($(e.target).closest('.math').data('editing'))
      //   return ;
      scope.$apply(read);
    });

    element.on('insertMath' ,function(){
      window.setTimeout(function(){element.find('.math:not(.mathquill-rendered-math)').mathquill('editable');},100);
    });

    // Write data to the model
    function read() {
      var c = element.clone();
      c.find('.math').each(function(i,sp){
        var span = $(sp);
        span.replaceWith($('<span class="math">'+span.mathquill('latex')+'</span>'));
      });
      // .mathquill('latex')
      //   .data('editing','false')
      //   .attr('class','math')
      //   .removeAttr('mathquill-block-id');
      ngModel.$setViewValue(c.html());
      c.remove();
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
    // ngModel.$formatters = [function(){

    // }];
    ngModel.$render = function() {
      element.removeClass('stars1 stars2 stars3 stars4 stars5');
      element.addClass('stars'+ngModel.$viewValue);
    };

    if(!attrs.readonly)
      element.on('click',function(e){
        var x = e.pageX - $(this).offset().left;
        var n = Math.ceil(x/width*5);
        ngModel.$setViewValue(n);
        ngModel.$render();
      });
   }
 };
})
.directive('mathHtml', [function(){
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs){
      $scope.$watch(iAttrs.mathHtml,function(value){
        iElm.empty();
        var c = $(value);
        if(c.is('p'))
          c.unwrap();
        c.find('.math').mathquill();
        iElm.append(c);
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
}])
.directive('slideDown', [function(){
  return {
    link: function($scope, iElm, iAttrs, controller) {

      iElm.toggle($scope.$eval(iAttrs.slideDown));
      $scope.$watch(iAttrs.slideDown,function(v){
        return (v ? iElm.slideDown() : iElm.slideUp());
      });
    }
  };
}])
.directive('row',[function(){
  function makeRow(elements){
    var currentTallest = 0,
         currentRowStart = 0,
         rowDivs = [],
         $el,
         topPosition = 0;
    elements.forEach(function(element) {
       $el = $(element);
       topPostion = $el.position().top;

       if (currentRowStart != topPostion) {
         // we just came to a new row.  Set all the heights on the completed row
         for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
           rowDivs[currentDiv].height(currentTallest);
         }

         // set the variables for the new row
         rowDivs.length = 0; // empty the array
         currentRowStart = topPostion;
         currentTallest = $el.height();
         rowDivs.push($el);

       } else {
         // another div on the current row.  Add it to the list and check if it's taller
         rowDivs.push($el);
         currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
      }

      // do the last row
      for (currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
        rowDivs[currentDiv].height(currentTallest);
      }
    });
  }
  return {
    restrict: 'A',
    link: function($scope, iElm, iAttrs, controller){
      iElm.resize(function(){
        var cols = parseInt(iAttrs.cols,10);
        var row;
        iElm.children().each(function(i,child){
          if(i%cols === 0){
            if(row)
              makeRow(row);
            row = [];
          }
          row.push(child);
        });
        if(row && row.length)
          makeRow(row);
      });
      $scope.$on('$destroy',function(){
        iElm.unbind('resize');
      });
    }
  };
}])
.directive('enableQuestionFilter', ['paper','$compile', function(paper,compile){
  // Runs during compile

  return {
    restrict: 'A',
    // scope: true,
    link: function(scope, iElm, iAttrs, controller) {
      var list,subscope;
      function enable(){
        if(!list){
          subscope = scope.$new();
          list = $(
          '<ul class="sug-list" ng-show="showList && questions.data.length">'+
            '<li ng-repeat="question in questions.data" '+
            'ng-click="selectQuestion(question)">'+
              '<span>{{paper.questionTypes[question.Type]}} {{question.id}}:</span>'+
              '<div math-html="question.Body"/>'+
            '</li></ul>').appendTo('body');
          compile(list[0])(subscope);
          iElm.on('blur',function(){
            subscope.showList = false;
          });
          iElm.on('focus',function(){
            subscope.showList = true;
          });
          subscope.showList = false;
          subscope.selectQuestion = function(question){
            subscope.$question = question;
            if(angular.isDefined(iAttrs.onSwitchQuestion))
              subscope.$eval(iAttrs.onSwitchQuestion);
          };
        }
        iElm.on('keyup',onChange);
      }
      function disable(){
        if(subscope){
          subscope.showList = false;
          delete subscope.questions;
        }
        iElm.off('keyup',onChange);
      }
      function onChange(){
        if(!subscope)
          return;
        subscope.showList = true;
        var keywords = iElm.text().trim();
        if(keywords.length)
          subscope.questions = paper.searchQuestions(keywords);
        // var pos = iElm.getCareXY();
        // console.log(pos);
        var pos = iElm.offset();
        list.css({
          left:pos.left,
          top:pos.top+iElm.height()+10,
          width: iElm.outerWidth() -2
        });
      }
      if(angular.isDefined(iAttrs.enableQuestionFilter))
        scope.$watch(iAttrs.enableQuestionFilter,function(value){
          if(value)
            enable();
          else
            disable();
        });
    }
  };
}]);