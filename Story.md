# Patrons views images with dmMonocle

As a patron
I want to view CONTENTdm images Google-maps style
So that viewing images will be simple and convenient

## Scenario 1: Construction

+ Given 
	+ CISOROOT
	+ and CISOPTR
	+ and Original Image Width
	+ and Original Image Height
	+ and optional Desired Rotation Level
	+ and optional Desired Zoom Level
	+ and optional X value
	+ and optional Y value
	+ and optional print functionality
	+ and optional max thumb height
	+ and optional max thumb width
  + and optional search text
	+ and optional site URL
	+ and optional thumbnail position
	+ and optional show/hide navigator
+ When
	+ The patron accesses a specific image
+ Then dmMonocle should
  + initialize the plugin
	+ calculate the size of the viewable area
	+ and calculate the minimum zoom level
	+ and make sure the optional zoom level isn't ridiculous
	+ and preLoad the thumbnails
	+ and construct the main window
	+ and construct the thumbnail
	+ and construct a menu

## Scenario 2: Image Zooming

+ Given
	+ User Zoom Level
	+ And user rotation level
	+ and user X, Y ratio
+ When
	+ User Clicks on Zoom In, Zoom out, or zoom slider
+ Then dmMonocle should
	+ Remove all tiles from previous zoom level
	+ Calculate the size of the image at the given zoom & rotation level
	+ Construct the tiles
	+ Calculate the images for each tile
	+ Load the tiles for the given viewable area
	
## Scenario 3: Image Zooming (alternative)

+ Given
	+ X, Y Position of the click
+ When
	+ The user double-clicks on the image
+ Then dmMonocle should
	+ Remove all tiles from previous zoom level
	+ Calculate the size of the image at the given zoom & rotation level
	+ Construct the tiles
	+ Calculate the images for each tile
	+ Load the tiles for the given viewable area
	
## Scenario 4: Image Rotation

+ Given
	+ User Zoom Level
	+ New Rotation Level
	+ user X, Y ratio
+ When
	+ User rotates the image with the menu
+ Then dmMonocle should
	+ Remove all tiles from previous rotation level
	+ Rotate the thumbnail
	+ Calculate the size of the image at the given zoom & rotation level
	+ Construct the Tiles
	+ Calculate the images for each tile
	+ Load the tiles in the given viewable area
	
## Scenario 5: Text Search

+ Given
	+ User Zoom Level
	+ User Rotation Level
	+ User X, Y Ratio
+ When 
	+ the User enters a search term
+ Then dmMonocle should
	+ Remove all current tiles
	+ Calculate the size of the image at the given zoom and rotation level, with the given search criterion
	+ Construct the Tiles
	+ Calculate the images for each tile
	+ Load the tiles in the given viewable area

## Scenario 6: Image Movement

+ Given
	+ User Mouse Movement
+ When
	+ The User clicks and drags a mouse around on the main image
+ Then dmMonocle should
	+ Move the image with the mouse
	+ Move the navigator the proportionate distance

## Scenario 7: Thumbnail Movement

+ Given
	+ User Mouse Movement on the navigator
+ When
	+ The user clicks and drags a mouse around the navigator
+ Then
	+ Move the navigator
	+ Move the image the proportionate amount

