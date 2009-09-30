<!-- Erase everything in the file and replace it with the following -->
<div id="dmMonocle"></div>

<script type="text/javascript" src="/dmmonocle/scripts/jquery-1.3.2.min.js"></script>
<script type="text/javascript" src="/dmmonocle/scripts/jquery.event.drag-1.5.min.js"></script>
<script type="text/javascript" src="/dmmonocle/scripts/jquery-ui-1.7.1.custom.min.js"></script>
<script type="text/javascript" src="/dmmonocle/scripts/dmmonocle.min.js"></script>

<script type="text/javascript"> $(window).ready(function() {
    dmMonocle(<?= $image_width ?>, <?= $image_height ?>,
       <?= $image_cisoptr ?>, "<?= $image_cisoroot ?>");
 });
 </script>

<? dmGetImageInfo($image_cisoroot, $image_cisoptr,
    $filename, $type, $width, $height); ?>