<?php
$fname = "../save/quesData/savedData.csv";
$fp=fopen($fname, 'a+');
foreach ($_POST as $key => $val) {
    fwrite($fp, "$val,");
}
fwrite($fp, "\n");
fclose($fp);
?>
