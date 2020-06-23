<?php
$fname = "./counter/counter.dat";
if (isset($_GET['cmd'])) {
   $cmd = $_GET['cmd'];
} else {
   $cmd = "";
}

$stimulus = array('conditions/01',
		  'conditions/02',
		  'conditions/03',
		  'conditions/04',
		  'conditions/05',
		  'conditions/06',
		  'conditions/07',
		  'conditions/08',
		  'conditions/09',
		  'conditions/10',
		  'conditions/11',
		  'conditions/12',
		  'conditions/13',
		  'conditions/14',
		  'conditions/15',
		  'conditions/16',
		  'conditions/17',
		  'conditions/18',
		  'conditions/19',
		  'conditions/20',
		  'conditions/21',
		  'conditions/22',
		  'conditions/23',
		  'conditions/24',
		  'conditions/25',
		  'conditions/26',
		  'conditions/27',
		  'conditions/28',
		  'conditions/29',
		  'conditions/30',
		  'conditions/31',
		  'conditions/32',
		  'conditions/33',
		  'conditions/34',
		  'conditions/35',
		  'conditions/36',
		  'conditions/37',
		  'conditions/38',
		  'conditions/39',
		  'conditions/40'
		  );

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
   echo $stimulus[fgets($fp)];
   fclose($fp);
}
?>
