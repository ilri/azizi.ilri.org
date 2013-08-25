<?php
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());

  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  // Open the mysql connection
  mysql_select_db(Config::$dbname) or die (mysql_error());

  // Get data from the database
  $query = 'SELECT timestamp, (analog1-analog0)/4.3 ' .
           'FROM pressure ' .
           'WHERE analog0 > 10 AND analog1 > 10 ' .
             'AND (TO_DAYS(NOW())*24+HOUR(NOW()))' .
              ' - (TO_DAYS(timestamp)*24+HOUR(timestamp)) < ' . $days * 24 . ' ' .
              'AND (analog1-analog0)/4.3 < 1.0 ' .
           'ORDER BY timestamp DESC';

  $results = mysql_query($query);

  // print header
  header('Content-type: text/csv');
  header('Content-Disposition: attachment; filename="level_data.csv";' );
  print "Date,Level\n";

  while ( $result = mysql_fetch_row($results) ) {
    print $result[0] . ',' . $result[1] . "\n";
  }

  exit(0);
?>
