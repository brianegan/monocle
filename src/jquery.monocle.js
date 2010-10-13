/*
 * jQuery Monocle ===========================================================
 *
 * This is the jQuery plugin definition -- it mostly acts as a router, and 
 * utilizes the methods from the Monocle class. 
 */
  
// Stop JavaScript Lint Warnings Messages
/*jsl:ignoreall*/ 

(function($){

  $.fn.monocle = function(method) {
    
    if (Monocle[method]) {
      return Monocle[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return Monocle.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.monocle');
    }    
  
  };

  /*
   * Expose defaults so they can be overridden
   */
  $.fn.monocle.defaults = {
  	thumbMaxWidth: 120,
    thumbMaxHeight: 120,
    thumbPosition: "TL",
    searchText: "",
    showThumbnail: true,
    initRotation: 0,
    dmBridge: true,
    printing: true,
    urlPrefix: "/",
		menuPosition: 'before'
     
    /* Additional options, not actual defaults
    
    CISOROOT: "/snv",
    CISOPTR: 2678,
    dmImageHeight: 3559,
    dmImageWidth: 5831,
    initX: 0,
    initY: 0,
   
    */ 
  };

})(jQuery);

