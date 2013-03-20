//=require 'jquery'
//=require 'jquery_ujs'
//=require 'jquery.tokeninput'

(function($){
  $(function(){
    $(document).on('change','input[data-type=select-all]',function(){
      var checked = $(this).is(':checked');
      console.log(checked);
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
  });
})(window.jQuery);