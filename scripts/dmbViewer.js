/**************************************
	dmBridge Image Viewer
	version .7
	by Brian Egan

ChangeLog version .6 - version .7:
	
	* Goal of version: Fine tune the zooming functionality so it retains it's location when zooming in instead of resetting & allow for scrolling.
	* Zoom retainment functionality built. The buildImage and buildNav functions now accept offset ratios (the distance from the middle of the zoom to the top left of the image divided by the width of the image). This allows the building functions to calculate where the initial nav should be placed when zoomed.
	* Scroll zooming added to the image and thumbnail. Because getimage.exe is so slow to load the tiles, when the image is rebuilt (for rotations or zooms), the initial image build will pause for 3/4 of a second.
	  Should the user chose to rotate or zoom again in that time frame, the image loading will be canceled. This way if a user zooms in quickly, the program will not have to load the 
	  tiles from the skipped zoom or rotation level.
	* Zooming funciontality added to the + and - buttons, and they are properly zooming in on the center of the viewport.
	
*****************************************************************/

// Internet Explorer doesn't play 100% well with jquery.event.drag, in that when a user's
// mouse leaves the page with a drag active, the drag doesn't function properly.
// This piece of code cancels out the drag function should a user leave the page while dragging
$( document ).bind("mouseleave",function( event ){
	event.type = "mouseup";
	$.event.handle.call( this, event );
});

function dmBridgeZoomer(dmImgWidth, dmImgHeight, dmCISOPTR, dmCISOROOT) {

	/*****************************************
	*
	*	DEFAULT VARIABLES!
	*
	******************************************/	
	var rotationLevel = 0;
	var viewerWidth = $('#viewer').width();
	var viewerHeight = $('#viewer').height();
	/*var bigWidth = 10360;
	var bigHeight = 9590;
	var CISOPTR = 426;*/ 
	var bigWidth = dmImgWidth;
	var bigHeight = dmImgHeight;
	var CISOPTR = dmCISOPTR;
	var CISOROOT = dmCISOROOT;
	var thumbWidth;
	var thumbHeight;
	var thumbWidthMax = 120;
	var thumbHeightMax = 120;
	var tileWidth;
	var tileHeight;
	var sliderVal;
	var initialImageX;
	var initialImageY;
	var loadImagesTimer;
	var hideNav = false;
	var tileImageSrc = new Array();
	var tileImageWidth = new Array();
	var tileImageHeight = new Array();
	var tileNum = 0;
	
	// Zoom Default - Fit Window!
	var viewerWidthRatio = viewerWidth / bigWidth;
	var viewerHeightRatio = viewerHeight / bigHeight;
	
	if (viewerWidthRatio >= viewerHeightRatio) {
		var zoomLevel = viewerHeightRatio;
	} else {
		var zoomLevel = viewerWidthRatio;
	}
	

	// Cursor defaults
																							 
	var closedHandCursor = "url(images/cursors/closedhand.cur), url(../images/cursors/closedhand.cur), move";
	var openHandCursor = "url(images/cursors/openhand.cur), url(../images/cursors/openhand.cur), move";
	
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
		if (prevRotation != lvlRotation) {
			// $('#thumbnail img').remove();
		}
		$('#viewer div').remove();
		$('#thumbnail div').remove();
		$('#mainimage div').remove();
		$('#mainimagedragger').remove();
		$('#thumbnail').remove();
		$('#mainimagecontainer').remove();
		$('#mainimage').remove();		
		clearTimeout(loadImagesTimer);
		
		// Remembers the rotation, so as to not always clear out the thumbnail
		var prevRotation = lvlRotation; 
		
		// Adds back in the necessary building blocks
		if (hideNav == true) {
			$('<div id="thumbnail" class="dmHideNav"></div>').appendTo('#viewer');
		} else {
			$('<div id="thumbnail"></div>').appendTo('#viewer');	
		}
		$('<div id="mainimagecontainer"></div>').appendTo('#viewer');
		$('<div id="mainimage"></div>').appendTo('#mainimagecontainer');

		// Adjust the measurements for the rotation
		if (lvlRotation == 0) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;	
		} else if (lvlRotation == 90) {
			bigImageWidth = bigHeight;
			bigImageHeight = bigWidth;
		} else if (lvlRotation == 180) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;
		} else if (lvlRotation == 270) {
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
		
		// Adjust the measurements for the rotation
		/* if (lvlRotation == 0) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;	
		} else if (lvlRotation == 90) {
			bigImageWidth = bigHeight;
			bigImageHeight = bigWidth;
		} else if (lvlRotation == 180) {
			bigImageWidth = bigWidth;
			bigImageHeight = bigHeight;
		} else if (lvlRotation == 270) {
			bigImageWidth = bigHeight;
			bigImageHeight = bigWidth;
		} */
		
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
			var thumbRatio = thumbWidthMax / (imageWidth/lvlZoom);
			thumbHeight = thumbRatio *(imageHeight/lvlZoom);
			thumbWidth = thumbRatio * (imageWidth/lvlZoom);
		} else if (imageHeight == imageWidth) {
			var thumbRatio = thumbHeightMax / (imageHeight/lvlZoom);
			thumbHeight = thumbRatio * (imageHeight/lvlZoom);
			thumbWidth = thumbRatio * (imageWidth/lvlZoom);
		}
		
		var dmThumbScale = thumbRatio * 100;
		var thumbImage = new Image();
		var thumbSrc = "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmThumbScale + "&DMWIDTH=" + thumbWidthMax + "&DMHEIGHT=" + thumbHeightMax + "&DMROTATE=" + lvlRotation;
		
		if (imageWidth <= viewerWidth && imageHeight <= viewerHeight) {						
			
			$(thumbImage)
				.load(function () {
													
					// As the thumbnail width and height are needed for certain calculations, we must wait until it is done loading to perform those calculations
											
					// Adds the image to the thumbnail div
					$('#thumbnail').append(this);
					
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();	
					
					mainImageBG = "url(/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(viewerWidth).height(viewerHeight);
					
					$('#mainimagecontainer').width(viewerWidth).height(imageHeight);
										
					$('#mainimage')
						.css('position', 'relative')
						.css('margin', '0 auto')
						.css('background-image', mainImageBG)
						.css('background-position', 'center center')
						.css('background-repeat', 'no-repeat')
						.bind('wheel',function(event,delta){
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// imageScroll(scrollPosX, scrollPosY, lvlZoom, delta);													
						});
			
					// Adds the navigator to the thumbnail
					$('<div class="navigator"></div>')
						.appendTo('#thumbnail')
						.width(thumbWidth)
						.height(thumbHeight)
						.css('z-index', '20')
						.bind('wheel',function(event,delta){
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// thumbScroll(scrollPosX, scrollPosY, lvlZoom, delta);													
						});
					
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
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"clicknav\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#thumbnail");
					
					mainImageBG = "url(/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(viewerWidth).height(imageHeight);
					
					var containerWidth = ($('#mainimage').width() + $('#mainimage').width() - viewerWidth) + "px";
					var containerHieght = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth) + "px";
					var imagePositionY = ($('#mainimage').height() - viewerHeight - imageOffsetY) + "px";
					
					$('#mainimagecontainer')
						.css('position', 'absolute')
						.css('width', containerWidth)
						.css('height', containerHieght)
						.css('left', containerX)
						.css('top', containerY);
										
					$('#mainimage')
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'center top')
						.css('background-repeat', 'no-repeat')
						.bind('drag', function(event){ moveImage(event); })
						.bind('dragend', function() { loadImages(); })
						.bind("dblclick", function(e){ 
							var posX = e.pageX;
							var posY = e.pageY;
							dblClickMove(posX, posY);
						})
						.bind('wheel',function(event,delta){
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// imageScroll(scrollPosX, scrollPosY, lvlZoom, delta);													
						});
						 
					buildNav(offsetRatioX, offsetRatioY);
					// buildScrollbars(offsetRatioX, offsetRatioY);
					
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
					
					// Adds the invisible clickable Nav
					var clickNav = "<div class=\"clicknav\" style=\"width:" + thumbWidth + "px; height:" + thumbHeight + "px;\"></div>";
					$(clickNav).appendTo("#thumbnail");
					
					mainImageBG = "url(/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + (lvlZoom * 100) + "&DMWIDTH=" + dmWidth + "&DMHEIGHT=" + dmHeight + "&DMROTATE=" + lvlRotation + ")";
					
					$('#mainimage').width(imageWidth).height(viewerHeight);
					
					var containerWidth = ($('#mainimage').width() + $('#mainimage').width() - viewerWidth) + "px";
					var containerHieght = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth - imageOffsetX) + "px";
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
						.css('top', imagePositionY)
						.css('background-image', mainImageBG)
						.css('background-position', 'left center')
						.css('background-repeat', 'no-repeat')
						.bind('drag', function(event){ moveImage(event); })
						.bind('dragend', function() { loadImages(); })
						.bind("dblclick", function(e){ 
							var posX = e.pageX;
							var posY = e.pageY;
							dblClickMove(posX, posY);
						})
						.bind('wheel',function(event,delta){
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// imageScroll(scrollPosX, scrollPosY, lvlZoom, delta);													
						});
					
					buildNav(offsetRatioX, offsetRatioY);
					// buildScrollbars(offsetRatioX, offsetRatioY);
					
					})
				.attr('class', 'thumbImage')
				.attr('src', thumbSrc);
			
		} else {
		
			// Build Tile Width & Height. For Larger Images make the Tiles Larger to increase performance and reduce server calls which take a long time to process
			if (imageWidth < 2000 || imageHeight < 2000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 2000 && imageWidth < 3000 || imageHeight >= 2000 && imageHeight < 3000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 3000 && imageWidth < 4000 || imageHeight >= 3000 && imageHeight < 4000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 4000 && imageWidth < 5000 || imageHeight >= 4000 && imageHeight < 5000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 5000 && imageWidth < 6000 || imageHeight >= 5000 && imageHeight < 6000) {
				tileWidth = 800;
				tileHeight = 800;
			} else if (imageWidth >= 6000 && imageWidth < 7000 || imageHeight >= 6000 && imageHeight < 7000) {
				tileWidth = 800;
				tileHeight = 800;
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
					$('#thumbnail')
						.append(this)
						.bind('wheel',function(event,delta){ // Binds the scrolling functionality to the thumbnail						
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// thumbScroll(scrollPosX, scrollPosY, lvlZoom, delta);						
						});
								
					// Gets those measurements I was talking about!
					thumbWidth = $(this).width();
					thumbHeight = $(this).height();
					
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
								
					// Ladies and Gents, start your tile number counter! Well, hold your horses.
					// var tileNum = 0;									
					
					// Execute the build based on rotation															
					
					// 0 Degrees
					if (lvlRotation == 0) {																				
								
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
								if ((tileNumWidth - 1) - x == 0) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
								}
										
								// Checks to see if it is a vertical edge box
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
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";																
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								//var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigDivCoordsX + "&DMY=" + bigDivCoordsY + "&DMCROP=" + bigDivCoordsX + "," + bigDivCoordsY + "," + x2 + "," + y2;															
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++
							
							}
						}																										
						
					// 90 Degrees
					} else if (lvlRotation == 90) {		
						
						for (x=0;x<tileNumWidth;x++) {
							for (y=tileNumHeight-1;y>=0;y--) {																																	
									
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								var bigWidthDecimal = preciseWidth.toString().split(".");
								var bigWidthAfterDec = "." + bigWidthDecimal[1];
								var smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								var bigHeightDecimal = preciseHeight.toString().split(".");
								var bigHeightAfterDec = "." + bigHeightDecimal[1];
								var smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x == 0) { // If so, make it the correct width
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
									var bigDivCoordsY = tileHeight * y;
									
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning. 
									// @ 90 Degrees we have to remove the gap left from the edge pieces being smaller than the regular tiles
									var edgeGap = Math.floor(tileHeight * bigHeightAfterDec);
									var bigDivCoordsY = (tileHeight * y) - (tileHeight-edgeGap);
								}
								
								// Calculate the X, Y Positioning for the Main Image Tiles
								var bigDivCoordsX = tileWidth * x;
																
								// Calculates the X, Y Positioning for the Images in those Tiles
								var bigImageCoordsX = tileWidth * -(y - (tileNumHeight-1));
								var bigImageCoordsY = tileHeight * x;
								
								//var coordsaasd = bigImageCoordsX + "," + bigImageCoordsY;
								//alert(coordsaasd);
								
								// Convert the X, Y for the Navigator
								var smallDivCoordsX = bigDivCoordsX * convertWidth;
								var smallDivCoordsY = bigDivCoordsY * convertHeight;
										
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputHeight;
								y2 = bigImageCoordsY + bigImageOutputWidth;
										
								// Adjust the zoom level to CDM Size
								var dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								//var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								// var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++
							
							} // End Y Loop
						} // End X Loop																										
					
					// 180 Degrees
					} else if (lvlRotation == 180) {									
												
						for (y=tileNumHeight-1;y>=0;y--) {																																	
							for (x=tileNumWidth-1;x>=0;x--) {
								
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								var bigWidthDecimal = preciseWidth.toString().split(".");
								var bigWidthAfterDec = "." + bigWidthDecimal[1];
								var smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								var bigHeightDecimal = preciseHeight.toString().split(".");
								var bigHeightAfterDec = "." + bigHeightDecimal[1];
								var smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x == (tileNumWidth - 1)) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									bigImageOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);									
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									// Calculates Y Positioning
									var bigDivCoordsX = tileWidth * x;
									
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									bigImageOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									var edgeGapX = Math.floor(tileWidth * bigWidthAfterDec);
									var bigDivCoordsX = (tileWidth * x) - (tileWidth-edgeGapX);
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y == (tileNumHeight-1)) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);									
									bigImageOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning
									var bigDivCoordsY = tileHeight * y;
									
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
									
									// Calculates Y Positioning. 
									// @ 90 Degrees we have to remove the gap left from the edge pieces being smaller than the regular tiles
									var edgeGapY = Math.floor(tileHeight * bigHeightAfterDec);
									var bigDivCoordsY = (tileHeight * y) - (tileHeight-edgeGapY);
								}																
								
								// Calculates the X, Y Positioning for the Images in those Tiles
								var bigImageCoordsX = tileWidth * -(x - (tileNumWidth-1));
								var bigImageCoordsY = tileHeight * -(y - (tileNumHeight-1));
								
								//var coordsaasd = bigImageCoordsX + "," + bigImageCoordsY;
								//alert(coordsaasd);
								
								// Convert the X, Y for the Navigator
								var smallDivCoordsX = bigDivCoordsX * convertWidth;
								var smallDivCoordsY = bigDivCoordsY * convertHeight;
								
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputWidth;
								y2 = bigImageCoordsY + bigImageOutputHeight;
										
								// Adjust the zoom level to CDM Size
								var dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								//var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								// var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++
							
							} // end Y loop
						} // end X Loop																					
					
					// 270 Degrees
					} else if (lvlRotation == 270) {												
						
						for (x=tileNumWidth-1;x>=0;x--) {
							for (y=0;y<tileNumHeight;y++) {																																	
									
								// Grabs the remainder of the precise width to calculate the boxes on the horizontal edge
								var bigWidthDecimal = preciseWidth.toString().split(".");
								var bigWidthAfterDec = "." + bigWidthDecimal[1];
								var smallWidthAfterDec = bigWidthAfterDec * convertWidth;
										
								// Grabs the remainder of the prcise height to calculate the boxes on the vertical edge
								var bigHeightDecimal = preciseHeight.toString().split(".");
								var bigHeightAfterDec = "." + bigHeightDecimal[1];
								var smallHeightAfterDec = bigHeightAfterDec * convertHeight;										
								
								// Checks to see if it is a horizontal edge box.
								if ((tileNumWidth - 1) - x == (tileNumWidth - 1)) { // If so, make it the correct width
									bigTileOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);
									bigImageOutputWidth = Math.floor(tileWidth * bigWidthAfterDec);									
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									// Calculates Y Positioning
									var bigDivCoordsX = tileWidth * x;
									
								} else { // Otherwise, it should be the normal tile width
									bigTileOutputWidth = tileWidth;	
									bigImageOutputWidth = tileWidth;	
									smallTileOutputWidth = bigTileOutputWidth * convertWidth;
									
									var edgeGapX = Math.floor(tileWidth * bigWidthAfterDec);
									var bigDivCoordsX = (tileWidth * x) - (tileWidth-edgeGapX);
								}
										
								// Checks to see if it is a vertical edge box
								if ((tileNumHeight - 1) - y == 0) { // If so, make it the correct height
									bigTileOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									bigImageOutputHeight = Math.floor(tileHeight * bigHeightAfterDec);
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								} else { // Or, make it the normal height
									bigTileOutputHeight = tileHeight;	
									bigImageOutputHeight = tileHeight;
									smallTileOutputHeight = bigTileOutputHeight * convertHeight;
								}
								
								// Calculate the X, Y Positioning for the Main Image Tiles
								var bigDivCoordsY = tileHeight * y;								
								
								// Calculates the X, Y Positioning for the Images in those Tiles
								var bigImageCoordsX = tileWidth * y;
								var bigImageCoordsY = tileHeight * -(x - (tileNumWidth-1));								
								
								//var coordsaasd = bigImageCoordsX + "," + bigImageCoordsY;
								//alert(coordsaasd);
								
								// Convert the X, Y for the Navigator
								var smallDivCoordsX = bigDivCoordsX * convertWidth;
								var smallDivCoordsY = bigDivCoordsY * convertHeight;
										
								// X2, Y2 for Content DM GetImage
								x2 = bigImageCoordsX + bigImageOutputHeight;
								y2 = bigImageCoordsY + bigImageOutputWidth;
										
								// Adjust the zoom level to CDM Size
								var dmScale = lvlZoom * 100;
									
								// Create the divs in which to place the images
								var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								//var bigDiv = "<div class=\"tile-" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + bigTileOutputWidth + "px; height: " + bigTileOutputHeight + "px; left: " + bigDivCoordsX + "px; top: " + bigDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(bigDiv).appendTo('#mainimage');
										
								// Create the nav divs for collision detection
								var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"></div>";
								
								// Line used for Testing... adds the div # to the output
								// var littleDiv = "<div class=\"" + tileNum + "\" style=\"position: absolute; border: 1px solid #CCC; : 5; width: " + smallTileOutputWidth + "px; height: " + smallTileOutputHeight + "px; left: " + smallDivCoordsX + "px; top: " + smallDivCoordsY + "px; font-family: Arial; \"><span style=\"display: block; background-color: #00FF00; position: absolute; : 1000; left: 0; top: 0;\">" + tileNum + "</span></div>";
										
								$(littleDiv).appendTo('#thumbnail').addClass('collision');
										
								// Builds the Array of images to load, and an array for the width and height of those																					
								tileImageSrc[tileNum] = "/cgi-bin/getimage.exe?CISOROOT=" + CISOROOT + "&CISOPTR=" + CISOPTR + "&DMSCALE=" + dmScale + "&DMWIDTH=" + tileWidth + "&DMHEIGHT=" + tileHeight + "&DMROTATE=" + lvlRotation + "&DMX=" + bigImageCoordsX + "&DMY=" + bigImageCoordsY + "&DMCROP=" + bigImageCoordsX + "," + bigImageCoordsY + "," + x2 + "," + y2;																		
								tileImageWidth[tileNum] = bigTileOutputWidth;										
								tileImageHeight[tileNum] = bigTileOutputHeight;
										
								// Progress tileNum
								tileNum++
							
							} // End Y Loop
						} // End X Loop	
						
					} // End Rotation IF													
					
					var containerWidth = parseInt(((imageWidth) + (imageWidth) - viewerWidth)) + "px";
					var containerHieght = ($('#mainimage').height() + $('#mainimage').height() - viewerHeight) + "px";
					var containerX = "-" + ($('#mainimage').width() - viewerWidth) + "px";
					var containerY = "-" + ($('#mainimage').height() - viewerHeight) + "px";
					var imagePositionX = ($('#mainimage').width() - viewerWidth - imageOffsetX) + "px";
					var imagePositionY = ($('#mainimage').height() - viewerHeight - imageOffsetY) + "px";
					
					// alert("Image Left/Top: " + imageOffsetX + " x " + imageOffsetY);
									
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
						
					// A Draggable div for IE
					$('<div id="mainimagedragger"></div>')
						.appendTo('#mainimagecontainer')
						.width(imageWidth)
						.height(imageHeight)
						.css('position', 'absolute')
						.css('left', imagePositionX)
						.css('top', imagePositionY)
						.css('z-index', '14')
						.css('background-image', 'url(images/bg_ie.gif)')
						.css('cursor', openHandCursor)
						.bind('drag', function(event){ $(this).css('cursor', closedHandCursor); moveImage(event); })
						.bind('dragend', function() { $(this).css('cursor', openHandCursor); loadImages(); })
						.bind("dblclick", function(e){												   
							var posX = e.pageX;
							var posY = e.pageY;
							dblClickMove(posX, posY);
						})
						.bind('wheel',function(event,delta){
							var scrollPosX = event.pageX;
							var scrollPosY = event.pageY;
							// imageScroll(scrollPosX, scrollPosY, lvlZoom, delta);													
						});
						 						
					buildNav(offsetRatioX, offsetRatioY);
					// buildScrollbars(offsetRatioX, offsetRatioY);
						
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
		var navigatorWidth = ($('#thumbnail img').width() / $('#mainimage').width()) * viewerWidth;
		var navigatorHeight = ($('#thumbnail img').height() / $('#mainimage').height()) * viewerHeight;

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
			})
			.bind('drag', function(){ }) 
			.bind('dragend', function() { }); // The two empty drag lines added here are meant to prevent Firefox from selecting images when double clicking on the nav. This is not the coolest workaround, and I will look for something better down the road.
					

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
		
		// Zoom Out
		var zoomOutButton = "<div id='dmViewerZoomOut'>Zoom Out</div>";
		$(zoomOutButton).appendTo("#dmViewerMenu").bind('click', function() { viewerZoomOut(); });
						
		// Zoom Level Gague
		var zoomLevelGague = "<div id='zoomLevelGague'>" + Math.round(zoomLevel * 100) + " %</div>";
		$(zoomLevelGague).appendTo("#dmViewerMenu");
		
		// Zoom In
		var zoomInButton = "<div id='dmViewerZoomIn'>Zoom In</div>";
		$(zoomInButton).appendTo("#dmViewerMenu").bind('click', function() { viewerZoomIn(); });		
				
		// Maximum Resolution
		var maxResButton = "<div id='dmViewerMaxRes'>Maximum Resolution</div>";
		$(maxResButton).appendTo("#dmViewerMenu").bind('click', function() { viewerMaxRes(); });
		
		// Fit Window
		var fitWindowButton = "<div id='dmViewerFitWindow'>Maximum Resolution</div>";
		$(fitWindowButton).appendTo("#dmViewerMenu").bind('click', function() { viewerFitWindow() });	
		
		// Fit Width
		var fitWidthButton = "<div id='dmViewerFitWidth'>Maximum Resolution</div>";
		$(fitWidthButton).appendTo("#dmViewerMenu").bind('click', function() { viewerFitWidth() });		
		
		// Rotate Counterclockwise
		var rotateCounterclockwiseButton = "<div id='dmViewerRotateCounterclockwise'>Maximum Resolution</div>";
		$(rotateCounterclockwiseButton).appendTo("#dmViewerMenu").bind('click', function() { viewerRotateCounterclockwise() });
		
		// Rotate Clockwise
		var rotateClockwiseButton = "<div id='dmViewerRotateClockwise'>Maximum Resolution</div>";
		$(rotateClockwiseButton).appendTo("#dmViewerMenu").bind('click', function() { viewerRotateClockwise() });
		
		// Hide Nav
		var hideNavButton = "<div id='dmViewerHideNavigator'>Maximum Resolution</div>";
		$(hideNavButton).appendTo("#dmViewerMenu").bind('click', function() { viewerHideNavigator() });
		
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
	
	/*****************************************
	*
	*	MOVEMENT FUNCTIONALITY!
	*
	******************************************/
	// When the main image window is dragged, move it and the navigator as well
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
		tempX = (event.offsetX + document.body.scrollLeft) - containerX;
		tempY = (event.offsetY + document.body.scrollTop) - containerY;
		
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
		
		//if (tempX >= 0 && navX <= containerWidth && tempY >= 0 && navY <= containerHeight) { $('div.navigator').css({ left:tempX, top:tempY }); };
  		$(mainImage).css({ left:tempX, top:tempY });
		$('#mainimagedragger').css({ left:tempX, top:tempY });
		
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
			
			//$("#feedback").html("Image Left/Top: " + ((xPos - $('#viewer').offset().left) - viewerWidth / 2) + " x " + (xPos - $('#viewer').offset().left));
			//$("#feedback").html("Image Left/Top: " + mainLeft + " x " + viewerWidth / 2);
			
			
			// Bounds Checking
			if (mainLeft < 0) {
				mainLeft = 0;	
			} 
			
		} else if ((xPos - $('#viewer').offset().left) < (viewerWidth / 2)) {
			var mainLeft = mainTempLeft + (viewerWidth / 2 - (xPos - $('#viewer').offset().left));
			
			//$("#feedback").html("Image Left/Top: " + mainLeft + " x " + mainTempTop);
			
			// Bounds Checking
			if (mainLeft > $('#mainimage').width() - viewerWidth) {
				mainLeft = $('#mainimage').width() - viewerWidth;
			}
			
		} else if ((xPos - $('#viewer').offset().left) == (viewerWidth / 2)) {
			var mainLeft = mainTempLeft;						
		}
		
		// Checks to see which half of the viewer is clicked (top/bottom), then vertically moves the image
		if ((yPos - $('#viewer').offset().top) > (viewerHeight / 2)) {
			var mainTop = (mainTempTop + viewerHeight / 2) - (yPos - $('#viewer').offset().top);
			
			// Bounds Checking
			if (mainTop < 0) {
				mainTop = 0;	
			} 
			
		} else if ((yPos - $('#viewer').offset().top) < (viewerHeight / 2)) {
			var mainTop = mainTempTop + (viewerHeight / 2 - (yPos - $('#viewer').offset().top));
			
			// Bounds Checking
			if (mainTop > $('#mainimage').height() - viewerHeight) {
				mainTop = $('#mainimage').height() - viewerHeight;
			}
			
		} else if ((yPos - $('#viewer').offset().top) == (viewerHeight / 2)) {
			var mainTop = mainTempTop;
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
				//css('left', mainLeft).css('top', mainTop);			
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
			})
		 
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
		tempX = (event.offsetX + document.body.scrollLeft) - containerX;
		tempY = (event.offsetY + document.body.scrollTop) - containerY;
		
		// Create Proper containment
		var navX = tempX + navWidth;
		var navY = tempY + navHeight;

		// If the box is in the proper container, move the Nav
		// Max width the container can go
		var containerMaxX = containerWidth - navWidth;
		var containerMaxY = containerHeight - navHeight;
		
		// If the box is in the proper container, move the Nav
		if (tempX < 0){ 
			tempX = 0;
		} else if (navX > containerWidth) { 
			tempX = containerMaxX;
		}
  		if (tempY < 0){ 
			tempY = 0
		} else if (navY > containerHeight) { 
			tempY = containerMaxY;
		}
		
		//if (tempX >= 0 && navX <= containerWidth && tempY >= 0 && navY <= containerHeight) { $('div.navigator').css({ left:tempX, top:tempY }); };
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
		$('#mainimagedragger').css('left', mainLeft).css('top', mainTop);
		 
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
				//css('left', mainLeft).css('top', mainTop);			
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
			})
		
		// .css('left', navLeft).css('top', navTop);
		
		// After moving the nav, load the corresponding images		
		 
	}
	
	/*****************************************
	*
	*	ZOOMING FUNCTIONALITY
	*
	******************************************/
	function dblClickZoom(xScrollPos, yScrollPos, scrollZoomLvl) {
		
		if (scrollZoomLvl + .1 > 1) {
				var newScrollZoomLvl = 1;
		} else {
			var newScrollZoomLvl = Math.round((scrollZoomLvl + .1)*100) / 100; // Math.ceil(scrollZoomLvl + .1);
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
		//var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#viewer').offset().left)) / (bigWidth * scrollZoomLvl);
		//var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#viewer').offset().top)) / (bigHeight * scrollZoomLvl);
		
		var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#viewer').offset().left)) / (tempImageWidth * scrollZoomLvl);
		var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#viewer').offset().top)) / (tempImageHeight * scrollZoomLvl);
		
		var checkMathX = (bigHeight * newScrollZoomLvl * zoomOffsetRatioX); // (($('#mainimage').width() / scrollZoomLvl) * newScrollZoomLvl) - viewerWidth - (bigWidth * newScrollZoomLvl * zoomOffsetRatioX);
		var checkMathY = (bigWidth * newScrollZoomLvl * zoomOffsetRatioY); // (($('#mainimage').height() / scrollZoomLvl) * newScrollZoomLvl) - viewerHeight - (bigHeight * newScrollZoomLvl * zoomOffsetRatioY);		
		
		//$("#feedback").html("Default ratio: " + newScrollZoomLvl); // + "  / " + checkMathY + "; ASDAS: " + zoomOffsetRatioX + ", " + zoomOffsetRatioY);
		
		// $("#feedback").html("Default ratio: " + checkMathX + "  / " + checkMathY + "; X, Y " + mainTempLeft + ", " + mainTempTop);
		
		buildImage(newScrollZoomLvl, rotationLevel, zoomOffsetRatioX, zoomOffsetRatioY);

	}
	
	function imageScroll(xScrollPos, yScrollPos, scrollZoomLvl, imageScrollDelta) {
		
		// Determines whether to zoom in or out. If the zoom level is > 1 or < 0 then do not zoom in or out respectively.		
		if (imageScrollDelta >= 1) {
			if (scrollZoomLvl + imageScrollDelta * .05 > 1) {
				var newScrollZoomLvl = 1;
			} else {
				var newScrollZoomLvl = Math.round((scrollZoomLvl + imageScrollDelta * .05)*100) / 100; // Math.ceil(scrollZoomLvl + .1);
				zoomLevel = newScrollZoomLvl;
			}
		} else if (imageScrollDelta <= -1) {
			if (scrollZoomLvl + imageScrollDelta * .05 <= .05) {
				var newScrollZoomLvl = .05;
			} else {
				var newScrollZoomLvl = Math.round((scrollZoomLvl + imageScrollDelta * .05)*100) / 100;
				zoomLevel = newScrollZoomLvl;
			}
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
		
		
		/* if (viewerWidth == $('#mainimage').width() && viewerHeight == $('#mainimage').height()) { // Small Images (less than the viewer width and height 
			alert("Small Image"); 
		} else if (viewerWidth == $('#mainimage').width() && viewerHeight < $('#mainimage').height()) { // Vertical Images
			alert("Vertical Image Image");
		} else if (viewerWidth < $('#mainimage').width() && viewerHeight == $('#mainimage').height()) { // Horizontal Images
			alert("Horizontal Image Image");
		} else {
			alert("Big Image");	
		} */
				
		// Get the Ratio of the zoomed spot to the top, left corner of the image
		//var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#viewer').offset().left)) / (bigWidth * scrollZoomLvl);
		//var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#viewer').offset().top)) / (bigHeight * scrollZoomLvl);
		
		var zoomOffsetRatioX = ((defaultMainLeft - mainTempLeft) + (xScrollPos - $('#viewer').offset().left)) / (tempImageWidth * scrollZoomLvl);
		var zoomOffsetRatioY = ((defaultMainTop - mainTempTop) + (yScrollPos - $('#viewer').offset().top)) / (tempImageHeight * scrollZoomLvl);
		
		var checkMathX = (bigHeight * newScrollZoomLvl * zoomOffsetRatioX); // (($('#mainimage').width() / scrollZoomLvl) * newScrollZoomLvl) - viewerWidth - (bigWidth * newScrollZoomLvl * zoomOffsetRatioX);
		var checkMathY = (bigWidth * newScrollZoomLvl * zoomOffsetRatioY); // (($('#mainimage').height() / scrollZoomLvl) * newScrollZoomLvl) - viewerHeight - (bigHeight * newScrollZoomLvl * zoomOffsetRatioY);		
		
		// $("#feedback").html("Default ratio: " + newScrollZoomLvl); // + "  / " + checkMathY + "; ASDAS: " + zoomOffsetRatioX + ", " + zoomOffsetRatioY);
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
		// $("#feedback").html("Default ratio: " + checkMathX + "  / " + checkMathY + "; X, Y " + mainTempLeft + ", " + mainTempTop);
		
		buildImage(newScrollZoomLvl, rotationLevel, zoomOffsetRatioX, zoomOffsetRatioY);

	}	
	
	function thumbScroll(xNavScrollPos, yNavScrollPos, scrollZoomLvl, scrollDelta) {
		
		if (scrollDelta >= 1) {
			if (scrollZoomLvl + scrollDelta * .05 >= 1) {
				var newScrollZoomLvl = 1;
			} else {
				var newScrollZoomLvl = Math.round((scrollZoomLvl + scrollDelta * .05)*100) / 100;
				zoomLevel = newScrollZoomLvl;
			}
		} else if (scrollDelta <= -1) {
			if (scrollZoomLvl + scrollDelta * .05 <= .05) {
				var newScrollZoomLvl = .05;
			} else {
				var newScrollZoomLvl = Math.round((scrollZoomLvl + scrollDelta * .05)*100) / 100;
				zoomLevel = newScrollZoomLvl;
			}
		}
		
		var navOffsetX = (xNavScrollPos - $('#thumbnail').offset().left);
		var navOffsetY = (yNavScrollPos - $('#thumbnail').offset().top);
		
		var navOffsetRatioX = navOffsetX / $('#thumbnail').width();
		var navOffsetRatioY = navOffsetY / $('#thumbnail').height();
		
		buildImage(newScrollZoomLvl, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
	}

	
	/*****************************************
	*
	*	SCROLLING FUNCTIONALITY!
	*
	******************************************/	
	/* function buildScrollbars(scrollbarOffsetX, scrollbarOffsetY) {
		
		var viewerTempWidth = $('#viewer').width();
		var viewerTempHeight = $('#viewer').height();
		var mainImageTempHeight = $('#mainimage').height();
		var mainImageTempWidth = $('#mainimage').width();
		
		var scrollbarWidth = viewerTempWidth * .6;
		var scrollbarHeight = viewerTempHeight * .6;
		
		var scrollbarLeftHandle = viewerWidth * .2 - 20;
		var scrollbarRightHandle = viewerWidth * .8;
		
		var scrollbarTopHandle = viewerHeight * .2 - 20;
		var scrollbarBottomHandle = viewerHeight * .8;
		
		var scrollbarDragHandleXWidth = (viewerTempWidth / mainImageTempWidth) * scrollbarWidth;
		var scrollbarDragHandleYHeight = (viewerTempHeight / mainImageTempHeight) * scrollbarHeight;
		
		var scrollbarDragHandleXOffset = (scrollbarOffsetX * scrollbarWidth) - (scrollbarDragHandleXWidth / 2) + (viewerWidth * .2);	
		var scrollbarDragHandleYOffset = (scrollbarOffsetY * scrollbarHeight) - (scrollbarDragHandleYHeight / 2) + (viewerHeight * .2);
		
		// Contain the Drag Handle
		if (scrollbarDragHandleXOffset <= scrollbarLeftHandle) {
			scrollbarDragHandleXOffset = (viewerWidth * .2);
		} else if (scrollbarDragHandleXOffset + scrollbarDragHandleXWidth > scrollbarRightHandle) {
			scrollbarDragHandleXOffset = scrollbarRightHandle - scrollbarDragHandleXWidth;
		}
		
		if (scrollbarDragHandleYOffset <= scrollbarTopHandle) {
			scrollbarDragHandleYOffset = (viewerHeight * .2);
		} else if (scrollbarDragHandleYOffset + scrollbarDragHandleYHeight > scrollbarBottomHandle) {
			scrollbarDragHandleYOffset = scrollbarBottomHandle - scrollbarDragHandleYHeight;
		} 
		
		//Add the Direction Handles to the Viewer
		$('<div id="scrollbarLeftHandle"></div>')
			.appendTo("#viewer")
			.css('left', scrollbarLeftHandle);
			
		$('<div id="scrollbarRightHandle"></div>')
			.appendTo("#viewer")
			.css('left', scrollbarRightHandle);
		
		$('<div id="scrollbarTopHandle"></div>')
			.appendTo("#viewer")
			.css('top', scrollbarTopHandle);
		
		$('<div id="scrollbarBottomHandle"></div>')
			.appendTo("#viewer")
			.css('top', scrollbarBottomHandle);
			
		// Add the scroll bars to the viewer
		$('<div id="scrollbarRight"></div>')
			.appendTo("#viewer")
			.css('height', scrollbarHeight);
			
		$('<div id="scrollbarBottom"></div>')
			.appendTo("#viewer")
			.css('width', scrollbarWidth);
			
		// Add the Draggable Handles
		$('<div id="scrollbarDragHandleX"></div">')
			.appendTo("#viewer")
			.css('left', scrollbarDragHandleXOffset)
			.css('width', scrollbarDragHandleXWidth)
			.bind('mouseover', function() {
				$(this).css('background-color', '#333');
			})
			.bind('mouseout', function() {
				$(this).css('background-color', '#000000');
			})
			.bind('drag', function(event){ moveScrollbarDragHandleX(event); })
			.bind('dragend', function() { loadImages(); });
			
		$('<div id="scrollbarDragHandleY"></div">')
			.appendTo("#viewer")
			.css('top', scrollbarDragHandleYOffset)
			.css('height', scrollbarDragHandleYHeight)
			.bind('mouseover', function() {
				$(this).css('background-color', '#333');
			})
			.bind('mouseout', function() {
				$(this).css('background-color', '#000000');
			})
			.bind('drag', function(event){ moveScrollbarDragHandleY(event); })
			.bind('dragend', function() { loadImages(); }); 
		
					
		//$('#feedback').html(scrollbarLeftHandleX + ", " + scrollbarRightHandleX);
		
	} */
	
	/* function moveScrollbarDragHandleX(event) {
		$('#feedback').html("Yo.");
	} */
	
	
	
	/*****************************************
	*
	*	MENU FUNCTIONALITY!
	*
	******************************************/
	function viewerZoomIn() {
		if (zoomLevel + .1 < 1) {
			zoomLevel = Math.round((zoomLevel + .1)*100) / 100;
			
		} else if (zoomLevel + .1 >= 1) {
			zoomLevel = 1;	
		}
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
		
		//$("#feedback").html("Default ratio: " + navOffsetRatioX + ", " + navOffsetRatioY + "; ZOOM: " + zoomLevel);		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	function viewerZoomOut() {
		
		if (zoomLevel - .1 > 0.05) {
			zoomLevel = Math.round((zoomLevel - .1)*100) / 100;
			
		} else if (zoomLevel - .1 <= .05) {
			zoomLevel = .05;	
		}
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
		
		// $("#feedback").html("Default ratio: " + navOffsetRatioX + ", " + navOffsetRatioY + "; ZOOM: " + zoomLevel);		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
	}
	
	function viewerMaxRes() {
		
		zoomLevel = 1;

		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();	
		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
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
			  var viewerWidthRatio = viewerWidth / bigHeight;
			  var viewerHeightRatio = viewerHeight / bigWidth;	
			  break;
			case 180:
			  var viewerWidthRatio = viewerWidth / bigWidth;
			  var viewerHeightRatio = viewerHeight / bigHeight;	
			  break;
			case 270:
			  var viewerWidthRatio = viewerWidth / bigHeight;
			  var viewerHeightRatio = viewerHeight / bigWidth;		
			  break; 
		}
		
		if (viewerWidthRatio >= viewerHeightRatio) {
			var zoomLevel = viewerHeightRatio;
		} else {
			var zoomLevel = viewerWidthRatio;
		}
		
		var navTempLeft = parseFloat($('.navigator').css('left'));
		var navTempTop = parseFloat($('.navigator').css('top'));
						
		var navOffsetRatioX = (navTempLeft + ($('.navigator').width() / 2)) / $('#thumbnail').width();
		var navOffsetRatioY = (navTempTop + ($('.navigator').height() / 2)) / $('#thumbnail').height();				
		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');	
		
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
		
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');		
		
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
		
		// $("#feedback").html("Default ratio: " + navOffsetRatioX + ", " + navOffsetRatioY + "; ZOOM: " + zoomLevel);	
		$('#zoomLevelGague').html(Math.round(zoomLevel * 100) + ' %');
		
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
		
		// $("#feedback").html("Default ratio: " + navOffsetRatioX + ", " + navOffsetRatioY + "; ZOOM: " + zoomLevel);		
		
		buildImage(zoomLevel, rotationLevel, navOffsetRatioX, navOffsetRatioY);
		
	}
	
	function viewerHideNavigator() {
		$('#thumbnail').toggleClass('dmHideNav');
		if (hideNav == true) {
			hideNav = false;	
		} else {
			hideNav = true;	
		}
	}
	
	/*		// Zoom Out
		$('dmViewerZoomOut').bind('click', viewerZoomOut());
		
		// Zoom In
		$('dmViewerZoomIn').bind('click', viewerZoomIn())
		
		// Maximum Resolution
		$('dmViewerMaxRes').bind('click', viewerMaxRes())
		
		// Fit Window
		$('dmViewerFitWindow').bind('click', viewerFitWindow());
		
		// Fit Width
		$('dmViewerFitWidth').bind('click', viewerFitWidth());
		
		// Rotate Counterclockwise
		$('dmViewerRotateCounterclockwise').bind('click', viewerRotateCounterclockwise());
		
		// Rotate Clockwise
		$('dmViewerRotateClockwise').bind('click', viewerRotateClockwise());
		
		// Hide Nav
		$('dmViewerHideNavigator').bind('click', viewerHideNavigator()); */
						   
	/*****************************************
	*
	*	IT'S ALIVE!!!
	*
	******************************************/
	buildImage(zoomLevel, rotationLevel, 0, 0);

}