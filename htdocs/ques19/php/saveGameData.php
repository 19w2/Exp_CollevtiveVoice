<?php
$fname = "../save/gameData/savedGameData.csv";

$fp=fopen($fname, 'a+');

$v1 = $_POST['val1'];
$v2 = $_POST['val2'];

fwrite($fp, "$v2,");
fwrite($fp, "$v1,");

foreach ($_POST as $key => $val) {
    if ($key != 'val1' && $key != 'val2') {
        fwrite($fp, "$val,");
    }
}

fwrite($fp, "\n");

fclose($fp);
?>
