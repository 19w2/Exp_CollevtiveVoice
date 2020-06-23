<?php
$base = "../conf/";
$fname = $base.$_GET['file'];

if (file_exists($fname)) {
   readfile($fname);
}
?>
