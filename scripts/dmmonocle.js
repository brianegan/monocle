/**************************************
 *
 *	dmMonocle 1.01
 *	by Brian Egan
 *	
 *	Copyright (c) 2009 Board of Regents of the Nevada System of Higher Education, on behalf, of the University of Nevada, Las Vegas
 *	Licensed under MIT License 
 *  http://code.google.com/p/dmmonocle/wiki/License
 *
 *	Changelog v .95-1.01
 *
 *	Goals:
 *    * FIX Thumbnail bug. Best idea: create 4, preloaded divs and append them as necessary. Avoid loading every time.
 *	  * Clean up code for Google Code distribution (Remove old & obsolete comments, run JSLint)
 *	  * Remove wheel events until a solid plan is adopted for wheel movement
 *	  * Make Hide Nav Animation more fun
 *	  * Change main function name to dmMonocle
 *	  * Rename functioinle to dmmonocle.js
 *	
*****************************************************************/

function dmMonocle(dmImgWidth, dmImgHeight, dmCISOPTR, dmCISOROOT) {

	/*****************************************
	*
	*	DEFAULT VARIABLES!
	*
	******************************************/	
	var rotationLevel = 0,
	viewerWidth = $('#dmMonocle').width(),
	viewerHeight = $('#dmMonocle').height(),
	devUrlPrefix = "http://cdmtest.library.unlv.edu",
	bigWidth = dmImgWidth,
	bigHeight = dmImgHeight,
	CISOPTR = dmCISOPTR,
	CISOROOT = dmCISOROOT,
	thumbWidth,
	thumbHeight,
	thumbWidthMax = 120,
	thumbHeightMax = 120,
	tileWidth,
	tileHeight,
	sliderVal,
	initialImageX,
	initialImageY,
	loadImagesTimer,
	hideNav = false,
	tileImageSrc = [],
	tileImageErrorSrc = [],
	tileImageWidth = [],
	tileImageHeight = [],
	tileNum = 0,
	containerSendX,
	containerSendY,
	mainImageWidth,
	mainImageHeight,
	containerWidth,
	containerHeight,
	imagePositionMoveX,
	imagePositionMoveY,
	thumbMainWidthRatio,
	thumbMainHeightRatio,
	
	// Zoom Default - Fit Window!
	viewerWidthRatio = viewerWidth / bigWidth,
	viewerHeightRatio = viewerHeight / bigHeight,
	zoomLevel,
	minZoomlevel;
	
	if (viewerWidthRatio >= viewerHeightRatio) {
		zoomLevel = viewerHeightRatio;
		minZoomLevel = viewerHeightRatio;
	} else {
		zoomLevel = viewerWidthRatio;
		minZoomLevel = viewerWidthRatio;
	}
	
	/*****************************************
	*
	*	BUILDING MAIN IMAGE
	*
	******************************************/
	function buildImage(lvlZoom, lvlRotation, offsetRatioX, offsetRatioY) {
		
		// Builds the menu if one does not exist
		if($('#dmMonocleMenu').length > 0) { 
			// alert("dmMonocleMenu Exists"); 
		} else {
			buildMenu(lvlZoom, lvlRotation);	
		}		
		
		// Cleans out the previous images, timeouts, & nav should there be any
		$('#dmMonocle div').remove();
		$('#dmThumbnail div').remove();
		$('#dmMainImage div').remove();
		$('#dmThumbnail').remove();
		$('#dmMainImageContainer').remove();
		$('#dmMainImage').remove();		
		clearTimeout(loadImagesTimer);
		
		// Adds back in the necessary building blocks
		if (hideNav === true) {
			$('<div id="dmThumbnail"></div>').appendTo('#dmMonocle').css('top', ((thumbHeightMax + 10) * -1) + 'px');
		} else {
			$('<div id="dmThumbnail" style="left:0; top:0"></div>').appendTo('#dmMonocle');	
		}
		$('<div id="dmMainImageContainer"></div>').appendTo('#dmMonocle');
		$('<div id="dmMainImage"></div>').appendTo('#dmMainImageContainer');

		// Adjust the measurements for the rotation
		if (lvlRotation === 0) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;	
		} else if (lvlRotation === 90) {
			bigImageWidth = bigHeight;
			bigImageHeight = bigWidth;
		} else if (lvlRotation === 180) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;
		} else if (lvlRotation === 270) {
			bigImageWidth = bigHeight;
			bigImageHeight = bigWidth;
		}
		
		// Image width & Height. The first set is for content DM.		
		// Note: Even when rotated, the width & height are the same as 0 degrees when building the image URL for ContentDM. Therefore, we have to build 
		// 2 sets of widths/height. One for ContentDM, and one for the actual image height we're loading.
		dmWidth = bigWidth * lvlZoom;
		dmHeight = bigHeight * lvlZoom;
		
		// Actual Image Dimensions relative to rotation
		imageWidth = bigImageWidth * lvlZoom;
		imageHeight = bigImageHeight * lvlZoom;
		
		// Determine the positioning based on offsetRatioX & offsetRatioY		
		imageOffsetX  = imageWidth * offsetRatioX - (viewerWidth / 2);
		imageOffsetY = imageHeight * offsetRatioY - (viewerHeight / 2);
		
		// Offset Containment
		if (imageOffsetX < 0) {
			imageOffsetX = 0;
		} else if (imageOffsetX + viewerWidth > imageWidth) {
			imageOffsetX = imageWidth - viewerWidth;
		}
		if (imageOffsetY < 0) {
			imageOffsetY = 0;						   
		} else if (imageOffsetY + viewerHeight > imageHeight) {
			imageOffsetY = imageHeight - viewerHeight;
		}
		
		// Size the Thumbnail and build the URL for the thumbnail
		if (imageHeight > imageWidth) {
			var thumbRatio = thumbHeightMax / (imageHeight/lvlZoom);
			thumbHeight = thumbRatio * (imageHeight/lvlZoom);
			thumbWidth = thumbRatio * (imageWidth/lvlZoom);
		} else if (imageHeight < imageWidth) {
			thumbRatio = thumbWidthMax / (imageWidth/lvlZoom);
			thumbHeight = thumbRatio *(imageHeight/lvlZoom);
			thumbWidth = thumbRatio * (imageWidth/lvlZoom);
		} else if (imageHeight == imageWidth) {
			thumbRatio = thumbHeightMax / (imageHeight/lvlZoom);
			thumbHeight = thumbRatio * (imageHeight/lvlZoom);
			thumbWidth = thumbRatio * (imageWidth/lvlZoom);
		}
		
		var dmThumbScale = thumbRatio * 100;
		var thumbImage = new Image();
		var thumbSrc = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmThumbScale + "&DMWIDTH=" + thumbWidthMax + "&DMHEIGHT=" + thumbHeightMax + "&DMROTATE=" + lvlRotation;
		
		if (imageWidth <= viewerWidth && imageHeight <= viewerHeight) {						
			
			$(thumbImage)
				.load(function () {
													
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
											
					// Adds the image to the thumbnail div
					$('#dmThumbnail').append(this);
					
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();	
					
					$('#dmThumbnail').width(thumbWidth).height(thumbHeight);
					
					mainImageBG = "url(" + devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#dmMainImage').width(viewerWidth).height(viewerHeight);
					
					$('#dmMainImageContainer').width(viewerWidth).height(imageHeight);
										
					$('#dmMainImage')
						.css('position', 'relative')
						.css('margin', '0 auto')
						.css('background-image', mainImageBG)
						.css('background-position', 'center center')
						.css('background-repeat', 'no-repeat')
						.addClass('dmNoDrag');
			
					// Adds the navigator to the thumbnail
					$('<div class="dmNavigator"></div>')
						.appendTo('#dmThumbnail')
						.width(thumbWidth)
						.height(thumbHeight)
						.css('z-index', '20')
						.addClass("dmNoDrag");
					
					// After building the nav load the images touching it
					loadImages();
					
					})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
		
		} else if (imageWidth <= viewerWidth && imageHeight >= viewerHeight) {
			
			$(thumbImage)
				.load(function () { 
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
											
					// Adds the image to the thumbnail div
					$('#dmThumbnail').append(this);
							
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#dmThumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"dmClickNavLayer\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#dmThumbnail");
					
					mainImageBG = "url(" + devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#dmMainImage').width(viewerWidth).height(imageHeight);
					
					var containerWidth = ($('#dmMainImage').width() + $('#dmMainImage').width() - viewerWidth) + "px";
					var containerHeight = ($('#dmMainImage').height() + $('#dmMainImage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#dmMainImage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#dmMainImage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#dmMainImage').width() - viewerWidth) + "px";
					var imagePositionY = ($('#dmMainImage').height() - viewerHeight - imageOffsetY) + "px";
					imagePositionMoveX = (viewerWidth - viewerWidth);
					imagePositionMoveY = (imageHeight - viewerHeight);
					thumbMainWidthRatio = $('#dmThumbnail img').width() / $('#dmMainImage').width();
					thumbMainHeightRatio = $('#dmThumbnail img').height() / $('#dmMainImage').height();	
					
					$('#dmMainImageContainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					$('#dmMainImage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'center top')
						.css('background-repeat', 'no-repeat')
						.toggleClass('dmHover')
						.bind('dragstart', function() { $(this).toggleClass("dmDragging"); })
						.bind('drag', function(event){ moveImage(event); })
						.bind('dragend', function() { $(this).toggleClass("dmDragging"); loadImages(); })
						.bind("dblclick", function(e){ 
							var posx = 0;
							var posy = 0;
							if (!e) var e = window.event;
							if (e.pageX || e.pageY) 	{
								posx = e.pageX;
								posy = e.pageY;
							}
							else if (e.clientX || e.clientY) 	{
								posx = e.clientX + document.body.scrollLeft
									+ document.documentElement.scrollLeft;
								posy = e.clientY + document.body.scrollTop
									+ document.documentElement.scrollTop;
							}

							dblClickMove(posx, posy);
						});
						 
					buildNav(offsetRatioX, offsetRatioY);
					
					})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
			
		} else if (imageWidth >= viewerWidth && imageHeight <= viewerHeight) {
			
			$(thumbImage)
				.load(function () { 
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
											
					// Adds the image to the thumbnail div
					$('#dmThumbnail').append(this);
							
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#dmThumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"dmClickNavLayer\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#dmThumbnail");
					
					mainImageBG = "url(" + devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#dmMainImage').width(imageWidth).height(viewerHeight);
					
					containerWidth = ($('#dmMainImage').width() + $('#dmMainImage').width() - viewerWidth) + "px";
					containerHeight = ($('#dmMainImage').height() + $('#dmMainImage').height() - viewerHeight) + "px";
					thumbMainWidthRatio = $('#dmThumbnail img').width() / $('#dmMainImage').width();
					thumbMainHeightRatio = $('#dmThumbnail img').height() / $('#dmMainImage').height();
					var containerX = "-" + ($('#dmMainImage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#dmMainImage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#dmMainImage').width() - viewerWidth - imageOffsetX) + "px";
					var imagePositionY = ($('#dmMainImage').height() - viewerHeight) + "px";
					imagePositionMoveX = (imageWidth - viewerWidth);
					imagePositionMoveY = (viewerHeight - viewerHeight);
					
					$('#dmMainImageContainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					$('#dmMainImage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'left center')
						.css('background-repeat', 'no-repeat')
						.bind('dragstart', function() { $(this).toggleClass("dmDragging"); })
						.bind('drag', function(event){ moveImage(event); })
						.bind('dragend', function() { $(this).toggleClass("dmDragging"); loadImages(); })
						.bind("dblclick", function(e){ 
							var posx = 0;
							var posy = 0;
							if (!e) var e = window.event;
							if (e.pageX || e.pageY) 	{
								posx = e.pageX;
								posy = e.pageY;
							}
							else if (e.clientX || e.clientY) 	{
								posx = e.clientX + document.body.scrollLeft
									+ document.documentElement.scrollLeft;
								posy = e.clientY + document.body.scrollTop
									+ document.documentElement.scrollTop;
							}

							dblClickMove(posx, posy);
						});
					
					buildNav(offsetRatioX, offsetRatioY);				
					
					})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
			
		} else {
		
			// Build Tile Width & Height. For Larger Images make the Tiles Larger to increase performance and reduce server calls which take a long time to process
			if (imageWidth < 2000 || imageHeight < 2000) {
				tileWidth = 400;
				tileHeight = 400;
			} else if (imageWidth >= 2000 && imageWidth < 3000 || imageHeight >= 2000 && imageHeight < 3000) {
				tileWidth = 400;
				tileHeight = 400;
			} else if (imageWidth >= 3000 && imageWidth < 4000 || imageHeight >= 3000 && imageHeight < 4000) {
				tileWidth = 500;
				tileHeight = 500;
			} else if (imageWidth >= 4000 && imageWidth < 5000 || imageHeight >= 4000 && imageHeight < 5000) {
				tileWidth = 500;
				tileHeight = 500;
			} else if (imageWidth >= 5000 && imageWidth < 6000 || imageHeight >= 5000 && imageHeight < 6000) {
				tileWidth = 600;
				tileHeight = 600;
			} else if (imageWidth >= 6000 && imageWidth < 7000 || imageHeight >= 6000 && imageHeight < 7000) {
				tileWidth = 700;
				tileHeight = 700;
			} else if (imageWidth >= 7000 && imageWidth < 8000 || imageHeight >= 7000 && imageHeight < 8000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 8000 || imageHeight >= 8000) {
				tileWidth = 800;
				tileHeight = 800; 
			}
			
			// Adjusts the main image for the width and height of the current zoom level
			$('#dmMainImage')
				.width(imageWidth).height(imageHeight)
				.css('background-color',  '#EEE')
				.css('position', 'absolute')
				.css('background-image', 'none');
			
			$(thumbImage)
				.load(function () { // As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations					
								
					// Adds the image to the thumbnail div
					$('#dmThumbnail').append(this);
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#dmThumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"dmClickNavLayer\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#dmThumbnail");
					
					// Calculate the exact number of tiles
					var preciseWidth = imageWidth / tileWidth;
					var preciseHeight = imageHeight / tileHeight;
					
					// Round that number up to the nearest integer -- this is how many tiles we'll actually create
					var tileNumWidth = Math.ceil(preciseWidth);
					var tileNumHeight = Math.ceil(preciseHeight);
									
					// Ratio from Thumbnail:Main Image size
					var convertWidth = thumbWidth / imageWidth;
					var convertHeight = thumbHeight / imageHeight;
					
					// Execute the build based on rotation															
					
					// 0 Degrees
					if (lvlRotation === 0) {																				
								
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
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								var bigHeightDecimal = preciseHeight.toString().split(".");
								var bigHeightAfterDec = "." + bigHeightDecimal[1];
								var smallHeightAfterDec = bigHeightAfterDec * convertHeight;
										
								/* EDGE CHECKING */													
								if ((tileNumWidth - 1) - x === 0) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y === 0) { // If so, make it the correct height
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
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";																
										
								$(bigDiv).appendTo('#dmMainImage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";						
										
								$(littleDiv).appendTo('#dmThumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + (tileWidth + 1) + "&DMHEIGHT=" + (tileHeight + 1) + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;															
								tileImageErrorSrc[tileNum] = devUrlPrefix +  "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;															
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++;
							
							}
						}																										
						
					// 90 Degrees
					} else if (lvlRotation == 90) {		
						
						for (x=0;x<tileNumWidth;x++) {
							for (y=tileNumHeight-1;y>=0;y--) {																																	
									
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								bigWidthDecimal = preciseWidth.toString().split(".");
								bigWidthAfterDec = "." + bigWidthDecimal[1];
								smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								bigHeightDecimal = preciseHeight.toString().split(".");
								bigHeightAfterDec = "." + bigHeightDecimal[1];
								smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x === 0) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									bigImageOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);									
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									bigImageOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y == (tileNumHeight-1)) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);									
									bigImageOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning
									bigDivCoordsY = tileHeight * y;
									
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning. 
									// @ 90 Degrees we have to remove the gap left from the edge pieces being smaller than the regular tiles
									var edgeGap = Math.floor(tileHeight * bigHeightAfterDec);
									bigDivCoordsY = (tileHeight * y) - (tileHeight-edgeGap);
								}
								
								// Calculate the X, Y Positioning for the Main Image Tiles
								bigDivCoordsX = tileWidth * x;
																
								// Calculates the X, Y Positioning for the Images in those Tiles
								var bigImageCoordsX = tileWidth * -(y - (tileNumHeight-1));
								var bigImageCoordsY = tileHeight * x;
								
								// Convert the X, Y for the Navigator
								smallDivCoordsX = bigDivCoordsX * convertWidth;
								smallDivCoordsY = bigDivCoordsY * convertHeight;
										
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputHeight;
								y2 = bigImageCoordsY + bigImageOutputWidth;
										
								// Adjust the zoom level to CDM Size
								dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";							
										
								$(bigDiv).appendTo('#dmMainImage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";											
										
								$(littleDiv).appendTo('#dmThumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++;
							
							} // End Y Loop
						} // End X Loop																										
					
					// 180 Degrees
					} else if (lvlRotation == 180) {									
												
						for (y=tileNumHeight-1;y>=0;y--) {																																	
							for (x=tileNumWidth-1;x>=0;x--) {
								
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								bigWidthDecimal = preciseWidth.toString().split(".");
								bigWidthAfterDec = "." + bigWidthDecimal[1];
								smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								bigHeightDecimal = preciseHeight.toString().split(".");
								bigHeightAfterDec = "." + bigHeightDecimal[1];
								smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x == (tileNumWidth - 1)) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									bigImageOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);									
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									// Calculates Y Positioning
									bigDivCoordsX = tileWidth * x;
									
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									bigImageOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									var edgeGapX = Math.floor(tileWidth * bigWidthAfterDec);
									bigDivCoordsX = (tileWidth * x) - (tileWidth-edgeGapX);
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y == (tileNumHeight-1)) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);									
									bigImageOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning
									bigDivCoordsY = tileHeight * y;
									
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning. 
									// @ 90 Degrees we have to remove the gap left from the edge pieces being smaller than the regular tiles
									var edgeGapY = Math.floor(tileHeight * bigHeightAfterDec);
									bigDivCoordsY = (tileHeight * y) - (tileHeight-edgeGapY);
								}																
								
								// Calculates the X, Y Positioning for the Images in those Tiles
								bigImageCoordsX = tileWidth * -(x - (tileNumWidth-1));
								bigImageCoordsY = tileHeight * -(y - (tileNumHeight-1));
								
								// Convert the X, Y for the Navigator
								smallDivCoordsX = bigDivCoordsX * convertWidth;
								smallDivCoordsY = bigDivCoordsY * convertHeight;
								
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputWidth;
								y2 = bigImageCoordsY + bigImageOutputHeight;
										
								// Adjust the zoom level to CDM Size
								dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
	
								$(bigDiv).appendTo('#dmMainImage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";	
								$(littleDiv).appendTo('#dmThumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;
								tileImageErrorSrc[tileNum] = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++;
							
							} // end Y loop
						} // end X Loop																					
					
					// 270 Degrees
					} else if (lvlRotation == 270) {												
						
						for (x=tileNumWidth-1;x>=0;x--) {
							for (y=0;y<tileNumHeight;y++) {																																	
									
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								bigWidthDecimal = preciseWidth.toString().split(".");
								bigWidthAfterDec = "." + bigWidthDecimal[1];
								smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								bigHeightDecimal = preciseHeight.toString().split(".");
								bigHeightAfterDec = "." + bigHeightDecimal[1];
								smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x == (tileNumWidth - 1)) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									bigImageOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);									
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									// Calculates Y Positioning
									bigDivCoordsX = tileWidth * x;
									
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									bigImageOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									edgeGapX = Math.floor(tileWidth * bigWidthAfterDec);
									bigDivCoordsX = (tileWidth * x) - (tileWidth-edgeGapX);
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y === 0) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									bigImageOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								}
								
								// Calculate the X, Y Positioning for the Main Image Tiles
								bigDivCoordsY = tileHeight * y;								
								
								// Calculates the X, Y Positioning for the Images in those Tiles
								bigImageCoordsX = tileWidth * y;
								bigImageCoordsY = tileHeight * -(x - (tileNumWidth-1));								
							
								// Convert the X, Y for the Navigator
								smallDivCoordsX = bigDivCoordsX * convertWidth;
								smallDivCoordsY = bigDivCoordsY * convertHeight;
										
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputHeight;
								y2 = bigImageCoordsY + bigImageOutputWidth;
										
								// Adjust the zoom level to CDM Size
								dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
								$(bigDiv).appendTo('#dmMainImage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";		
								$(littleDiv).appendTo('#dmThumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = devUrlPrefix + "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++;
							
							} // End Y Loop
						} // End X Loop	
						
					} // End Rotation IF													
					
					containerWidth = parseInt(((imageWidth) + (imageWidth) - viewerWidth), 10) + "px";
					containerHeight = ($('#dmMainImage').height() + $('#dmMainImage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#dmMainImage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#dmMainImage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#dmMainImage').width() - viewerWidth - imageOffsetX) + "px";
					var imagePositionY = ($('#dmMainImage').height() - viewerHeight - imageOffsetY) + "px";
									
					$('#dmMainImageContainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					imagePositionMoveX = (imageWidth - viewerWidth);
					imagePositionMoveY = (imageHeight - viewerHeight);									
					containerSendX = $('#dmMainImageContainer').offset().left;
					containerSendY = $('#dmMainImageContainer').offset().top;
					mainImageWidth = $('#dmMainImage').width();
					mainImageHeight = $('#dmMainImage').height();
					thumbMainWidthRatio = $('#dmThumbnail img').width() / $('#dmMainImage').width();
					thumbMainHeightRatio = $('#dmThumbnail img').height() / $('#dmMainImage').height();
					
					
					$('#dmMainImage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.bind('dragstart', function() { $(this).toggleClass("dmDragging"); })
						.bind('drag', function(event){ moveImage(event); })
						.bind('dragend', function() { $(this).toggleClass("dmDragging"); loadImages(); })
						.bind("dblclick", function(e){ 
							var posx = 0;
							var posy = 0;
							if (!e) var e = window.event;
							if (e.pageX || e.pageY) 	{
								posx = e.pageX;
								posy = e.pageY;
							}
							else if (e.clientX || e.clientY) 	{
								posx = e.clientX + document.body.scrollLeft
									+ document.documentElement.scrollLeft;
								posy = e.clientY + document.body.scrollTop
									+ document.documentElement.scrollTop;
							}

							dblClickMove(posx, posy);
						});
						 						
					buildNav(offsetRatioX, offsetRatioY);
						
				})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
		}
	} // end BuildImage
	
	/*****************************************
	*
	*	BUILDING NAV
	*
	******************************************/
	function buildNav(navRatioPosX, navRatioPosY) {
		
		// Calculates the width and Height of the navigator
		var navigatorWidth = (($('#dmThumbnail img').width() / $('#dmMainImage').width()) * viewerWidth);
		var navigatorHeight = (($('#dmThumbnail img').height() / $('#dmMainImage').height()) * viewerHeight);			 

		if (navigatorWidth > $('#dmThumbnail img').width()) {
			navigatorWidth = $('#dmThumbnail img').width();
		}
		if (navigatorHeight > $('#dmThumbnail img').height()) {
			navigatorHeight = $('#dmThumbnail img').height();
		}
		
		// Calculates the default nav position
		navOffsetX = (navRatioPosX * $('#dmThumbnail img').width()) - (navigatorWidth / 2);
		navOffsetY = (navRatioPosY * $('#dmThumbnail img').height()) - (navigatorHeight / 2);
		
		if (navOffsetX < 0) {
			navOffsetX = 0;
		} else if ((navOffsetX + navigatorWidth) > $('#dmThumbnail img').width()) {
			navOffsetX = $('#dmThumbnail img').width() - navigatorWidth;
		}
		
		if (navOffsetY < 0) {
			navOffsetY = 0;
		} else if ((navOffsetY + navigatorHeight) > $('#dmThumbnail img').height()) {
			navOffsetY = $('#dmThumbnail img').height() - navigatorHeight;
		} 
		
		// Binds a click to the nav
		$('#dmThumbnail .dmClickNavLayer')
			.bind("click", function(e){ 
				var posx = 0;
				var posy = 0;
				if (!e) var e = window.event;
				if (e.pageX || e.pageY) 	{
					posx = e.pageX;
					posy = e.pageY;
				}
				else if (e.clientX || e.clientY) 	{
					posx = e.clientX + document.body.scrollLeft
							+ document.documentElement.scrollLeft;
					posy = e.clientY + document.body.scrollTop
							+ document.documentElement.scrollTop;
				}

				clickNav(posx, posy);
			});

		// Adds the navigator to the thumbnail
		$('<div class="dmNavigator"></div>')
			.appendTo('#dmThumbnail')
			.width(navigatorWidth)
			.height(navigatorHeight)
			.css('z-index', '20')
			.css('left', navOffsetX + "px")
			.css('top', navOffsetY + "px")
			.bind('dragstart', function() { $(this).toggleClass("dmDragging"); })						
			.bind('drag', function(event){ moveNav(event); })
			.bind('dragend', function() { $(this).toggleClass("dmDragging"); loadImages(); });
		
		// After building the nav load the images touching it
		loadImagesTimer = setTimeout(function() {
			loadImages();								  
		},750);
		
	}
	
	/*****************************************
	*
	*	BUILDING MENU
	*
	******************************************/
	function buildMenu(initZoomLevel, initRotationLevel) {
		
		/*******************************
		*  CONSTRUCT & BIND THE PARTS
		*******************************/
		
		// Build the Menu Div
		$('<div id="dmMonocleMenu"></div>').insertBefore('#dmMonocle');
		
		// Hide Nav
		var hideNavButton = "<div id='dmMonocleHideNavigator' title='Show/Hide Navigator'>Hide Navigator</div>";
		$(hideNavButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerHideNavigator(); });											
		
		// Fit Window
		var fitWindowButton = "<div id='dmMonocleFitWindow' title='Fit Image to Viewer'>Fit Document to Viewer</div>";
		$(fitWindowButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerFitWindow(); });	
		
		// Fit Width
		var fitWidthButton = "<div id='dmMonocleFitWidth' title='Fit Image to Viewer Width'>Fit Image to Viewer Width</div>";
		$(fitWidthButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerFitWidth(); });		
		
		// Maximum Resolution
		var maxResButton = "<div id='dmMonocleMaxRes' title='Maximum Resolution'>Maximum Resolution</div>";
		$(maxResButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerMaxRes(); });
		
		// Rotate Counterclockwise
		var rotateCounterclockwiseButton = "<div id='dmMonocleRotateCounterclockwise' title='Rotate Counterclockwise'>Rotate Counterclockwise</div>";
		$(rotateCounterclockwiseButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerRotateCounterclockwise(); });
		
		// Rotate Clockwise
		var rotateClockwiseButton = "<div id='dmMonocleRotateClockwise' title='Rotate Clockwise'>Rotate Clockwise</div>";
		$(rotateClockwiseButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerRotateClockwise(); });
		
		// Zoom Out
		var zoomOutButton = "<div id='dmMonocleZoomOut' title='Zoom Out'>Zoom Out</div>";
		$(zoomOutButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerZoomOut(); });
						
		// Zoom Level Gague
		var zoomLevelGague = "<div id='dmZoomLevelGague' title='Zoom Level'>&nbsp;</div>";
		$(zoomLevelGague)
		.appendTo("#dmMonocleMenu")
		.slider({ 
			animate: true,
			max: 100,
			min: (minZoomLevel * 100),
			change: function(event, ui) { sliderZoomInOut(); }
		});
		
		// Zoom In
		var zoomInButton = "<div id='dmMonocleZoomIn' title='Zoom In'>Zoom In</div>";
		$(zoomInButton).appendTo("#dmMonocleMenu").bind('click', function() { viewerZoomIn(); });			
		
		// If dmBridge is enabled, append the "search text" field to the viewer
		if($('#dmObjectSearch').width() > 0) { $('#dmObjectSearch').appendTo('#dmMonocleMenu'); }
		
		// Clear
		var menuClearDiv = "<div class='clear'>&nbsp;</div>";
		$(menuClearDiv).appendTo("#dmMonocleMenu");
				
	}
	
	/*****************************************
	*
	*	LOADING FUNCTIONALITY!
	*
	******************************************/
	function loadImages() {
		
		// Grabs the area coordinates of the navigator
		var navCollisionY1 = parseFloat($('.dmNavigator').css('top'));
		var navCollisionY2 = navCollisionY1 + $('.dmNavigator').height();
		var navCollisionX1 = parseFloat($('.dmNavigator').css('left'));
		var navCollisionX2 = navCollisionX1 + $('.dmNavigator').width();
		
		// Check each div w/o an image yet to see if it is touching the navigator
		$('.collision').each(function() {
			
			// Grabs the area coordinates of the div
			var collisionTop = parseFloat($(this).css('top'));
			var collisionBottom = collisionTop + $(this).height();
			var collisionLeft = parseFloat($(this).css('left'));
			var collisionRight = collisionLeft + $(this).width();
			
			// Checks to see if the div & nav are touching
			if (((navCollisionY1 >= collisionTop && navCollisionY1 <= collisionBottom) || (navCollisionY2 >= collisionTop && navCollisionY2 <= collisionBottom) || (navCollisionY1 < collisionTop && navCollisionY2 > collisionBottom)) && ((navCollisionX1 >= collisionLeft && navCollisionX1 <= collisionRight) || (navCollisionX2 >= collisionLeft && navCollisionX2 <= collisionRight) || (navCollisionX1 < collisionLeft && navCollisionX2 > collisionRight))) {
			
				// If they're touching, load and place the image.				
				var newImageClasses = $(this).attr('class').toString().split(" ");
				var newImageNum = newImageClasses[0];		
				var newImageDiv = "#dmMainImageContainer .tile-" + newImageNum;
				$(this).removeClass('collision');
				
				$(newImageDiv).toggleClass('dmImgTileLoading');
									
				var newImageTile = new Image();
				
				$(newImageTile)
					.load(function () {
						$(newImageDiv).append(this);
						$(newImageDiv).toggleClass('dmImgTileLoading');							
							if(($(this).width() < tileImageWidth[newImageNum] && $(this).width() > 10) || ($(this).height() < tileImageHeight[newImageNum] && $(this).height() > 10)) {
								$(this).width(tileImageWidth[newImageNum]);
								$(this).height(tileImageHeight[newImageNum]);
							}
						})					
					.attr('class', 'tileimage')
					.attr('src', tileImageSrc[newImageNum])
					
					// By design, the program tries to load an image slightly larger than needed. This is due to getimage.exe oftentimes outputting the incorrect image size, mostly 1x1 smaller.
					// This causes Firefox to resize the image within the browser, dramatically slowing down Firefox's performance
					// However, the slightly larger image doesn't always load properly, leaving blank tiles. 
					// If it does this, the program will revert to the exactly sized image which always loads consistently.
					.error(function () {
						var newImageErrorTile = new Image();
							
						$(newImageErrorTile)
							.load(function () {
								$(newImageDiv).append(this);
								$(newImageDiv).toggleClass('dmImgTileLoading');							
									if(($(this).width() < tileImageWidth[newImageNum] && $(this).width() > 10) || ($(this).height() < tileImageHeight[newImageNum] && $(this).height() > 10)) {
										$(this).width(tileImageWidth[newImageNum]);
										$(this).height(tileImageHeight[newImageNum]);
									}
								})					
							.attr('class', 'tileimage')
							.attr('src', tileImageErrorSrc[newImageNum]);						
					});
				
			}
			
		});
		
	}
	
	/*****************************************
	*
	*	MOVEMENT FUNCTIONALITY!
	*
	******************************************/
	// When the main image window is dragged, move it and the navigator as well
	function moveImageNav(mainImageWidth, mainImageHeight, imagePositionX, imagePositionY, thumbImgMoveWidth, thumbImgMoveHeight) {				
		
		var mainLeft = $('#dmMainImage').position().left;
		var mainTop = $('#dmMainImage').position().top;
		
		$('#feedback').html(mainLeft);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((mainLeft - imagePositionX) * ( thumbImgMoveWidth / mainImageWidth));
		var navTop = -1 * ((mainTop - imagePositionY) * ( thumbImgMoveHeight / mainImageHeight));
		
		// Converts the Position to the Thumnail Ratio
		$('div.dmNavigator').css('left', navLeft).css('top', navTop);
	}
	
	function moveImage(event) {
		
		// Get the container dimensions
		var container = $('div#dmMainImageContainer');
		var containerX = $(container).offset().left;
		var containerY = $(container).offset().top;
		var containerWidth = $(container).width();
		var containerHeight = $(container).height();	
		
		// Get the nav dimensions
		var mainImage = $('div#dmMainImage');
		var mainImageWidth = $(mainImage).width();
		var mainImageHeight = $(mainImage).height();
		
		// Get the proper nav positioning
		tempX = (event.offsetX) - containerX;
		tempY = (event.offsetY) - containerY;
		
		// $('#feedback').html(tempX + ", " + tempY);
		
		// Create Proper containment
		var mainImageX = tempX + mainImageWidth;
		var mainImageY = tempY + mainImageHeight;
		
		// Max width the container can go
		var containerMaxX = containerWidth - mainImageWidth;
		var containerMaxY = containerHeight - mainImageHeight;		
		
		// If the box is in the proper container, move the Nav
		if (tempX < 0){ 
			tempX = 0; 
		} else if (mainImageX > containerWidth) { 
			tempX = containerMaxX;
		}
  		if (tempY < 0){ 
			tempY = 0;
		} else if (mainImageY > containerHeight) { 
			tempY = containerMaxY;
		}
		
		//if (tempX >= 0 && navX <= containerWidth && tempY >= 0 && navY <= containerHeight) { $('div.dmNavigator').css({ left:tempX, top:tempY }); };
  		$(mainImage).css({ left:tempX, top:tempY });
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#dmMainImage').width() - viewerWidth);
		var imagePositionY = ($('#dmMainImage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((tempX - imagePositionMoveX) * thumbMainWidthRatio);
		var navTop = -1 * ((tempY - imagePositionMoveY) * thumbMainHeightRatio);
		
		// Converts the Position to the Thumnail Ratio
		$('div.dmNavigator').css('left', navLeft).css('top', navTop);
		 
	}
	
	// When the thumbnail is double clicked, move the navigator & main image
	function dblClickMove(xPos, yPos) {
		
		// Grabs viewer dimensions
		var viewerWidth = $('#dmMonocle').width();
		var viewerHeight = $('#dmMonocle').height();
		
		// Grabs 
		var mainTempLeft = parseFloat($('#dmMainImage').css('left'));
		var mainTempTop = parseFloat($('#dmMainImage').css('top'));				
		
		// Checks to see which side of the viewer is clicked (left/right), then horizontally moves the image
		if ((xPos - $('#dmMonocle').offset().left) > (viewerWidth / 2)) {
			var mainLeft = (mainTempLeft + viewerWidth / 2) - (xPos - $('#dmMonocle').offset().left);					
			
			// Bounds Checking
			if (mainLeft < 0) {
				mainLeft = 0;	
			} 
			
		} else if ((xPos - $('#dmMonocle').offset().left) < (viewerWidth / 2)) {
			mainLeft = mainTempLeft + (viewerWidth / 2 - (xPos - $('#dmMonocle').offset().left));
			
			// Bounds Checking
			if (mainLeft > $('#dmMainImage').width() - viewerWidth) {
				mainLeft = $('#dmMainImage').width() - viewerWidth;
			}
			
		} else if ((xPos - $('#dmMonocle').offset().left) == (viewerWidth / 2)) {
			mainLeft = mainTempLeft;						
		}
		
		// Checks to see which half of the viewer is clicked (top/bottom), then vertically moves the image
		if ((yPos - $('#dmMonocle').offset().top) > (viewerHeight / 2)) {
			var mainTop = (mainTempTop + viewerHeight / 2) - (yPos - $('#dmMonocle').offset().top);
			
			// Bounds Checking
			if (mainTop < 0) {
				mainTop = 0;	
			} 
			
		} else if ((yPos - $('#dmMonocle').offset().top) < (viewerHeight / 2)) {
			mainTop = mainTempTop + (viewerHeight / 2 - (yPos - $('#dmMonocle').offset().top));
			
			// Bounds Checking
			if (mainTop > $('#dmMainImage').height() - viewerHeight) {
				mainTop = $('#dmMainImage').height() - viewerHeight;
			}
			
		} else if ((yPos - $('#dmMonocle').offset().top) == (viewerHeight / 2)) {
			mainTop = mainTempTop;
		}					
							
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#dmMainImage').width() - viewerWidth);
		var imagePositionY = ($('#dmMainImage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((mainLeft - imagePositionX) * ($('#dmThumbnail img').width() / $('#dmMainImage').width()));
		var navTop = -1 * ((mainTop - imagePositionY) * ($('#dmThumbnail img').height() / $('#dmMainImage').height()));
		
		// Converts the Position to the Thumnail Ratio
		$('#dmMainImage').animate(
			{ 
				top: mainTop,
				left: mainLeft			
			}, "normal", "swing");	
		
		// Converts the Position to the Thumnail Ratio
		$('div.dmNavigator').animate(
			{ 
				top: navTop,
				left: navLeft
							
			}, "normal", "swing",
			function() {
				loadImages();
			});
		 
	}
	
	// When the nav is dragged, move it and the main image window as well
	function moveNav(event) {			
		
		// Get the container dimensions
		var container = $('div#dmThumbnail img');
		var containerX = $(container).offset().left;
		var containerY = $(container).offset().top;
		var containerWidth = $(container).width();
		var containerHeight = $(container).height();
		
		// Get the nav dimensions
		var nav = $('div.dmNavigator');
		var navWidth = $(nav).width();
		var navHeight = $(nav).height();
		
		// Get the proper nav positioning
		tempX = (event.offsetX) - containerX;
		tempY = (event.offsetY) - containerY;
		
		// Create Proper containment
		var navX = tempX + navWidth;
		var navY = tempY + navHeight;

		// If the box is in the proper container, move the Nav
		// Max width the container can go
		var containerMaxX = containerWidth - navWidth;
		var containerMaxY = containerHeight - navHeight;
		
		// If the box is in the proper container, move the Nav
		if (tempX < 0) { 
			tempX = 0; 
		} else if (navX > containerWidth) { 
			tempX = containerMaxX;
		}
  		if (tempY < 0) { 
			tempY = 0;
		} else if (navY > containerHeight) { 
			tempY = containerMaxY;
		}
	
  		$(nav).css({ left:tempX, top:tempY });
		
		// Get MainImage Position Information
		var navLeft = ($('.dmNavigator').offset().left - $('#dmThumbnail').offset().left);
		var navTop = ($('.dmNavigator').offset().top - $('#dmThumbnail').offset().top);
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#dmMainImage').width() - viewerWidth);
		var imagePositionY = ($('#dmMainImage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var mainLeft = imagePositionX + -1 * (($('#dmMainImage').width() / $('#dmThumbnail img').width()) * navLeft);
		var mainTop = imagePositionY + -1 * (($('#dmMainImage').height() / $('#dmThumbnail img').height()) * navTop);
		
		// Converts the Position to the Thumnail Ratio
		$('#dmMainImage').css('left', mainLeft).css('top', mainTop);
		 
	}
	
	
	// When the thumbnail is double clicked, move the navigator & main image
	function clickNav(xPos, yPos) {		
	
		var navigatorTempWidth = $('div.dmNavigator').width();
		var navigatorTempHeight = $('div.dmNavigator').height();
		var navTop = (yPos - $('#dmThumbnail').offset().top) - (navigatorTempHeight / 2);
		var navLeft = (xPos - $('#dmThumbnail').offset().left) - (navigatorTempWidth / 2);
		
		if ((navTop + navigatorTempHeight) > $('#dmThumbnail img').height()) {
			navTop = $('#dmThumbnail img').height() - navigatorTempHeight;
		}
		else if (navTop < 0) {
			navTop = 0;
		}
		if ((navLeft + navigatorTempWidth) > $('#dmThumbnail img').width()) {
			navLeft = $('#dmThumbnail img').width() - navigatorTempWidth;
		}
		else if (navLeft < 0) {
			navLeft = 0;
		}
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#dmMainImage').width() - viewerWidth);
		var imagePositionY = ($('#dmMainImage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var mainLeft = imagePositionX + -1 * (($('#dmMainImage').width() / $('#dmThumbnail img').width()) * navLeft);
		var mainTop = imagePositionY + -1 * (($('#dmMainImage').height() / $('#dmThumbnail img').height()) * navTop);
		
		// Converts the Position to the Thumnail Ratio
		$('#dmMainImage').animate(
			{ 
				top: mainTop,
				left: mainLeft			
			}, "normal", "swing");
		
		// Converts the Position to the Thumnail Ratio
		$('div.dmNavigator').animate(
			{ 
				top: navTop,
				left: navLeft
							
			}, "normal", "swing",
			function() {
				loadImages();
			});
		 
	}
	
	/*****************************************
	*
	*	ZOOMING FUNCTIONALITY
	*
	******************************************/
	function dblClickZoom(xScrollPos, yScrollPos, scrollZoomLvl) {
		
		if (scrollZoomLvl + 0.1 > 1) {
				var newScrollZoomLvl = 1;
		} else {
			newScrollZoomLvl = Math.round((scrollZoomLvl + 0.1)*100) / 100;
			zoomLevel = newScrollZoomLvl;
		}
		
		// Grabs viewer dimensions
		var viewerWidth = $('#dmMonocle').width();
		var viewerHeight = $('#dmMonocle').height();
		
		// Grabs default position of the main image
		var defaultMainLeft = $('#dmMainImage').width() - viewerWidth;
		var defaultMainTop = $('#dmMainImage').height() - viewerHeight;
		
		// Grabs current position of the main image
		var mainTempLeft = parseFloat($('#dmMainImage').css('left'));
		var mainTempTop = parseFloat($('#dmMainImage').css('top'));
		
		var tempImageWidth = $('#dmMainImage').width() / scrollZoomLvl;
		var tempImageHeight = $('#dmMainImage').height() / scrollZoomLvl;
				
		// Get the Ratio of the zoomed spot to the top, left corner of the image
		var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#dmMonocle').offset().left)) / (tempImageWidth * scrollZoomLvl);
		var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#dmMonocle').offset().top)) / (tempImageHeight * scrollZoomLvl);
		
		var checkMathX = (bigHeight * newScrollZoomLvl * zoomOffsetRatioX); 
		var checkMathY = (bigWidth * newScrollZoomLvl * zoomOffsetRatioY);
		
		buildImage(newScrollZoomLvl, rotationLevel, zoomOffsetRatioX, zoomOffsetRatioY);

	}

	/*****************************************
	*
	*	MENU FUNCTIONALITY!
	*
	******************************************/
	function viewerZoomIn() {
		if (zoomLevel + 0.05 < 1) {
			zoomLevel = Math.round((zoomLevel + 0.05)*100) / 100;
			
			var navTempLeft = parseFloat($('.dmNavigator').css('left'));
			var navTempTop = parseFloat($('.dmNavigator').css('top'));
							
			var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
			var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
					
			$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
			
			buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			
		} else if (zoomLevel + 0.1 >= 1) {
			
			if (zoomLevel == 1) {
				zoomLevel = 1;
			} else {
				zoomLevel = 1;	
			
				navTempLeft = parseFloat($('.dmNavigator').css('left'));
				navTempTop = parseFloat($('.dmNavigator').css('top'));
								
				navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
				navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
						
				$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
				
				buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			}
		}				
		
	}
	
	function viewerZoomOut() {
		
		if (zoomLevel - 0.05 > minZoomLevel) {
			zoomLevel = Math.round((zoomLevel - 0.05)*100) / 100;
			
			var navTempLeft = parseFloat($('.dmNavigator').css('left'));
			var navTempTop = parseFloat($('.dmNavigator').css('top'));
							
			var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
			var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
					
			$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
			
			buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);			
			
		} else if (zoomLevel - 0.05 <= minZoomLevel) {
			if (zoomLevel == minZoomLevel) {
				zoomLevel = minZoomLevel;	
			} else {
				zoomLevel = minZoomLevel;
				
				navTempLeft = parseFloat($('.dmNavigator').css('left'));
				navTempTop = parseFloat($('.dmNavigator').css('top'));
								
				navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
				navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
					
				$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
				
				buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			}
			
		}				
	}
	
	function sliderZoomInOut() {
		
		zoomLevel = $('#dmZoomLevelGague').slider('option', 'value') / 100;
		
		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
								
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
			
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	
	function viewerMaxRes() {
		
		zoomLevel = 1;

		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();	
		
		$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
	}
	
	function viewerFitWindow() {
		
		switch(rotationLevel)
			{
			case 0:
			  var viewerWidthRatio = viewerWidth / bigWidth;
			  var viewerHeightRatio = viewerHeight / bigHeight;			  
			  break;
			case 90:
			  viewerWidthRatio = viewerWidth / bigHeight;
			  viewerHeightRatio = viewerHeight / bigWidth;	
			  break;
			case 180:
			  viewerWidthRatio = viewerWidth / bigWidth;
			  viewerHeightRatio = viewerHeight / bigHeight;	
			  break;
			case 270:
			  viewerWidthRatio = viewerWidth / bigHeight;
			  viewerHeightRatio = viewerHeight / bigWidth;		
			  break; 
		}
		
		if (viewerWidthRatio >= viewerHeightRatio) {
			zoomLevel = viewerHeightRatio;
		} else {
			zoomLevel = viewerWidthRatio;
		}				
		
		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
		
		$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);		
		
	}
	
	function viewerFitWidth() {
		
		switch(rotationLevel)
			{
			case 0:
				zoomLevel = viewerWidth / bigWidth;
			 	break;
			case 90:
		  		zoomLevel = viewerWidth / bigHeight;
			  	break;
			case 180:
				zoomLevel = viewerWidth / bigWidth;
			  	break;
			case 270:
				zoomLevel = viewerWidth / bigHeight;
				break; 
			}
		
		
		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();				
		
		$('#dmZoomLevelGague').slider('option', 'value', (zoomLevel * 100));	
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	function viewerRotateCounterclockwise() {
		switch(rotationLevel)
			{
			case 0:
			  rotationLevel = 90;
			  break;
			case 90:
			  rotationLevel = 180;
			  break;
			case 180:
			  rotationLevel = 270;
			  break;
			case 270:
			  rotationLevel = 0;
			  break; 
			}
		
		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();			
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			
	}
	
	function viewerRotateClockwise() {
		
		switch(rotationLevel)
			{
			case 0:
			  rotationLevel = 270;
			  break;
			case 90:
			  rotationLevel = 0;
			  break;
			case 180:
			  rotationLevel = 90;
			  break;
			case 270:
			  rotationLevel = 180;
			  break; 
			}
		
		var navTempLeft = parseFloat($('.dmNavigator').css('left'));
		var navTempTop = parseFloat($('.dmNavigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.dmNavigator').width() / 2)) / $('#dmThumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.dmNavigator').height() / 2)) / $('#dmThumbnail').height();						
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	function viewerHideNavigator() {
		
		thumbDivTempWidth = (thumbWidth + 10) * -1;
		thumbDivTempHeight = (thumbHeight + 10) * -1;
		
		if (hideNav === true) {
			hideNav = false;
			$('#dmThumbnail').animate({ top: 0, left: 0 }, 200).animate({ top:-30, left: 0 }, 200).animate({ top: 0, left: 0 }, 200);
		} else {
			hideNav = true;
			$('#dmThumbnail').animate({ top: -60, left: 0 }, 200).animate({ top: 0, left: 0 }, 200).animate({ top: thumbDivTempHeight, left: 0 }, 200);
		}
	}
							   
	/*****************************************
	*
	*	IT'S ALIVE!!!
	*
	******************************************/
	buildImage(zoomLevel, rotationLevel, 0, 0);

}