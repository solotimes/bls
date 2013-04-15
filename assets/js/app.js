//=require 'jquery'
//=require 'jquery_ujs'
//=require 'jquery.tokeninput'

(function($){
  $(function(){
    $(document).on('change','input[data-type=select-all]',function(){
      var checked = $(this).is(':checked');
      $('input[data-type=select]').prop('checked',checked).trigger('change');
    });
    $(document).on('change','input[data-type=select]',function(){
      var checked = $(this).is(':checked');
      $(this).closest('tr').toggleClass('selected',checked);
    });
    $(document).on('click','[data-type=refresh]',function(e){
      e.preventDefault();
      window.location.reload(true);
    });

    var spinner = $('.ajax-spinner').hide();
    var timeHandeler;
    window.hideSpinner = function(){
      $('.ajax-spinner').hide();
    };
    window.showSpinner = function(type,delay){
      var spinner = $('.ajax-spinner');
      spinner.children().hide();
      spinner.children('.'+type).show();
      spinner.stop(false,true).fadeIn();
      if(delay !== undefined){
        clearTimeout(timeHandeler);
        timeHandeler = setTimeout(function(){
          spinner.fadeOut();
        },delay);
      }
    };
    if( $.facebox){
      $.facebox.settings.opacity = 0.8;
      $.facebox.settings.closeImage = '/img/closelabel.png';
      $.facebox.settings.loadingImage = '/img/loading.gif';
    }
    $('a.close').click(function(){
      window.close();
    });
  });

  function getCaretPosition(editableDiv) {
      var caretPos = 0, containerEl = null, sel, range;
      if (window.getSelection) {
          sel = window.getSelection();
          if (sel.rangeCount) {
              range = sel.getRangeAt(0);
              if (range.commonAncestorContainer.parentNode == editableDiv) {
                  caretPos = range.endOffset;
              }
          }
      } else if (document.selection && document.selection.createRange) {
          range = document.selection.createRange();
          if (range.parentElement() == editableDiv) {
              var tempEl = document.createElement("span");
              editableDiv.insertBefore(tempEl, editableDiv.firstChild);
              var tempRange = range.duplicate();
              tempRange.moveToElementText(tempEl);
              tempRange.setEndPoint("EndToEnd", range);
              caretPos = tempRange.text.length;
          }
      }
      return caretPos;
  }

  $.fn.getCareXY = function(){
    var offset = getCaretPosition(this[0]),
         $org = this,
         $el = $org.clone(),
         ch = $el.text().substr(offset-1, 1);
         var html = '<span class="ins_str">' + ch + '</span>';
         $el.html($el.text().substr(0, offset - 1) + html + $el.text().substr(offset));
    var x = $org.offset().left,
       y = $org.offset().top,
       width = $org.width(),
       height = $org.height();

    $el.css({
       'position': 'absolute',
       'top': y,
       'left': x,
       'width': width,
       'height': height,
       'opacity': 0
    });
    $org.before($el);

    var $span = $el.find('span.ins_str');
    var ch_x,ch_y;
    if ($span.length > 0){
      offset = $span.offset();
      ch_x = offset.left - $(this).scrollLeft();
      ch_y = offset.top - $(this).scrollTop();
    }
    $el.remove();

    if(!!ch_x || !!ch_y)
      return {x:ch_x,y:ch_y};
  };

})(window.jQuery);