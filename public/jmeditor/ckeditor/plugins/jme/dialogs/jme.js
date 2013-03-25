CKEDITOR.dialog.add( 'jmeDialog', function( editor ) {
    return {
        title: "JMEditor " + JMEditor.versionName,
        minWidth: 500,
        minHeight: 300,
        contents: [
            {
                id: 'tab-basic',
                label: 'Editor',
                elements: [
                    {
                        //mathquill-editable ø…±‡º≠
                        //mathquill-rendered-math “—æ≠‰÷»æ
                        //mathquill-embedded-latex ÷ª◊ˆæ≤Ã¨‰÷»æ
                        type: 'html',
                        //CKEDITOR.basePath
                        //jmeditor1.0/ckeditor/plugins/jme/dialogs/mathdialog.html
                        html: '<div style="width:500px;height:300px;"><iframe id="math_frame" style="width:500px;height:300px;" frameborder="no" src="' + CKEDITOR.basePath + 'plugins/jme/dialogs/mathdialog.html"></iframe></div>'
                    }
                ]
            }
        ],
        onShow : function(){
            //$("#jme-math",getIFrameDOM("math_frame")).mathquill("focus");
        },
        onOk: function() {
            // var thedoc = document.frames ? document.frames('math_frame').document : getIFrameDOM("math_frame");
            var dom = this.definition.dialog.getElement().$;
            var iframe = $(dom).find('iframe')[0];
            var latex = iframe.contentWindow.$('#jme-math').mathquill('latex');
            iframe.contentWindow.$('#jme-math').mathquill('latex','');
            // var temp = $($("#jme-math",iframe)[0].outerHTML).mathquill();
            // var latex = temp.mathquill('latex');
            // console.log(latex);
            // temp.mathquill('revert');
            editor.insertHtml('&nbsp;&nbsp;<span class="math">'+latex+'</span>&nbsp;&nbsp;');
            $(editor.element.$).trigger('insertMath');
            // $("#jme-math",iframe).mathquill('latex','');
            // var mathHTML = '<span class="mathquill-rendered-math" style="font-size:' + JMEditor.defaultFontSize + ';" >' + $("#jme-math",iframe).html() + '</span><span>&nbsp;</span>';
            // editor.insertHtml(mathHTML);
                    return;
        }
    };
});

function getIFrameDOM(fid){
    var fm = getIFrame(fid);
    return fm.document||fm.contentDocument;
}
function getIFrame(fid){
    return document.getElementById(fid)||document.frames[fid];
}