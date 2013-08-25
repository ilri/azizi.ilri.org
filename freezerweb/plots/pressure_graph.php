<?php
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());
  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  mysql_select_db(Config::$dbname) or die (mysql_error());

  // Get data from the database
//  $query = 'SELECT `timestamp`, analog0 * 0.05 ' .
//           'FROM pressure ' .
//           'WHERE analog0 > 10 ' .
//           '  AND (TO_DAYS(NOW())*24+HOUR(NOW())) - ' .
//                 '(TO_DAYS(`timestamp`)*24+HOUR(`timestamp`)) < ' . $days * 24 . ' ' .
//           'ORDER BY timestamp DESC';
$selDays = $days * 24;
$query = "select `timestamp`, `analog0`*0.05 from pressure where `analog0` > 10 and (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(`timestamp`)*24+HOUR(`timestamp`)) < $selDays order by `timestamp`";
//$query = "select `timestamp`, `analog0`*0.05 from pressure order by `timestamp` desc";
//  $query = "select timestamp, analog0*0.05 from pressure where date_sub(timestamp, interval 2 day) > '2012-03-01 00:01:00' order by timestamp asc";
//echo $query;
  $results = mysql_query($query, $conn);
// echo mysql_num_rows($results);

  // print header
  header('Content-type: text/csv');
  header('Content-Disposition: attachment; filename="pressure_data.csv";' );
  print "Date,Pressure\n";

  $timeLimit = date('Y-m-d H:i:s', strtotime("-{$days} days"));
//echo $timeLimit;
  while ( $result = mysql_fetch_row($results) ) {
    //if($result[0] < $timeLimit) print $result[0] . ',' . $result[1] . "\n";
    print $result[0] . ',' . $result[1] . "\n";
  }

  exit(0);
?>
