/**************************************
	dmBridge Image Viewer
	version .5
	by Brian Egan

ChangeLog version 0 - version .5:
	
	* Loads in images from contentDM based on their CISOPTR & CISOROOT
	* Accepts Basic Zoom Functionality
	* Adds a tiled image viewer to the "viewer" div
	* Tiles are automatically sized based on image size for performance (
		(the server takes a long time to process a lot of small tile images on large source images)
	* Builds a small navigator
	* Ajax image loading based on navigator position when it touches a tile
	* Dragging functionality between the navigator and the viewer image
	* Cleaned up the code as much as possible from previous builds
	* Added comments for some explanation of my madness & to restructure
	* The goal of this version was to start a versioning system, clean up the code a little, add the comments, and validate basic functionality
	* Tested as working in Mozilla Firefox 3.0.4, Internet Explorer 6 & 7, Safari 3.2.1, Google Chrome 4.154.25, and Opera 9.62
	
*****************************************************************/

$(document).ready(function() {
						   				   
	/*****************************************
	*
	*	DEFAULT VARIABLES!
	*
	******************************************/					   
	var zoomLevel = .4;
	var rotationLevel = 0;
	var viewerWidth = 730;
	var viewerHeight = 500;
	var bigWidth = 10360;
	var bigHeight = 9590;
	var CISOPTR = 426;
	var CISOROOT = "LV_Maps";
	var thumbWidth;
	var thumbHeight;
	var tileWidth;
	var tileHeight;
	var sliderVal;
	var tileImageSrc = new Array();
	var tileImageWidth = new Array();
	var tileImageHeight = new Array();
	
	/*****************************************
	*
	*	BUILDING FUNCTIONALITY!
	*
	******************************************/
	function buildImage(lvlZoom, lvlRotation) {
		
		// Image width & Height
		imageWidth = bigWidth * lvlZoom;
		imageHeight = bigHeight * lvlZoom;
		
		// Build Tile Width & Height. For Larger Images make the Tiles Larger to increase performance and reduce server calls which take a long time to process
		if (imageWidth < 3000 || imageHeight < 3000) {
			tileWidth = 500;
			tileHeight = 500; 
		} else if (imageWidth >= 3000 && imageWidth < 4000 || imageHeight >= 3000 && imageHeight < 4000) {
			tileWidth = 500;
			tileHeight = 500;
		} else if (imageWidth >= 4000 && imageWidth < 5000 || imageHeight >= 4000 && imageHeight < 5000) {
			tileWidth = 600;
			tileHeight = 600;
		} else if (imageWidth >= 5000 && imageWidth < 6000 || imageHeight >= 5000 && imageHeight < 6000) {
			tileWidth = 700;
			tileHeight = 700;
		} else if (imageWidth >= 6000 && imageWidth < 7000 || imageHeight >= 6000 && imageHeight < 7000) {
			tileWidth = 800;
			tileHeight = 800;
		} else if (imageWidth >= 7000 && imageWidth < 8000 || imageHeight >= 7000 && imageHeight < 8000) {
			tileWidth = 900;
			tileHeight = 900;
		} else if (imageWidth >= 8000 || imageHeight >= 8000) {
			tileWidth = 1000;
			tileHeight = 1000;
		}
		
		// Cleans out the previous images & nav should there be any
		$('#thumbnail img').remove();
		$('#thumbnail div').remove();
		$('#mainimage div').remove();
		
		// Adjust the measurements for the rotation
		if (lvlRotation == 0) {
				
		} else if (lvlRotation = 90) {
			
		} else if (lvlRotation = 180) {
			
		} else if (lvlRotation = 270) {
			
		}
		
		// Adjusts the main image for the width and height of the current zoom level
		$('#mainimage').width(imageWidth).height(imageHeight).css('background-color',  '#EEE').css('position', 'absolute');
		
		// Loads in the new thumbnail based on rotation
		var thumbImage = new Image();
		var thumbSrc = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=%2F" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=1&DMWIDTH=160&DMHEIGHT=160&DMROTATE=" + lvlRotation;
		
		$(thumbImage)
					.load(function () { 
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
									
						// Adds the image to the thumbnail div
						$('#thumbnail').append(this);
						
						// Gets those measurements I was talking about!
						thumbWidth = $(this).width();
						thumbHeight = $(this).height();
						
						// Calculate the exact number of tiles
						var preciseWidth = (imageWidth) / tileHeight;
						var preciseHeight = (imageHeight) / tileHeight;
						
						// Round that number up to the nearest integer -- this is how many tiles we'll actually create
						var tileNumWidth = Math.ceil(preciseWidth);
						var tileNumHeight = Math.ceil(preciseHeight);
							
						// Ratio from Thumbnail:Main Image size
						var convertWidth = thumbWidth / (imageWidth);
						var convertHeight = thumbHeight / (imageHeight);
						
						// Ladies and Gents, start your tile number calculator!
						var tileNum = 0;
	
						// Performs the loops based on rotation
						for (y=0;y<tileNumHeight;y++) {
							for (x=0;x<tileNumWidth;x++) {
							
								// Calculate the X, Y Positioning for the Main Image Tiles
								var bigDivCoordsX = tileWidth * x; 
								var bigDivCoordsY = tileHeight * y;
								
								// Convert the X, Y for the Navigator
								var smallDivCoordsX = bigDivCoordsX * convertWidth;
								var smallDivCoordsY = bigDivCoordsY * convertHeight;
							
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								var bigWidthDecimal = preciseWidth.toString().split(".");
								var bigWidthAfterDec = "." + bigWidthDecimal[1];
								var smallWidthAfterDec = bigWidthAfterDec * convertWidth;
								
								// Grabs the remainder o the prcise height to calculate the boxes on the vertical edge
								var bigHeightDecimal = preciseHeight.toString().split(".");
								var bigHeightAfterDec = "." + bigHeightDecimal[1];
								var smallHeightAfterDec = bigHeightAfterDec * convertHeight;
								
								// Checks to see if it is an edge box.
								if ((tileNumWidth - 1) - x == 0) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								}
								
								// Checks to see if it is an edge box 
								if ((tileNumHeight - 1) - y == 0) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								}
								
								// X2, Y2 for Content DM GetImage
								x2 = bigDivCoordsX + bigTileOutputWidth;
								y2 = bigDivCoordsY + bigTileOutputHeight;
								
								// Adjust the zoom level to CDM Size
								var dmScale = lvlZoom * 100;
								
								// Create the divs in which to place the images
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; z-index: 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
								
								$(bigDiv).appendTo('#mainimage');
								
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; z-index: 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";
								
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
								
								// Builds the Array of images to load, and an array for the width and height of those
								tileImageSrc[tileNum] = "http://digital.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=/" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;
								
								tileImageWidth[tileNum] = bigTileOutputWidth;
								
								tileImageHeight[tileNum] = bigTileOutputHeight;
								
								// Progress tileNum
								tileNum++
								
							}
						}
								
						var containerWidth = parseInt(((imageWidth) + (imageWidth) - viewerWidth)) + "px";
						var containerHieght = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
						var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
						var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
						var imagePositionX = ($('#mainimage').width() - viewerWidth) + "px";
						var imagePositionY = ($('#mainimage').height() - viewerHeight) + "px";
								
						$('#mainimagecontainer')
							.css('position', 'absolute')
							.css('width', containerWidth)
							.css('height', containerHieght)
							.css('left', containerX)
							.css('top', containerY);
									
						$('#mainimage')
							.css('position', 'absolute')
							.css('left', imagePositionX)
							.css('top', imagePositionY);
									
								
						$('#mainimage').draggable( { containment: '#mainimagecontainer', drag: function() { moveImage(); }, stop: function() { loadImages(); } } );
						
						buildNav();
						
						})
					.attr('class', 'thumbImage')
					.attr('src', thumbSrc);
				
	}
	
	// Builds the Navigator after the imagei s loaded
	function buildNav() {
		
		// Calculates the width and Height of the navigator
		var navigatorWidth = ($('#thumbnail img').width() / $('#mainimage').width()) * viewerWidth;
		var navigatorHeight = ($('#thumbnail img').height() / $('#mainimage').height()) * viewerHeight;

		if (navigatorWidth > 160) {
			navigatorWidth = $('#thumbnail img').width();
		}
		if (navigatorHeight > 160) {
			navigatorHeight = $('#thumbnail img').height();
		}

		// Adds the navigator to the thumbnail
		$('<div class="navigator"></div>').appendTo('#thumbnail').width(navigatorWidth).height(navigatorHeight).css('z-index', '15').draggable( { containment: '#thumbnail img', drag: function() { moveNav(); }, stop: function() { loadImages(); } } );
		
		// After building the nav load the images touching it (ie displaying in the main viewer)
		loadImages();
		
	}
	
	
	/*****************************************
	*
	*	LOADING FUNCTIONALITY!
	*
	******************************************/
	function loadImages() {
		
		// Grabs the area coordinates of the navigator
		var y1 = parseFloat($('.navigator').css('top'));
		var y2 = y1 + $('.navigator').height();
		var x1 = parseFloat($('.navigator').css('left'));
		var x2 = x1 + $('.navigator').width();
		
		// Check each div w/o an image yet to see if it is touching the navigator
		$('.collision').each(function() {
			
			// Grabs the area coordinates of the div
			var t = parseFloat($(this).css('top'));
			var b = t + $(this).height();
			var l = parseFloat($(this).css('left'));
			var r = l + $(this).width();
			
			// Checks to see if the div & nav are toucing
			if (((y1 >= t && y1 <= b) ||	// Top edge touching
					(y2 >= t && y2 <= b) ||	// Bottom edge touching
					(y1 < t && y2 > b)		// Surrounded vertically
				) && (
					(x1 >= l && x1 <= r) ||	// Left edge touching
					(x2 >= l && x2 <= r) ||	// Right edge touching
					(x1 < l && x2 > r)		// Surrounded horizontally
				))	
		 	{ // If so, load and place the image
				
				var newImageClasses = $(this).attr('class').toString().split(" ");
				var newImageNum = newImageClasses[0];		
				var newImageDiv = "#mainimagecontainer .tile-" + newImageNum;
				$(this).removeClass('collision');
				
				$(newImageDiv).css('background-image', 'url(images/spinner.gif)').css('background-position', 'center center').css('background-repeat', 'no-repeat');
									
				var newImageTile = new Image();
				
				$(newImageTile)
					.load(function () {
						$(newImageDiv).append(this);
						$(newImageDiv).css('background-image', 'none');
						})
					.width(tileImageWidth[newImageNum])
					.height(tileImageHeight[newImageNum])
					.attr('class', 'tileimage')
					.attr('src', tileImageSrc[newImageNum]); 
			}
			
		});
		
	}
	
	// When the main image window is dragged, move the navigator as well
	function moveImage() { 
		
		// Get MainImage Position Information
		var mainLeft = parseFloat($('#mainimage').css('left'));
		var mainTop = parseFloat($('#mainimage').css('top'));
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#mainimage').width() - viewerWidth);
		var imagePositionY = ($('#mainimage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((mainLeft - imagePositionX) * ($('#thumbnail img').width() / $('#mainimage').width()));
		var navTop = -1 * ((mainTop - imagePositionY) * ($('#thumbnail img').height() / $('#mainimage').height()));
		
		// Converts the Position to the Thumnail Ratio
		$('div.navigator').css('left', navLeft).css('top', navTop);
		 
	}
	
	/*****************************************
	*
	*	MOVEMENT FUNCTIONALITY!
	*
	******************************************/
	
	// When the nav is dragged, move the main image window as well
	function moveNav() {
		
		// Get MainImage Position Information
		var navLeft = ($('.navigator').offset().left - $('#thumbnail').offset().left);
		var navTop = ($('.navigator').offset().top - $('#thumbnail').offset().top);
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#mainimage').width() - viewerWidth);
		var imagePositionY = ($('#mainimage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var mainLeft = imagePositionX + -1 * (($('#mainimage').width() / $('#thumbnail img').width()) * navLeft);
		var mainTop = imagePositionY + -1 * (($('#mainimage').height() / $('#thumbnail img').height()) * navTop);
		
		// Converts the Position to the Thumnail Ratio
		$('#mainimage').css('left', mainLeft).css('top', mainTop);	
		 
	}
	
	// Build the initial Image
	buildImage(zoomLevel, rotationLevel);
	
	
	/*****************************************
	*
	*	MENU FUNCTIONALITY!
	*
	******************************************/
	
	
	$('a.plus').bind('mousedown', function() {		
		if (zoomLevel < 1) {
			zoomLevel = zoomLevel + .1;
			buildImage(zoomLevel, rotationLevel);
		} 		
	 });
	
	$('a.minus').bind('mousedown', function() {
		if (zoomLevel > 0) {
			zoomLevel = zoomLevel - .1;
			buildImage(zoomLevel, rotationLevel);	
		}
	});

});