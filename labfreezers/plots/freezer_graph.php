<?php
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());
  mysql_select_db(Config::$dbname) or die (mysql_error());

  // Get the units that we're looking at
  $unit_query = 'SELECT unitid FROM freezer_units;';
  $results = mysql_query($unit_query);
  $units = array();
  while ( $result = mysql_fetch_row($results) ) {
    array_push($units, $result[0]);
  }

  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;
  $units = isset($_GET['units']) ? explode(',', $_GET['units']) : $units;

  // we need data in a slightly different format than in the database so we'll
  // sort it into an array and print it later!

  $data['header'] = array('Date', );
  foreach ( $units as $unit ) {
    array_push($data['header'], 'Freezer ' . $unit);
  }

  // Create an empty data placeholder to save some speed
  $empty = array();
  foreach ( $units as $unit ) {
    array_push($empty, '');
  }

  // Get data for all tanks
  $query = 'SELECT freezer, created, temp FROM freezer_log WHERE freezer IN (' . implode(', ', $units) . ')' .
           ' AND (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(created)*24+HOUR(created)) < ' . $days * 24 .
           ' ORDER BY created DESC;';
  $results = mysql_query($query);

  // Sort the data into our array
  while ( $result = mysql_fetch_row($results) ) {
    if ( !array_key_exists($result[1], $data) ) {
      $data[$result[1]] = $empty;
    }
    $data[$result[1]][array_search($result[0], $units)] = $result[2];
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
