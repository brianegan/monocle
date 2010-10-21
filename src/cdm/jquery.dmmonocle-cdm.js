// jquery.dmmonocle-cdm.js - Copyright Regeants of the Nevada System of Higher Education, written by Brian Egan <brian.egan@unlv.edu> (MIT Licensed)

(function($){
	
	/**
	 * Our constructor function using the pseudo-classical structure for maximum performance
	 * (shout out to VegasJS for that tip!). This creates our basic objects and sets
	 * them up to be run through constructor functions.
	 * @public
	 * 
	 * @param {object} options The options passed into our jQuery plugin by the user
	 * @param {object} elem The element on which to act
	 */
	CDM = function(options, elem) {
		
		// Extending the default options with those passed into the plugin
		this.options = $.extend({},	$.fn.dmMonocle.defaults, options);
		this.elem = $(elem);
		
		// The viewer object refers to the actual HTML viewer, and will store the 
		// dimensions of the viewer, as well as current scroll position, etc.
		this.viewer = {
			rotation: (this.options.initRotation) ? this.options.initRotation : 0,
			dim: CDM.calcViewerDimensions()
		};
		
		// dmImage references the properties of the CONTENTdm image
		this.dmImage = {
			dim: {				
				width: this.options.dmImageWidth,
				height: this.options.dmImageHeight
			},
			rotatedDim: CDM.calcDmImageRotatedDimensions()
		};
		
		// The zoomImage is our image that will always stay on the screen
		// becoming larger and smaller as people zoom in and out.
		this.zoomImage = {
			zoom: calcMinZoom(this)
		};
		this.zoomImage.dim = CDM.calcImageDimensions(this.zoomImage.zoom);
		
		// The image object references the properties of the image at the current zoom level / rotation
		if (this.options.initZoom)  {
			this.image = {
				zoom: this.options.initZoom,
				dim: CDM.calcImageDimensions(this.options.initZoom)
			};
		} else {
			this.image = $.extend({},	this.zoomImage);
		}
				
		// The thumbnail object is our, well, thumbnail with a navigator contained inside
		this.thumbnail = {
			visible: (this.options.showThumbnail) ? true : false,
			dim: this.calcThumbnailDimensions()
		};
		
		// The nav is the little box inside the thumbnail that indicates the current position
		// on the image, and which can be used for movement
		this.nav = {
			
		};
						
		// Construct the necessary parts!
		// this.constructMenu()
		// this.constructThumbnail()
		// this.constructNav()
		this.constructZoomImage();
		if (this.options.initZoom) {
			this.zoomZoomImage();
			this.constructImage();
		}
	}; 	
	
}(jQuery));