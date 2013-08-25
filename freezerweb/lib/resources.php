<?php
  
function get_tanks() {
  // Get login information
  //require_once('settings.php');
  require_once('/etc/php5/include/frzr_config.php');
  
  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

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

  return $tanks;
}

?>
