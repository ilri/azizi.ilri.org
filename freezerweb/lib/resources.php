<?php

function get_tanks() {
  // Get login information
   require_once 'azizi_config';

	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());

  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  // Open the mysql connection
  mysql_select_db(Config::$dbname) or die (mysql_error());

  // Get the tanks that we're looking at
  $tank_query = 'SELECT TankID FROM units;';
  $results = mysql_query($tank_query);
  $tanks = array();
  while ( $result = mysql_fetch_row($results) ) {
    array_push($tanks, $result[0]);
  }

  return $tanks;
}

?>
