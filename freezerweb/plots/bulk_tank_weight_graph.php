<?php
  // Get login information
  require_once('/etc/php5/include/frzr_config.php');
  
  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  // Open the mysql connection
  $conn = mysql_connect($dbhost, $dbuser, $dbpass) or die (mysql_error());
  mysql_select_db($dbname) or die (mysql_error());
  
  // Get data from the database 
  $query = 'SELECT timestamp_on_addition, voltage FROM bulk_tank_weight ' . 
           'WHERE (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(timestamp_on_addition)*24+HOUR(timestamp_on_addition)) < ' . $days * 24 .
           ' ORDER BY timestamp_on_addition DESC';

  $results = mysql_query($query);

  // print header
  header('Content-type: text/csv');
  header('Content-Disposition: attachment; filename="level_data.csv";' ); 
  print "Date,Voltage\n";

  while ( $result = mysql_fetch_row($results) ) {
    print $result[0] . ',' . $result[1] . "\n";
  }

  exit(0);
?>
