/**
 * @author Brian
 *
 *
 *
 *
 *
 */
(function ($) {
			
	$.fn.dmMonocle = function (options) {
				
		var opts = $.extend({}, $.fn.dmMonocle.defaults, options);
		
		function calcMinZoom() {
			
			var minZoomLevel;
			
			switch (o.rotation) {
			case 0:
				viewer.minZoomWidthRatio = viewer.width / o.dmImageWidth;
				viewer.minZoomHeightRatio = viewer.height / o.dmImageHeight;			  
				break;
			case 90:
				viewer.minZoomWidthRatio = viewer.width / o.dmImageHeight;
				viewer.minZoomHeightRatio = viewer.height / o.dmImageWidth;	
				break;
			case 180:
				viewer.minZoomWidthRatio = viewer.width / o.dmImageWidth;
				viewer.minZoomHeightRatio = viewer.height / o.dmImageHeight;	
				break;
			case 270:
				viewer.minZoomWidthRatio = viewer.width / o.dmImageHeight;
				viewer.minZoomHeightRatio = viewer.height / o.dmImageWidth;		
				break; 
			}
	
			if (viewer.minZoomWidthRatio >= viewer.minZoomHeightRatio) {
				minZoomLevel = viewer.minZoomHeightRatio;
			} else {
				minZoomLevel = viewer.minZoomWidthRatio;
			}
			
			return minZoomLevel;
		
		} // end minZoom()
		
		function calcViewerDimensions() {
			return { width: $this.width(), height: $this.height() };
		}
		
		function calcDmImageRotatedDimensions() {
			
			var rotatedWidth, rotatedHeight;
			
			switch (o.rotation) {
			case 0:
				rotatedWidth = o.dmImageWidth;
				rotatedHeight = o.dmImageHeight;
				break;
			case 90:
				rotatedWidth = o.dmImageHeight;
				rotatedHeight = o.dmImageWidth;
				break;
			case 180:
				rotatedWidth = o.dmImageWidth;
				rotatedHeight = o.dmImageHeight;
				break;
			case 270:
				rotatedWidth = o.dmImageHeight;
				rotatedHeight = o.dmImageWidth;
				break; 
			}
			
			return { width: rotatedWidth, height: rotatedHeight };
		}
		
		return this.each(function () {
		    		
		    var $this = $(this), 						
			dmImage = {
				dim: {
				    width: o.dmImageWidth,
					height: o.dmImageHeight
				},
				CISOROOT: o.CISOROOT,
				CISOPTR: o.CISOPTR				
			},
			displayImage = {},
			viewer = {},
			thumb = {},
			nav = {},			
			container = {};		
			
			function init() {
				
				viewer.dim = calcViewerDimensions();						
				
				viewer.minZoom = calcMinZoom();
				viewer.zoom = o.zoom ? o.zoom : viewer.minZoom;
												
				dmImage.rotatedDim = calcDmImageRotatedDimensions();				
				
				// The image has 2 sets of width & height. The first for
				// this program, the second for CONTENTdm getimage.exe, which
				// always uses the w & h at 0 deg rotation
				displayImage.dim = {
				    width: dmImage.rotatedDim.width * viewer.zoom,
					height: dmImage.rotatedDim.height * viewer.zoom,
					dmWidth: dmImage.dim.width * viewer.zoom,
					dmHeight: dmImage.dim.height * viewer.zoom
				};
													
				// TODO Write initial position functionality
				//viewer.offsetRatio.x = calcViewerOffsetX();
				//viewer.offsetRatio.y = calcViewerOffsetY();												
				viewer.prevRotation = viewer.rotation;
												
			} // end init()
			
		}); // end $.each() iteration
		
    }; // end $.fn.dmMonocle
	
	
	// Exposing the defaults so they can be overwritten.
    $.fn.dmMonocle.defaults = {
        thumbMaxWidth: 120,
        thumbMaxHeight: 120,
        thumbPosition: "TL",
        searchText: "",
        showNavigator: true,
        initX: 0,
        initY: 0,
        initRotation: 0,
        dmBridge: true,
        printing: true,
        urlPrefix: "/"
        
        /* Additional options, not actual defaults
         * TODO: Move options explanation into documentation above
         * CISOROOT: "/snv",
         * CISOPTR: 2678,
         * dmImageHeight: 3559,
         * dmImageWidth: 5831,
        */
        
    };
  
}(jQuery));