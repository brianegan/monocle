<!-- This File contains the PHP & HTML you will need to place into cdm4/includes/pan_view.php -->

<!-- Comment out the line that begins with: <input type="image" src="<?=$image_src?>"
	 & Replace it with the following div: -->
<div id="dmMonocle"></div>

<!-- At the very bottom of the file, include this code. Make sure to adjust the src attribute to
	 point to the correct location -->
<script type="text/javascript" src="/dmMonocle-1.0/scripts/jquery-1.3.2.min.js"></script>
<script type="text/javascript" src="/dmMonocle-1.0/scripts/jquery.event.drag-1.5.min.js"></script>
<script type="text/javascript" src="/dmMonocle-1.0/scripts/jquery-ui-1.7.1.custom.min.js"></script>
<script type="text/javascript" src="/dmMonocle-1.0/scripts/dmmonocle.min.js"></script>

<? dmGetImageInfo($image_cisoroot, $image_cisoptr, $filename, $type, $width, $height); ?>

<script type="text/javascript">
$(window).ready(function() {
	dmMonocle(<?= $width ?>, <?= $height ?>,
		<?= $image_cisoptr ?>, "<?= $image_cisoroot ?>");
});
</script>