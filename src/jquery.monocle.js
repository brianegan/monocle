// jquery.dmmonocle.js - Copyright Brian Egan <brian@brianegan.com> (MIT Licensed)
(function ($) {
			
	$.fn.dmMonocle = function (options) {
		// Pattern egregiously stolen from this post: http://alexsexton.com/?p=51
		// Adjusted for performance (Object.create is slow...)
		if (this.length) {
			return this.each(function(){	  
		   	var monocle = new CDM(options, this);
		  	$.data(this, 'dmMonocle', monocle);
			})
		}
	}
	
	// Exposing the defaults so they can be easily overwritten
  $.fn.dmMonocle.defaults = {
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
    * TODO: Move options explanation into documentation above
    * CISOROOT: "/snv",
    * CISOPTR: 2678,
    * dmImageHeight: 3559,
    * dmImageWidth: 5831,
    * initX: 0,
    * initY: 0,
    */ 
	}
  
}(jQuery));
