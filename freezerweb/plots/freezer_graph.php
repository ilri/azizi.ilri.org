<?php
  // Get login information
  //require_once('../lib/settings.php');
	require_once('/etc/php5/include/frzr_config.php');
  
  // Open the mysql connection
  $conn = mysql_connect($dbhost, $dbuser, $dbpass) or die (mysql_error());
  mysql_select_db($dbname) or die (mysql_error());
  
  // Get the tanks that we're looking at
  $tank_query = 'SELECT TankID FROM units;';
  $results = mysql_query($tank_query);
  $tanks = array();
  while ( $result = mysql_fetch_row($results) ) {
    array_push($tanks, $result[0]);
  }

  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;
  $tanks = isset($_GET['tanks']) ? explode(',', $_GET['tanks']) : $tanks;
  
  // we need data in a slightly different format than in the database so we'll 
  // sort it into an array and print it later!

  $data['header'] = array('Date', );
  foreach ( $tanks as $tank ) {
    array_push($data['header'], 'Tank ' . $tank);
  }
  
  // Create an empty data placeholder to save some speed
  $empty = array();
  foreach ( $tanks as $tank ) {
    array_push($empty, '');
  }
  
  // Get data for all tanks
  $query = 'SELECT TankID, EventDate, temp FROM log WHERE TankID IN (' . implode(', ', $tanks) . ')' .  
           ' AND (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(EventDate)*24+HOUR(EventDate)) < ' . $days * 24 . 
           ' ORDER BY EventDate DESC;';
  $results = mysql_query($query);
  
  // Sort the data into our array
  while ( $result = mysql_fetch_row($results) ) {
    if ( !array_key_exists($result[1], $data) ) {
      $data[$result[1]] = $empty;
    }
    $data[$result[1]][array_search($result[0], $tanks)] = $result[2];
  }

  // Print our csv header
  header('Content-type: text/csv;');
  header('Content-Disposition: attachment; filename="freezer_data.csv";' ); 

  // Print out data
  foreach ( $data as $key => $row ) {
    if ( $key != 'header' ) {
      print $key . ',';
    }
    print implode(',', $row) . "\n";
  }
  
  exit(0);
?>
