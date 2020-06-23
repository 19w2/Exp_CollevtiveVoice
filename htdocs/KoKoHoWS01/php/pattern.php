<?php
$fname = "./counter/counter.dat";
if (isset($_GET['cmd'])) {
    $cmd = $_GET['cmd'];
} else {
    $cmd = "";
}

$pat = '../json/*.json';
$stimulus = glob($pat);

$maxNum = count($stimulus) -1;

if ($cmd == 'up') {
    $fp = fopen($fname, 'r');
    $str = fgets($fp);
    $num = 0;
    if ($str != '') {
        $num = intval($str);
    }
    fclose($fp);

    if (!$fp = fopen($fname, 'w')) {;
        echo "locked";
        exit;
    }

    flock($fp, LOCK_EX);
    $wnum = $num + 1;

    if ($wnum > $maxNum) {
        $wnum = 0;
    }

    if (!fwrite($fp, $wnum) ) {
        echo "error";
        fclose($fp);
        exit;
    }

    fclose($fp);
    echo $stimulus[$num];
} else if ($cmd == 'reset') {
    $fp = fopen($fname, 'w');
    if ($fp == FALSE) {
        echo "locked";
        exit;
    }
    fwrite($fp, 0);
    fclose($fp);
} else {
    $fp = fopen($fname, 'r');
    if ($fp == FALSE) {
        echo "locked";
        exit;
    }
    $idx = intval(fgets($fp));

#   echo $stimulus[$idx];
    readfile($stimulus[$idx]);
    fclose($fp);
}
?>
