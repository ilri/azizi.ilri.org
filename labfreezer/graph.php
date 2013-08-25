<?php
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());
  mysql_select_db(Config::$dbname) or die (mysql_error());

  // Set the variables that we need
  $id   = isset($_GET['id'])   ? $_GET['id']   : 11;
  $unit = isset($_GET['unit']) ? $_GET['unit'] : 'temp';
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  // Create a query to get our information;
  $query = "SELECT   created, ${unit}
            FROM     freezer_log
            WHERE    freezer = ${id}
                 AND ${days} * 24 > (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(created)*24+HOUR(created))
            ORDER BY created ASC;";

  // "${days} * 24 > (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(created)*24+HOUR(created))"
  // can be replaced by
  // "created > NOW() - INTERVAL ${days} DAY"
  // if you don't need < 1 day resolution

  $results = mysql_query($query);
  // Print our header
  //header('Content-type: text/csv');
  //header('Content-Disposition: attachment; filename="unit' . $id . '_' . $unit . '.csv"');
  echo "Date,${unit}\n";

  while ( $result = mysql_fetch_row($results) ) {
    echo implode(',', $result) . "\n";
  }
  exit(0);
?>
