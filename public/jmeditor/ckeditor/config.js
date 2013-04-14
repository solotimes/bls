/**
 * @license Copyright (c) 2003-2012, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
  // Define changes to default configuration here.
  // For the complete reference:
  // http://docs.ckeditor.com/#!/api/CKEDITOR.config

  // The toolbar groups arrangement, optimized for two toolbar rows.
  config.toolbarGroups = [
    // { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
    // { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
    // { name: 'links' },
    // { name: 'forms' },
    // { name: 'tools' },
    // { name: 'document',     groups: [ 'mode', 'document', 'doctools' ] },
    // { name: 'others' , groups: ['others','upload']},
    '/',
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    // { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
    { name: 'insert' ,groups: ['insert' , 'others']}
    //{ name: 'styles' },
    //{ name: 'colors' },
    // { name: 'about' }
  ];

  // Remove some buttons, provided by the standard plugins, which we don't
  // need to have in the Standard(s) toolbar.
  config.removeButtons = 'Underline,Subscript,Superscript,Table,HorizontalRule';
  config.extraPlugins = 'upload,jme';
  config.dialog_backgroundCoverOpacity = 0;
  // config.enterMode = CKEDITOR.ENTER_BR;
  CKEDITOR.config.specialChars =
   [
     '×','+','-','÷','≤','≥','∞',"≈",'≠','±',
     '∠','∟','⊥','⦿','∥','△','□',
     '∽','≌','□','%','‰','‱',
     'ɑ','β','θ','ɣ','ω','λ','π',
     '①','②','③','④','⑤','⑥','⑦','⑧','⑨',
     '∵','∴','※','℃','°',
      "¥", "←",'→','↑', '↓',"⇔", "⇑","⇓","⇒",
      '⎨','⎬','⎧','⎣','⎦','⎫',
      '∃','∀','∈','∉','∋','∌','∪','∩','⊂','⊃','⊆','⊇','⊄','⊅','⊈','⊊','⊋','∫','∮'
   ];
};

CKEDITOR.on('dialogDefinition', function(e) {
    var dialogName = e.data.name;
    var dialogDefinition = e.data.definition;
    var oldFunc = dialogDefinition.onShow;
    dialogDefinition.onShow = function() {
      if(oldFunc){
        oldFunc.apply(this,arguments);
      }
      var x = $(window).width()*3/4 - this.getSize().width/2;
      this.move(x,0); // Top center
    };
});