/*
 * Monocle Class =============================================================
 *
 * This file contains all the core methods that work for all types of monocles
 */

(function($) {

  /*
   * Calculators ====================================================================
   *
   * We need to make a number of calculations at various points in the program, so
   * I've tried to abstract the most important calculations into a number of helper
   * functions found below.
   */
    
  /**
   * Calculates the Dom Element Dimensions
   * @private
   * @returns width or height 
   * @type Number
   */
  
  function calcViewerDims(ret, el) {
    switch (ret) {
      case 'width':
        return el.innerWidth();
        break;
      case 'height':
        return el.innerHeight();
        break;
      case 'default':
        return 
        break;
    }
  }
  
  /**
   * Calculates the dimensions of the image based on rotation
   * @private
   * @returns width or height
   * @type Number
   */	
  function calcDmImageRotatedDimensions(ret, el) {		
    var rotatedWidth, 
        rotatedHeight,
        data = el.data('monocle');
    
    if (data.rotation === 0 || data.rotation === 180) {
      rotatedWidth = data.options.dmImageWidth;
      rotatedHeight = data.options.dmImageHeight;
    }	else {
      rotatedWidth = data.options.dmImageHeight;
      rotatedHeight = data.options.dmImageWidth;
    }
    
    switch (ret) {
      case 'width':
        return rotatedWidth;
        break;
      case 'height':
        return rotatedHeight; 
        break;
      case 'default':
        return 
        break;
    }
  };
  
  /**
   * Calculate the minimum zoom level based on the dimensions of image
   * @private
   * @returns minimum zoom level in decimal form
   * @type Number
   */
  function calcMinZoom(el) {		
    var minZoomWidthRatio, 
        minZoomHeightRatio,
        data = el.data('monocle');
    
    if (data.rotation === 0 || 180) {
      minZoomWidthRatio = data.viewer.width / data.dmImage.width;
      minZoomHeightRatio = data.viewer.height / data.dmImage.height;
    }	else {
      minZoomWidthRatio = data.viewer.width / data.dmImage.height;
      minZoomHeightRatio = data.viewer.height / data.dmImage.width;
    }
    return minZoomWidthRatio >= minZoomHeightRatio 
           ? minZoomHeightRatio
           : minZoomWidthRatio;
  };

  /**
   * Calculates the dimensions of a given image at a certain rotation and zoom level
   * can be used for our main image as well as the zoomImage
   * @private
   * @returns width or height
   * @type Number
   */		
  function calcImageDimensions(ret, zoom, el) {
    var data = el.data('monocle');

    switch (ret) {
      case 'width':
        return data.dmImage.rotatedWidth * zoom;
        break;
      case 'height':
        return data.dmImage.rotatedHeight * zoom; 
        break;
      case 'default':
        return 
        break;
    }
  };

  /**
  * Calculate the Thumbnail Dimensions
  * @private
  * @returns width or height
  * @type Number
  */
  function calcThumbZoom(ret, el) {
    var minZoomWidthRatio, 
        minZoomHeightRatio,
        data = el.data('monocle');
    
  minZoomWidthRatio = data.options.thumbMaxWidth / data.dmImage.width;
  minZoomHeightRatio = data.options.thumbMaxHeight / data.dmImage.height;
  
  return minZoomWidthRatio >= minZoomHeightRatio 
           ? minZoomHeightRatio
           : minZoomWidthRatio;
  };

  /*
   * Monocle Methods 
   */
  Monocle = {
    
    // Our Init Function is essentially a giant calculator. It runs quite
    // a few calculations and stores the values to the element's data

    init: function(options) {

      return this.each(function(){

        var $this = $(this),
            data = $this.data('monocle'),
            opts = $.extend({},	$.fn.monocle.defaults, options);
         
        // If the plugin hasn't been initialized yet, a bunch of calculations
        // need to occur and be saved to the element's data, then the 
        // various constructors need to be called
        if (!data) {

          // We're not loading in everything into the data object 
          // at once because some methods depend on data being available.
          $this.data('monocle', {
            target : $this,
            options: opts
          });

          // Cache the data object now that it exists
          data = $this.data('monocle');

          // Define the initial Rotation
          data.rotation = data.options.rotation
                          ? data.options.rotation
                          : 0;

          // Our Main DOM Element passed to jQuery
          data.viewer =  { 
            width: calcViewerDims('width', $this),
            height: calcViewerDims('height', $this)
          };
          
          // The Main CONTENTdm Image Properties
          data.dmImage = {
            width: data.options.dmImageWidth,
            height: data.options.dmImageHeight,
            rotatedWidth: calcDmImageRotatedDimensions('width', $this),
            rotatedHeight: calcDmImageRotatedDimensions('height', $this)
          };

          // The Minimum Zoom Properties -- These may be updated based on resized
          // browser 
          data.minZoom = calcMinZoom($this);
          data.minZoomWidth = calcImageDimensions('width', data.minZoom, $this);
          data.minZoomHeight = calcImageDimensions('height', data.minZoom, $this);
          
          // Now that we know the lowest possible zoom, 
          // Use that for the initial zoom level if none exists!
          data.zoom = data.options.zoom
                    ? data.options.zoom
                    : data.minZoom;

          // The Zoom Image. This is the image that will resize as the user
          // zooms in and out with slider or controls 
          // to give a good visual of what zoom level they are are.
          data.image = {
            width: calcImageDimensions('width', data.zoom, $this),
            height: calcImageDimensions('height', data.zoom, $this)
          }

          // The Thumbnail -- the small version used in coordination with the navigator
          // to give the user a sense of what part of the image is being viewed 
          // in any of the four corners (e.g. Left-Top, Left-Bottom, Right-top, right-botto
          data.thumbnail = {
            visible: data.options.showThumbnail
                   ? data.options.showThumbnail
                   : true
          }
        }
      });
    },
    destroy : function( ) {

      return this.each(function(){

        var $this = $(this),
            data = $this.data('monocle');

        // Namespacing FTW -- Lets burn this ish down!
        $(window).unbind('.monocle');
        data.monocle.remove();
        $this.removeData('monocle');

      });
    }
  };
})(jQuery);
