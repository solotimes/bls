CKEDITOR.plugins.add('upload',
{
  init: function (editor) {
    editor.addCommand( 'OpenUploadDialog',new CKEDITOR.dialogCommand( 'UpDialog' ) );
    editor.ui.addButton('FileUpload',
    {
      label: 'Upload images',
      command: 'OpenUploadDialog',
      icon: CKEDITOR.plugins.getPath('upload') + 'icon.png'
    });
    CKEDITOR.dialog.add( 'UpDialog', function( editor ){
      var dialogDefinition =
      {
        title : 'Upload',
        minWidth : 400,
        minHeight : 300,
        contents : [
        {
          expand : true,
          padding : 0,
          elements :
          [
          {

            type : 'html',
            html : ' <iframe src="/uploads" style="width:100%;height:300px" />'
          }
          ]
        }
        ],
        onOk: function() {
            var dom = this.definition.dialog.getElement().$;
            var iframe = $(dom).find('iframe')[0];
            var img = iframe.contentWindow.$(iframe.contentWindow).data('file');
            if(!!img && img.length)
              editor.insertHtml("<img src='"+ img +"'/>");
            return;
        }
      };
      return dialogDefinition;
    } );

  }
});