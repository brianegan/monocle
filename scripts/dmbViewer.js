/**************************************
 *
 *	dmMonocle v1.1
 *	by Brian Egan
 *	
 *	Copyright (c) 2009 University of Nevada, Las Vegas
 *	Licensed under GPLv3 
 *  http://code.google.com/p/dmmonocle/wiki/License  
 *
 *	Changelog v 1.0 - 1.1
 *
 *	Goals:
 *
 *	  * Add Print Functionality
 *	  * Clean up code for Google Code distribution (Remove old & obsolete comments, run JSLint)
 *	  * Remove wheel events until a solid plan is adopted for wheel movement
 *	  * Make Hide Nav Animation more fun
 *	
*****************************************************************/

function dmBridgeZoomer(dmImgWidth, dmImgHeight, dmCISOPTR, dmCISOROOT) {

	/*****************************************
	*
	*	DEFAULT VARIABLES!
	*
	******************************************/	
	var rotationLevel = 0,
	viewerWidth = $('#viewer').width(),
	viewerHeight = $('#viewer').height(),
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
	
	// Movement
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

	// Cursor defaults
																						 
	closedHandCursor = "url(images/cursors/closedhand.cur), url(../images/cursors/closedhand.cur), move",
	openHandCursor = "url(images/cursors/openhand.cur), url(../images/cursors/openhand.cur), move",
	
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
	
	$('<div class="openhand">&nbsp;</div>').appendTo('body');
	$('<div class="closedhand">&nbsp;</div>').appendTo('body');

	
	/*****************************************
	*
	*	BUILDING MAIN IMAGE
	*
	******************************************/
	function buildImage(lvlZoom, lvlRotation, offsetRatioX, offsetRatioY) {
		
		// Builds the menu if one does not exist
		if($('#dmViewerMenu').length > 0) { 
			// alert("dmViewerMenu Exists"); 
		} else {
			buildMenu(lvlZoom, lvlRotation);	
		}		
		
		// Cleans out the previous images, timeouts, & nav should there be any
		$('#viewer div').remove();
		$('#thumbnail div').remove();
		$('#mainimage div').remove();
		$('#mainimagedragger').remove();
		$('#thumbnail').remove();
		$('#mainimagecontainer').remove();
		$('#mainimage').remove();		
		clearTimeout(loadImagesTimer);
		
		// Adds back in the necessary building blocks
		if (hideNav === true) {
			$('<div id="thumbnail"></div>').appendTo('#viewer').css('top', ((thumbHeightMax + 10) * -1) + 'px');
		} else {
			$('<div id="thumbnail" style="left:0; top:0"></div>').appendTo('#viewer');	
		}
		$('<div id="mainimagecontainer"></div>').appendTo('#viewer');
		$('<div id="mainimage"></div>').appendTo('#mainimagecontainer');

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
		var thumbSrc = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmThumbScale + "&DMWIDTH=" + thumbWidthMax + "&DMHEIGHT=" + thumbHeightMax + "&DMROTATE=" + lvlRotation;
		
		if (imageWidth <= viewerWidth && imageHeight <= viewerHeight) {						
			
			$(thumbImage)
				.load(function () {
													
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
											
					// Adds the image to the thumbnail div
					$('#thumbnail').append(this);
					
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();	
					
					$('#thumbnail').width(thumbWidth).height(thumbHeight);
					
					mainImageBG = "url(http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(viewerWidth).height(viewerHeight);
					
					$('#mainimagecontainer').width(viewerWidth).height(imageHeight);
										
					$('#mainimage')
						.css('position', 'relative')
						.css('margin', '0 auto')
						.css('background-image', mainImageBG)
						.css('background-position', 'center center')
						.css('background-repeat', 'no-repeat');
			
					// Adds the navigator to the thumbnail
					$('<div class="navigator"></div>')
						.appendTo('#thumbnail')
						.width(thumbWidth)
						.height(thumbHeight)
						.css('z-index', '20');
					
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
					$('#thumbnail').append(this);
							
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#thumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"clicknav\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#thumbnail");
					
					mainImageBG = "url(http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(viewerWidth).height(imageHeight);
					
					var containerWidth = ($('#mainimage').width() + $('#mainimage').width() - viewerWidth) + "px";
					var containerHeight = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth) + "px";
					var imagePositionY = ($('#mainimage').height() - viewerHeight - imageOffsetY) + "px";
					var imagePositionMoveX = (viewerWidth - viewerWidth);
					var imagePositionMoveY = (imageHeight - viewerHeight);	
					
					$('#mainimagecontainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					$('#mainimage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'center top')
						.css('background-repeat', 'no-repeat')
						.css('cursor', openHandCursor)
						.bind('drag', function(event){ $(this).css('cursor', closedHandCursor); moveImage(event); })
						.bind('dragend', function() { $(this).css('cursor', openHandCursor); loadImages(); })
						.bind("dblclick", function(e){ 
							var posX = e.pageX;
							var posY = e.pageY;
							dblClickMove(posX, posY);
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
					$('#thumbnail').append(this);
							
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#thumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"clicknav\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#thumbnail");
					
					mainImageBG = "url(http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(imageWidth).height(viewerHeight);
					
					containerWidth = ($('#mainimage').width() + $('#mainimage').width() - viewerWidth) + "px";
					containerHeight = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth - imageOffsetX) + "px";
					var imagePositionY = ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionMoveX = (imageWidth - viewerWidth);
					var imagePositionMoveY = (viewerHeight - viewerHeight);
					
					$('#mainimagecontainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					$('#mainimage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'left center')
						.css('background-repeat', 'no-repeat')
						.css('cursor', openHandCursor)
						.bind('drag', function(event){ $(this).css('cursor', closedHandCursor); moveImage(event); })
						.bind('dragend', function() { $(this).css('cursor', openHandCursor); loadImages(); })
						.bind("dblclick", function(e){ 
							var posX = e.pageX;
							var posY = e.pageY;
							dblClickMove(posX, posY);
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
			$('#mainimage')
				.width(imageWidth).height(imageHeight)
				.css('background-color',  '#EEE')
				.css('position', 'absolute')
				.css('background-image', 'none');
			
			$(thumbImage)
				.load(function () { // As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations					
								
					// Adds the image to the thumbnail div
					$('#thumbnail').append(this);
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
					$('#thumbnail').width(thumbWidth).height(thumbHeight);
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"clicknav\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#thumbnail");
					
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
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";						
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + (tileWidth + 1) + "&DMHEIGHT=" + (tileHeight + 1) + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;															
								tileImageErrorSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;															
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
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";											
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
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
								bigmageCoordsX = tileWidth * -(x - (tileNumWidth-1));
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
	
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";	
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;
								tileImageErrorSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;
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
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";		
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++;
							
							} // End Y Loop
						} // End X Loop	
						
					} // End Rotation IF													
					
					containerWidth = parseInt(((imageWidth) + (imageWidth) - viewerWidth), 10) + "px";
					containerHeight = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth - imageOffsetX) + "px";
					var imagePositionY = ($('#mainimage').height() - viewerHeight - imageOffsetY) + "px";
									
					$('#mainimagecontainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHeight)
						.css('left', containerX)
						.css('top', containerY);
										
					imagePositionMoveX = (imageWidth - viewerWidth);
					imagePositionMoveY = (imageHeight - viewerHeight);									
					containerSendX = $('#mainimagecontainer').offset().left;
					containerSendY = $('#mainimagecontainer').offset().top;
					mainImageWidth = $('#mainimage').width();
					mainImageHeight = $('#mainimage').height();
					thumbMainWidthRatio = $('#thumbnail img').width() / $('#mainimage').width();
					thumbMainHeightRatio = $('#thumbnail img').height() / $('#mainimage').height();
					
					
					$('#mainimage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('cursor', openHandCursor)
						.bind('drag', function(event){ $(this).css('cursor', closedHandCursor); moveImage(event); })
						.bind('dragend', function() { $(this).css('cursor', openHandCursor); loadImages(); });
						 						
					buildNav(offsetRatioX, offsetRatioY);
						
				})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
				
		}
		
	}
	
	
	
	/*****************************************
	*
	*	BUILDING NAV
	*
	******************************************/
	function buildNav(navRatioPosX, navRatioPosY) {
		
		// Calculates the width and Height of the navigator
		var navigatorWidth = (($('#thumbnail img').width() / $('#mainimage').width()) * viewerWidth);
		var navigatorHeight = (($('#thumbnail img').height() / $('#mainimage').height()) * viewerHeight);			 

		if (navigatorWidth > $('#thumbnail img').width()) {
			navigatorWidth = $('#thumbnail img').width();
		}
		if (navigatorHeight > $('#thumbnail img').height()) {
			navigatorHeight = $('#thumbnail img').height();
		}
		
		// Calculates the default nav position
		navOffsetX = (navRatioPosX * $('#thumbnail img').width()) - (navigatorWidth / 2);
		navOffsetY = (navRatioPosY * $('#thumbnail img').height()) - (navigatorHeight / 2);
		
		if (navOffsetX < 0) {
			navOffsetX = 0;
		} else if ((navOffsetX + navigatorWidth) > $('#thumbnail img').width()) {
			navOffsetX = $('#thumbnail img').width() - navigatorWidth;
		}
		
		if (navOffsetY < 0) {
			navOffsetY = 0;
		} else if ((navOffsetY + navigatorHeight) > $('#thumbnail img').height()) {
			navOffsetY = $('#thumbnail img').height() - navigatorHeight;
		} 
		
		// Binds a click to the nav
		$('#thumbnail .clicknav')
			.bind("click", function(e){ 
				var posX = e.pageX;
				var posY = e.pageY;
				clickNav(posX, posY);
			});

		// Adds the navigator to the thumbnail
		$('<div class="navigator"></div>')
			.appendTo('#thumbnail')
			.width(navigatorWidth)
			.height(navigatorHeight)
			.css('z-index', '20')
			.css('left', navOffsetX + "px")
			.css('top', navOffsetY + "px")
			.css('cursor', openHandCursor)
			.bind('drag', function(event){ $(this).css('cursor', closedHandCursor); moveNav(event); })
			.bind('dragend', function() { $(this).css('cursor', openHandCursor); loadImages(); });
		
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
		$('<div id="dmViewerMenu"></div>').insertBefore('#viewer');
		
		// Hide Nav
		var hideNavButton = "<div id='dmViewerHideNavigator' title='Show/Hide Navigator'>Hide Navigator</div>";
		$(hideNavButton).appendTo("#dmViewerMenu").bind('click', function() { viewerHideNavigator(); });											
		
		// Fit Window
		var fitWindowButton = "<div id='dmViewerFitWindow' title='Fit Image to Viewer'>Fit Document to Viewer</div>";
		$(fitWindowButton).appendTo("#dmViewerMenu").bind('click', function() { viewerFitWindow(); });	
		
		// Fit Width
		var fitWidthButton = "<div id='dmViewerFitWidth' title='Fit Image to Viewer Width'>Fit Image to Viewer Width</div>";
		$(fitWidthButton).appendTo("#dmViewerMenu").bind('click', function() { viewerFitWidth(); });		
		
		// Maximum Resolution
		var maxResButton = "<div id='dmViewerMaxRes' title='Maximum Resolution'>Maximum Resolution</div>";
		$(maxResButton).appendTo("#dmViewerMenu").bind('click', function() { viewerMaxRes(); });
		
		// Rotate Counterclockwise
		var rotateCounterclockwiseButton = "<div id='dmViewerRotateCounterclockwise' title='Rotate Counterclockwise'>Rotate Counterclockwise</div>";
		$(rotateCounterclockwiseButton).appendTo("#dmViewerMenu").bind('click', function() { viewerRotateCounterclockwise(); });
		
		// Rotate Clockwise
		var rotateClockwiseButton = "<div id='dmViewerRotateClockwise' title='Rotate Clockwise'>Rotate Clockwise</div>";
		$(rotateClockwiseButton).appendTo("#dmViewerMenu").bind('click', function() { viewerRotateClockwise(); });
		
		// Zoom Out
		var zoomOutButton = "<div id='dmViewerZoomOut' title='Zoom Out'>Zoom Out</div>";
		$(zoomOutButton).appendTo("#dmViewerMenu").bind('click', function() { viewerZoomOut(); });
						
		// Zoom Level Gague
		var zoomLevelGague = "<div id='zoomLevelGague' title='Zoom Level'>&nbsp;</div>";
		$(zoomLevelGague)
		.appendTo("#dmViewerMenu")
		.slider({ 
			animate: true,
			max: 100,
			min: (minZoomLevel * 100),
			change: function(event, ui) { sliderZoomInOut(); }
		});
		
		// Zoom In
		var zoomInButton = "<div id='dmViewerZoomIn' title='Zoom In'>Zoom In</div>";
		$(zoomInButton).appendTo("#dmViewerMenu").bind('click', function() { viewerZoomIn(); });	
		
		// Print
		var downloadImageButton = "<div id='dmViewerDownloadButton' title='Download the Image'></div>";
		$(downloadImageButton).appendTo("#dmViewerMenu").bind('click', function() { viewerDownloadImage(); });			
		
		// If dmBridge is enabled, append the "search text" field to the viewer
		if($('#dmObjectSearch').width() > 0) { $('#dmObjectSearch').appendTo('#dmViewerMenu'); }
		
		// Clear
		var menuClearDiv = "<div class='clear'>&nbsp;</div>";
		$(menuClearDiv).appendTo("#dmViewerMenu");
				
	}
	
	
	/*****************************************
	*
	*	LOADING FUNCTIONALITY!
	*
	******************************************/
	function loadImages() {
		
		// Grabs the area coordinates of the navigator
		var navCollisionY1 = parseFloat($('.navigator').css('top'));
		var navCollisionY2 = navCollisionY1 + $('.navigator').height();
		var navCollisionX1 = parseFloat($('.navigator').css('left'));
		var navCollisionX2 = navCollisionX1 + $('.navigator').width();
		
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
				var newImageDiv = "#mainimagecontainer .tile-" + newImageNum;
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
		
		var mainLeft = $('#mainimage').position().left;
		var mainTop = $('#mainimage').position().top;
		
		$('#feedback').html(mainLeft);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((mainLeft - imagePositionX) * ( thumbImgMoveWidth / mainImageWidth));
		var navTop = -1 * ((mainTop - imagePositionY) * ( thumbImgMoveHeight / mainImageHeight));
		
		// Converts the Position to the Thumnail Ratio
		$('div.navigator').css('left', navLeft).css('top', navTop);
	}
	
	function moveImage(event) {
		
		// Get the container dimensions
		var container = $('div#mainimagecontainer');
		var containerX = $(container).offset().left;
		var containerY = $(container).offset().top;
		var containerWidth = $(container).width();
		var containerHeight = $(container).height();	
		
		// Get the nav dimensions
		var mainImage = $('div#mainimage');
		var mainImageWidth = $(mainImage).width();
		var mainImageHeight = $(mainImage).height();
		
		// Get the proper nav positioning
		tempX = (event.offsetX) - containerX;
		tempY = (event.offsetY) - containerY;
		
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
	
  		$(mainImage).css({ left:tempX, top:tempY });
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((tempX - imagePositionMoveX) * thumbMainWidthRatio);
		var navTop = -1 * ((tempY - imagePositionMoveY) * thumbMainHeightRatio);
		
		// Converts the Position to the Thumnail Ratio
		$('div.navigator').css('left', navLeft).css('top', navTop);
		 
	}
	
	// When the thumbnail is double clicked, move the navigator & main image
	function dblClickMove(xPos, yPos) {
		
		// Grabs viewer dimensions
		var viewerWidth = $('#viewer').width();
		var viewerHeight = $('#viewer').height();
		
		// Grabs 
		var mainTempLeft = parseFloat($('#mainimage').css('left'));
		var mainTempTop = parseFloat($('#mainimage').css('top'));				
		
		// Checks to see which side of the viewer is clicked (left/right), then horizontally moves the image
		if ((xPos - $('#viewer').offset().left) > (viewerWidth / 2)) {
			var mainLeft = (mainTempLeft + viewerWidth / 2) - (xPos - $('#viewer').offset().left);					
			
			// Bounds Checking
			if (mainLeft < 0) {
				mainLeft = 0;	
			} 
			
		} else if ((xPos - $('#viewer').offset().left) < (viewerWidth / 2)) {
			mainLeft = mainTempLeft + (viewerWidth / 2 - (xPos - $('#viewer').offset().left));
			
			// Bounds Checking
			if (mainLeft > $('#mainimage').width() - viewerWidth) {
				mainLeft = $('#mainimage').width() - viewerWidth;
			}
			
		} else if ((xPos - $('#viewer').offset().left) == (viewerWidth / 2)) {
			mainLeft = mainTempLeft;						
		}
		
		// Checks to see which half of the viewer is clicked (top/bottom), then vertically moves the image
		if ((yPos - $('#viewer').offset().top) > (viewerHeight / 2)) {
			var mainTop = (mainTempTop + viewerHeight / 2) - (yPos - $('#viewer').offset().top);
			
			// Bounds Checking
			if (mainTop < 0) {
				mainTop = 0;	
			} 
			
		} else if ((yPos - $('#viewer').offset().top) < (viewerHeight / 2)) {
			mainTop = mainTempTop + (viewerHeight / 2 - (yPos - $('#viewer').offset().top));
			
			// Bounds Checking
			if (mainTop > $('#mainimage').height() - viewerHeight) {
				mainTop = $('#mainimage').height() - viewerHeight;
			}
			
		} else if ((yPos - $('#viewer').offset().top) == (viewerHeight / 2)) {
			mainTop = mainTempTop;
		}					
							
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#mainimage').width() - viewerWidth);
		var imagePositionY = ($('#mainimage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var navLeft = -1 * ((mainLeft - imagePositionX) * ($('#thumbnail img').width() / $('#mainimage').width()));
		var navTop = -1 * ((mainTop - imagePositionY) * ($('#thumbnail img').height() / $('#mainimage').height()));
		
		// Converts the Position to the Thumnail Ratio
		$('#mainimage').animate(
			{ 
				top: mainTop,
				left: mainLeft			
			}, "normal", "swing");
		$('#mainimagedragger').css('left', mainLeft).css('top', mainTop);		
		
		// Converts the Position to the Thumnail Ratio
		$('div.navigator').animate(
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
		var container = $('div#thumbnail img');
		var containerX = $(container).offset().left;
		var containerY = $(container).offset().top;
		var containerWidth = $(container).width();
		var containerHeight = $(container).height();
		
		// Get the nav dimensions
		var nav = $('div.navigator');
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
	
	
	// When the thumbnail is double clicked, move the navigator & main image
	function clickNav(xPos, yPos) {		
	
		var navigatorTempWidth = $('div.navigator').width();
		var navigatorTempHeight = $('div.navigator').height();
		var navTop = (yPos - $('#thumbnail').offset().top) - (navigatorTempHeight / 2);
		var navLeft = (xPos - $('#thumbnail').offset().left) - (navigatorTempWidth / 2);
		
		if ((navTop + navigatorTempHeight) > $('#thumbnail img').height()) {
			navTop = $('#thumbnail img').height() - navigatorTempHeight;
		}
		else if (navTop < 0) {
			navTop = 0;
		}
		if ((navLeft + navigatorTempWidth) > $('#thumbnail img').width()) {
			navLeft = $('#thumbnail img').width() - navigatorTempWidth;
		}
		else if (navLeft < 0) {
			navLeft = 0;
		}
		
		// Grabs the current boundaries of the container
		var imagePositionX = ($('#mainimage').width() - viewerWidth);
		var imagePositionY = ($('#mainimage').height() - viewerHeight);
		
		// Convert the inverted difference into the Thumbnail / MainImage ratios
		var mainLeft = imagePositionX + -1 * (($('#mainimage').width() / $('#thumbnail img').width()) * navLeft);
		var mainTop = imagePositionY + -1 * (($('#mainimage').height() / $('#thumbnail img').height()) * navTop);
		
		// Converts the Position to the Thumnail Ratio
		$('#mainimage').animate(
			{ 
				top: mainTop,
				left: mainLeft			
			}, "normal", "swing");
		$('#mainimagedragger').css('left', mainLeft).css('top', mainTop);
		
		// Converts the Position to the Thumnail Ratio
		$('div.navigator').animate(
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
		var viewerWidth = $('#viewer').width();
		var viewerHeight = $('#viewer').height();
		
		// Grabs default position of the main image
		var defaultMainLeft = $('#mainimage').width() - viewerWidth;
		var defaultMainTop = $('#mainimage').height() - viewerHeight;
		
		// Grabs current position of the main image
		var mainTempLeft = parseFloat($('#mainimage').css('left'));
		var mainTempTop = parseFloat($('#mainimage').css('top'));
		
		var tempImageWidth = $('#mainimage').width() / scrollZoomLvl;
		var tempImageHeight = $('#mainimage').height() / scrollZoomLvl;
				
		// Get the Ratio of the zoomed spot to the top, left corner of the image
		var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#viewer').offset().left)) / (tempImageWidth * scrollZoomLvl);
		var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#viewer').offset().top)) / (tempImageHeight * scrollZoomLvl);
		
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
			
			var navTempLeft = parseFloat($('.navigator').css('left'));
			var navTempTop = parseFloat($('.navigator').css('top'));
							
			var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
			var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
					
			$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
			
			buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			
		} else if (zoomLevel + 0.1 >= 1) {
			
			if (zoomLevel == 1) {
				zoomLevel = 1;
			} else {
				zoomLevel = 1;	
			
				navTempLeft = parseFloat($('.navigator').css('left'));
				navTempTop = parseFloat($('.navigator').css('top'));
								
				navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
				navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
						
				$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
				
				buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			}
		}				
		
	}
	
	function viewerZoomOut() {
		
		if (zoomLevel - 0.05 > minZoomLevel) {
			zoomLevel = Math.round((zoomLevel - 0.05)*100) / 100;
			
			var navTempLeft = parseFloat($('.navigator').css('left'));
			var navTempTop = parseFloat($('.navigator').css('top'));
							
			var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
			var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
					
			$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
			
			buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);			
			
		} else if (zoomLevel - 0.05 <= minZoomLevel) {
			if (zoomLevel == minZoomLevel) {
				zoomLevel = minZoomLevel;	
			} else {
				zoomLevel = minZoomLevel;
				
				navTempLeft = parseFloat($('.navigator').css('left'));
				navTempTop = parseFloat($('.navigator').css('top'));
								
				navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
				navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
					
				$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
				
				buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
			}
			
		}				
	}
	
	function sliderZoomInOut() {
		
		zoomLevel = $('#zoomLevelGague').slider('option', 'value') / 100;
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
								
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
			
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	
	function viewerMaxRes() {
		
		zoomLevel = 1;

		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();	
		
		$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
		
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
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
		
		$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));
		
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
		
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
		
		$('#zoomLevelGague').slider('option', 'value', (zoomLevel * 100));	
		
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
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();			
		
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
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();						
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	function viewerHideNavigator() {
		
		thumbDivTempWidth = (thumbWidth + 10) * -1;
		thumbDivTempHeight = (thumbHeight + 10) * -1;
		
		if (hideNav === true) {
			hideNav = false;
			$('#thumbnail').animate({ top: 0, left: 0 }, 300).animate({ top:-20, left: 0 }, 150).animate({ top: 0, left: 0 }, 150);
		} else {
			hideNav = true;
			$('#thumbnail').animate({ top: -20, left: 0 }, 150).animate({ top: 0, left: 0 }, 150).animate({ top: thumbDivTempHeight, left: 0 }, 300);
		}
	}
	
	function viewerDownloadImage() {
		
		// Create Lightbox type effect
		$("<div id='dmDownloadImageBackground'></div>").appendTo('body');
		$("<div id='dmDownloadImage'></div>").fadeIn().appendTo('body');
		
		
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();		
		var topScroll = $(document).scrollTop();
		var documentHeight = $(document).height();
		
		$('div#dmDownloadImageBackground')
			.css('width', windowWidth + 'px')
			.css('height', documentHeight + 'px')
			.css('opacity', 0.6)
			.css('top', '0px');				
		
		// Append Header & explanation
		$("<h3>Download Image</h3>").appendTo("div#dmDownloadImage");
		$("<p id='dmClosePrint'><a href='javascript: void()'>Close</a></p>").appendTo("div#dmDownloadImage").bind('click', function() {
			$('#dmDownloadImageBackground, #dmDownloadImage').remove();
		});
		
		// Print sizes
		var printSizes = ["3.5x5", "4x6", "5x7","8x10","11x17"];
		// var printNames = [""]
				
		// Calc 300 dpi sizes
		var printSizes300DPI = [];
		var printLinks300DPI = [];
		var printSizes72DPI = [];
		var printLinks72DPI = [];
				
		
		for (var i = 0; i < printSizes.length; i++) {
			
			if (dmImgWidth < dmImgHeight) {			
				var widthInches = printSizes[i].split("x")[0], 
					heightInches = printSizes[i].split("x")[1];	
			} else if (dmImgWidth >= dmImgHeight) {
					widthInches = printSizes[i].split("x")[1];
					heightInches = printSizes[i].split("x")[0];					
			}					
			var width300DPI = widthInches * 300,
				height300DPI = heightInches * 300,
				widthRatio300DPI = width300DPI / dmImgWidth * 100,
				heightRatio300DPI = height300DPI / dmImgHeight * 100,
				width72DPI = widthInches * 72,
				height72DPI = heightInches * 72,
				widthRatio72DPI = width72DPI / dmImgWidth * 100,
				heightRatio72DPI = height72DPI / dmImgHeight * 100;
			
			if (widthRatio300DPI < heightRatio300DPI) {
				var ratio300DPI = widthRatio300DPI;
				var ratio72DPI = widthRatio72DPI;
			} else if (widthRatio300DPI >= heightRatio300DPI) {
				ratio300DPI = heightRatio300DPI;
				ratio72DPI = heightRatio72DPI;
			}
			
				
			if (dmImgWidth < dmImgHeight) {				
				if (height300DPI <= dmImgHeight) {					
					printLinks300DPI.push("http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + ratio300DPI + "&DMWIDTH=" + width300DPI + "&DMHEIGHT=" + height300DPI + "&DMROTATE=0");	
					printSizes300DPI.push(width300DPI + "x" + height300DPI);	
				}
				
				if (height72DPI <= dmImgHeight) {
					printLinks72DPI.push("http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + ratio72DPI + "&DMWIDTH=" + width72DPI + "&DMHEIGHT=" + height72DPI + "&DMROTATE=0");
					printSizes72DPI.push(width72DPI + "x" + height72DPI);
				}				
			} else if (dmImgWidth >= dmImgHeight) {													
				if (width300DPI <= dmImgWidth) {								
					printLinks300DPI.push("http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + ratio300DPI + "&DMWIDTH=" + width300DPI + "&DMHEIGHT=" + height300DPI + "&DMROTATE=0");	
					printSizes300DPI.push(width300DPI + "x" + height300DPI);	
				}				
				if (width72DPI <= dmImgWidth) {
					printLinks72DPI.push("http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + ratio72DPI + "&DMWIDTH=" + width72DPI + "&DMHEIGHT=" + height72DPI + "&DMROTATE=0");
					printSizes72DPI.push(width72DPI + "x" + height72DPI);
				}
			}
			
			// console.log(printSizes72DPI[i]);
		} 
		
		
		// Print Sizes
		$("<h4>Common Sizes</h4>").appendTo("div#dmDownloadImage");
		$("<table id='dmPrintSizesListing'><tr><th>Paper Sizes</th><th>High Quality (300dpi)</th><th>Low Quality (72dpi)</th></tr></table>").appendTo("div#dmDownloadImage");
		
		for (var j = 0; j < printSizes.length; j++) {
			
			// Print the Paper Sizes
			$("<tr><td>" + printSizes[j] + "</td></tr>").appendTo('#dmPrintSizesListing');

			// Print 300 DPI Links
			if (printLinks300DPI[j]) {
				$("<td><a href='" + printLinks300DPI[j] +"' target='_blank'>Download</a></td>").appendTo('#dmPrintSizesListing tr:eq('+ (j + 1) + ')');
			} else {
				$("<td>&nbsp;</td>").appendTo('#dmPrintSizesListing tr:eq('+ (j + 1) + ')');
			}

			// Print 72 DPI Links
			if (printLinks72DPI[j]) {
				$("<td><a href='" + printLinks72DPI[j] +"' target='_blank'>Download</a></td>").appendTo('#dmPrintSizesListing tr:eq('+ (j + 1) + ')');
			} else {
				$("<td>&nbsp;</td>").appendTo('#dmPrintSizesListing tr:eq('+ (j + 1) + ')');
			}
		}
		
		$('#dmPrintSizesListing tr:even td').addClass('even');
		
		/* $("<div id='dmPaperSize'><h5>Paper Size</h5><ul>&nbsp;</ul></div>").appendTo("div#dmDownloadImage");				
		$("<div id='dmPrinting300DPI'><h5>300 DPI</h5><ul>&nbsp;</ul></div>").appendTo("div#dmDownloadImage");		
		$("<div id='dmPrinting72DPI'><h5>72 DPI</h5><ul>&nbsp;</ul></div>").appendTo("div#dmDownloadImage");
		
		var paperPrintSizesHTML, printSizes300DPIHTML, printSizes72DPIHTML;
		
		for (var j = 0; j < printSizes.length; j++) {
			
			// Print the Paper Sizes
			paperPrintSizesHTML += "<li>" + printSizes[j] +"</li>"; //).appendTo("div#dmPaperSize ul");

			// Print 300 DPI Links
			if (printLinks300DPI[j]) {
				printSizes300DPIHTML += "<li><a href='" + printLinks300DPI[j] +"' target='_blank'>Download</a></li>"; // ).appendTo("div#dmPrinting300DPI ul");
			}

			// Print 72 DPI Links
			if (printLinks72DPI[j]) {
				printSizes72DPIHTML += "<li><a href='" + printLinks72DPI[j] +"' target='_blank'>Download</a></li>"; //).appendTo("div#dmPrinting72DPI ul");
			}
		}
		
		$("div#dmPaperSize ul").html(paperPrintSizesHTML);
		$("div#dmPrinting300DPI ul").html(printSizes300DPIHTML);
		$("div#dmPrinting72DPI ul").html(printSizes72DPIHTML); */
		
	 
		// Append Slider
		$("<h4>Custom Size</h4>").appendTo("div#dmDownloadImage");
				
		var downloadRatio = dmImgHeight / dmImgWidth;		
		
		var imageDimensionsSlider = "<div id='dmDownloadImageSlider' title='Image Dimensions'>&nbsp;</div>";
		$(imageDimensionsSlider)
		.appendTo("#dmDownloadImage")
		.slider({ 
			animate: true,
			value: (dmImgWidth / 2),
			max: dmImgWidth,
			min: 0
		});
		
		// Append Slider Info & Download Button
		$("<div id='dmDownloadImagSliderVals'>" + (dmImgWidth / 2) + " x " + (dmImgHeight / 2) + "</div><p><a href='http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=50&DMWIDTH=" + (dmImgWidth / 2) + "&DMHEIGHT=" + (dmImgHeight / 2) + "&DMROTATE=0' target='_blank' id='dmDownloadImageLink'>Download!</a></p>").appendTo("#dmDownloadImage");
		
		$('#dmDownloadImageSlider').bind('slide', function(event, ui) { 
			var currentDownloadWidth = $('#dmDownloadImageSlider').slider('option', 'value');
			var currentDownloadHeight = parseInt(currentDownloadWidth * downloadRatio, 10);
			var currentZoomLevel = (currentDownloadWidth / dmImgWidth) * 100;
			var currentHTML = currentDownloadWidth + " x " + currentDownloadHeight; 
			var currentLink = "http://cdmtest.library.unlv.edu/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + currentZoomLevel + "&DMWIDTH=" + currentDownloadWidth + "&DMHEIGHT=" + currentDownloadHeight + "&DMROTATE=0";
			$("#dmDownloadImagSliderVals").html(currentHTML);
			$("#dmDownloadImageLink").attr("href", currentLink);
		});
		
		// Position DownloadImage box
		$('#dmDownloadImage')
			.css('top', ((windowHeight / 2) - ($('#dmDownloadImage').height() / 2) + topScroll) + "px")
			.css('left', ((windowWidth / 2) - ($('#dmDownloadImage').width() / 2)) + "px");
		
	}
							   
	/*****************************************
	*
	*	IT'S ALIVE!!!
	*
	******************************************/
	buildImage(zoomLevel, rotationLevel, 0, 0);

}