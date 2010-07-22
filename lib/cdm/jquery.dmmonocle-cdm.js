// jquery.dmmonocle.cdmviewer.js - Copyright Regeants of the Nevada System of Higher Education, written by Brian Egan <brian.egan@unlv.edu> (MIT Licensed)

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
			dim: calcViewerDimensions(this)
		}
		
		// dmImage references the properties of the CONTENTdm image
		this.dmImage = {
			dim: {				
				width: this.options.dmImageWidth,
				height: this.options.dmImageHeight
			},
			rotatedDim: calcDmImageRotatedDimensions(this)
		}
		
		// The zoomImage is our image that will always stay on the screen
		// becoming larger and smaller as people zoom in and out.
		this.zoomImage = {
			zoom: calcMinZoom(this)
		}
		this.zoomImage.dim = calcImageDimensions(this, this.zoomImage.zoom)			
		
		// The image object references the properties of the image at the current zoom level / rotation
		if (this.options.initZoom)  {
			this.image = {
				zoom: this.options.initZoom,
				dim: calcImageDimensions(this, this.options.initZoom)
			}
		} else {
			this.image = $.extend({},	this.zoomImage)
		}
				
		// The thumbnail object is our, well, thumbnail with a navigator contained inside
		this.thumbnail = {
			visible: (this.options.showThumbnail) ? true : false,
			dim: calcThumbnailDimensions(this)
		}
		
		// The nav is the little box inside the thumbnail that indicates the current position
		// on the image, and which can be used for movement
		this.nav = {
			
		}
						
		// Construct the necessary parts!
		// this.constructMenu()
		// this.constructThumbnail()
		// this.constructNav()
		this.constructZoomImage();
		if (this.options.initZoom) {
			this.zoomZoomImage();
			this.constructImage();
		}
	}
	
	/*
	 * Constructors ====================================================================
	 *
	 * These functions build things, such as the Images, Thumbnails, Navigators, etc
	 * Generally public so they can be accessed programatically if necessary
	 */
	
	/**
	 * Menu Constructor
	 * @public
	 *  
	 */
	CDM.prototype.constructMenu = function() {
		for (item in this.menuItems) {
			
		}
	}

	/**
	 * Image Constructor that puts together all the tiles at different zoom levels
	 * @publc
	 * 
	 */
	CDM.prototype.constructImage = function() {
		
	}
	
	/**
	 * Zoom Image Constructor 
	 * @public
	 */
	CDM.prototype.constructZoomImage = function() { 
		var zoomImage =  "<div class=\"CDM-zoomImage\"><img src=\"" + this.options.urlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + this.options.CISOROOT + "&CISOPTR=" + this.options.CISOPTR + "&DMSCALE=" + (this.zoomImage.zoom * 100) + "&DMWIDTH=" + this.zoomImage.dim.width + "&DMHEIGHT=" + this.zoomImage.dim.height + "&DMROTATE=" + this.viewer.rotation + "\" /></div>";
		this.elem.append(zoomImage);
	}
		
	/**
	 * Thumbnail constructor
	 * @public
	 */
	CDM.prototype.constructThumbnail = function() {
		var thumbNail = "<img src=\"" + this.options.urlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + this.options.CISOROOT + "&CISOPTR=" + this.options.CISOPTR + "&DMSCALE=" + (this.zoomImage.zoom * 100) + "&DMWIDTH=" + this.zoomImage.dim.width + "&DMHEIGHT=" + this.zoomImage.dim.height + "&DMROTATE=" + this.viewer.rotation + "\" />";
	}
	
	/*
	 * Adjustors ====================================================================
	 *
	 * These take constructed items and Act on them
	 */
	
	/*
	 * Menu parts ====================================================================
	 *
	 * 
	 */
	
	
	/*
	 * Calculators ====================================================================
	 *
	 * Meant to abstract basic calculations so they can be easily used between functions
	 * Most of these are private methods
	 */ 
	function calcThumbnailDimensions(monocle) {
	}
   
	/**
	 * Calculates the Minimum Zoom Level based on the dimensions of the image compared to the dimensions of the viewable area
	 * @private
	 * @returns minimum zoom level in decimal form
	 * @type Number
	 */		
	function calcMinZoom(monocle) {		
		var minZoomWidthRatio, minZoomHeightRatio;
		
		if (monocle.viewer.rotation === 0 || 180) {
			minZoomWidthRatio = monocle.viewer.dim.width / monocle.options.dmImageWidth;
			minZoomHeightRatio = monocle.viewer.dim.height / monocle.options.dmImageHeight;
		}	else {
			minZoomWidthRatio = monocle.viewer.dim.width / monocle.options.dmImageHeight;
			minZoomHeightRatio = monocle.viewer.dim.height / monocle.options.dmImageWidth;
		}
		return minZoomWidthRatio >= minZoomHeightRatio ?
    	minZoomHeightRatio :
      	minZoomWidthRatio;
	}
	
	/**
	 * Calculates the dimensions of the Image at a certain rotation and zoom level
	 * @private
	 * @returns { width, height }
	 * @type Object
	 */		
	function calcImageDimensions(monocle, zoom) {
		return {
			width: monocle.dmImage.rotatedDim.width * zoom,
			height: monocle.dmImage.rotatedDim.height * zoom 
		};
	}
	
	/**
	 * Calculates the current viewer width and Height
	 * @private
   * @param Object el The element 
	 * @returns { width, height }
	 * @type Object
	 */		
	function calcViewerDimensions(monocle) {
		return { 
		  width: monocle.elem.width(), 
		  height: monocle.elem.height() 
		};
	}
	
	/**
	 * Calculates the dimensions of the image based on rotation
	 * @private
	 * @returns { width, height }
	 * @type Object
	 */	
	function calcDmImageRotatedDimensions(monocle) {		
		var rotatedWidth, rotatedHeight;
		
		if (monocle.viewer.rotation === 0 || monocle.viewer.rotation === 180) {
			rotatedWidth = monocle.options.dmImageWidth;
			rotatedHeight = monocle.options.dmImageHeight;
		}	else {
			rotatedWidth = monocle.options.dmImageHeight;
			rotatedHeight = monocle.options.dmImageWidth;
		}
		
		return { width: rotatedWidth, height: rotatedHeight };
	}	
	
}(jQuery));