<?php
$fname = "./counter/counter.dat";
$maxNum = 36;
$cmd = $_GET['cmd'];

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
   echo $num;
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
   echo fgets($fp);
   fclose($fp);
}
?>
