<!-- Look for the following lines and Erase or comment them out. 2 Instances will occur in the document -->
document.write('<iframe name="toolbar" width="'+(frameon)+'" height="'+toolbarheight+'px" src="blank.php" frameborder="0" scrolling="no"><\/iframe>');
	
<!-- Find the Following Line -->
document.write('<iframe name="right" width="'+(frameon)+'" height="'+(getBrowserHeight()-(23+mh)-toolbarheight)+'px" src="blank.php" frameborder="0"><\/iframe>');
	
<!-- And change to: -->
document.write('<iframe name="right" width="'+(frameon)+'" height="550px" src="blank.php" frameborder="0"><\/iframe>');