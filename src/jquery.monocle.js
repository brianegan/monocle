/*
 * jQuery Monocle ===========================================================
 *
 * An image viewer built upon jQueryUI's widget factory, meant to support
 * multiple formats, such as Zoomify, CONTENTdm, etc
 *
 * Terminology:
 *   - Viewer: The Viewer DOM Element (jQuery Object)
 *   - sourceImage: The CONTENTdm, Zoomify, etc original source image
 *   - tileImage: The hi-res Sliced Up Version of the Image sewn together
 *   - baseImage: The low-res image that zooms in and out for perspective, 
 *                "replaced" by tileImage once tiles load
 *   - minImage: The properties of the image at the smallest allowed zoom
 *	 - current (prefix): The properties of the various images at the user 
 *                        selected zoom
 *   - thumbnail: The small version of the image which houses the navigator
 *   - navigator: The small box contained by the thumbnail which indicates
 *                current position on the image to the user
 */

(function($){

$.widget("ui.monocle", {
	options: {
		thumbMaxWidth: 120,
    thumbMaxHeight: 120,
    thumbPosition: "TL",
    searchText: "",
    showThumbnail: true,
    rotation: 0,
    dmBridge: true,
    printing: true,
    urlPrefix: "",
		menuPosition: 'before'
	},
	
	// Create a bunch of empty objects to fill during _creation
	viewer: {},
	thumbnail: {},
	navigator: {},

	// Perform Initial Calculations and Launch the viewer!
	_create: function() {

		// Cache Viewer Dimensions for Performance
		this._updateViewerDimensions();

		// Current Image Dimensions
		this._updateRotatedDimensions();

		// Minimum Zoom
		this._updateMimimumZoom();

		// Current Image
		this._updateCurrentImage();

		// Base Image
		this._appendBaseImage();

	},

	/*
	 * Appends ==================================================================
	 *
	 * We need to inject DOM elements onto the page in a consistent manner
	 * from a variety of functions
	 */
	 _appendBaseImage: function() {
		var self = this, 
				baseImage = '<img class="ui-monocle-baseImage" '
									+ 'alt="Base Image: A Low-Res version for quick viewing" '
									+ 'width="' + self.options.currentImageWidth + '" '
									+ 'height="' + this.options.currentImageHeight + '" '
									+ 'src="'
									+ this._getImageSrc({
											width: (self.options.rotation === 0 || self.options.rotation === 180)
													 ? self.options.minImageWidth
													 : self.options.minImageHeight,
											height: (self.options.rotation === 0 || self.options.rotation === 180)
													  ? self.options.minImageHeight
													  : self.options.minImageWidth,
											zoom: self.options.minZoom
										})
									+ '" />';
		
		this.element.append(baseImage);
	},

	/*
	 * Get Image ================================================================
	 *
	 * This is a class to build images and tiles from CONTENTdm in a consistent
	 * way
	 */
	_getImageSrc: function(opts) {
		var zoom = (opts.zoom ? opts.zoom : this.options.zoom) * 100,
				search = opts.searchText ? opts.searchText : this.options.searchText,
		    src = this.options.urlPrefix + "/cgi-bin/getimage.exe?"
						+ "CISOROOT=" + this.options.CISOROOT
						+ "&CISOPTR=" + this.options.CISOPTR
						+ "&DMROTATE=" + this.options.rotation
						+ "&DMSCALE=" + zoom;

		if (opts.width) {
			src += "&DMWIDTH=" + opts.width;
		}
		if (opts.height) {
			src += "&DMHEIGHT=" + opts.height;
		}
		/* if (search) {
			src += "&DMTEXT=" + search;
		} */

		return src;	
	},

	/*
	 * Setters ====================================================================
	 *
	 * Use with calculators to set various dimensions
	 */
	_updateViewerDimensions: function() {
		this.options.viewerWidth = this.element.innerWidth();
		this.options.viewerHeight = this.element.innerHeight();
	},
	_updateMimimumZoom: function(zoom) {
		this.options.minZoom = zoom ? zoom : this._calcMinZoom();
		
		// Need to ensure we set the initial zoom if none exists
		if (!this.options.zoom) {
			this.options.zoom = this.options.minZoom;
		}

		this.options.minImageWidth = this._calcImageDimensions('width', this.options.minZoom);
		this.options.minImageHeight = this._calcImageDimensions('height', this.options.minZoom);
	},
	_updateRotatedDimensions: function(rotation) {
		var rot = rotation ? rotation : this.options.rotation;

		if (rot === 0 || rot === 180) {
			this.options.currentSourceImageWidth = this.options.sourceImageWidth;
			this.options.currentSourceImageHeight = this.options.sourceImageHeight;
		}	else {
			this.options.currentSourceImageWidth = this.options.sourceImageHeight;
			this.options.currentSourceImageHeight = this.options.sourceImageWidth;
		}
	},
	_updateCurrentImage: function() {
		this.options.currentImageWidth = this._calcImageDimensions('width', this.options.zoom);	
		this.options.currentImageHeight = this._calcImageDimensions('height', this.options.zoom);	
	},

	/*
	 * Calculators ==============================================================
	 *
	 */
	_calcImageDimensions: function(dimension, zoom) {
		var z = zoom ? zoom : this.options.zoom;

		switch(dimension) {
			case 'width':
				return this.options.currentSourceImageWidth * z;
			case 'height':
				return this.options.currentSourceImageHeight * z;
			case 'default':
				return;
		}
	},
	_calcMinZoom: function() {
    var minZoomWidthRatio, 
				minZoomHeightRatio;
    
    if (this.options.rotation === 0 || this.options.rotation === 180) {
      minZoomWidthRatio = this.options.viewerWidth / this.options.sourceImageWidth;
      minZoomHeightRatio = this.options.viewerHeight / this.options.sourceImageHeight;
    }	else {
      minZoomWidthRatio = this.options.viewerWidth / this.options.sourceImageHeight;
      minZoomHeightRatio = this.options.viewerHeight / this.options.sourceImageWidth;
		}

    return minZoomWidthRatio >= minZoomHeightRatio ? minZoomHeightRatio : minZoomWidthRatio;
  }
		
});

})(jQuery);
