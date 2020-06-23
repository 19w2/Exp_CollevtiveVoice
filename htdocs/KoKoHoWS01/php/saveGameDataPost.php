<?php
$ipAddr = $_SERVER["REMOTE_ADDR"];
$fname = "../save/gameData.csv";
$fp=fopen($fname, 'a+');
fwrite($fp, "$ipAddr,");
foreach ($_POST as $key => $val) {
    fwrite($fp, "$val,");
}
fwrite($fp, "\n");
fclose($fp);
?>
