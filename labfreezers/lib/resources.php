<?php

function get_freezers() {
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());

  // Set the variables that we need
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  mysql_select_db(Config::$dbname) or die (mysql_error());
  $type = ($_GET['type'] == 'room') ? 'room' : 'freezer';
  $titles = array(
     'room' => 'Rooms and Equipment',
     'freezer' => 'Lab Fridge and Freezer Temperatures',
  );

  // Get the freezers that we're looking at
  $tank_query = "
SELECT fu.unitid AS Id,
       fu.description AS Description,
       fu.location AS Location,
       fu.contents AS Contents,
       FORMAT(max.temp,1) AS 'Max Temp. Last 24h',
       FORMAT(min.temp,1) AS 'Min Temp. Last 24h',
       IF (DATE(fl.created) = DATE(NOW()),
           DATE_FORMAT(fl.created, 'Today %H:%i'),
           DATE_FORMAT(fl.created, '%e %b  %H:%i')) AS 'Last Measure',
      FORMAT((fl.temp),1) AS Temp
FROM freezer_log fl
JOIN freezer_units fu
  ON fl.freezer = fu.unitid
JOIN (SELECT freezer, MAX(created) created
      FROM freezer_log GROUP BY freezer) fl2
  ON fl.freezer = fl2.freezer
 AND fl.created = fl2.created
JOIN (SELECT freezer, MAX(temp) temp
      FROM freezer_log
      WHERE TO_DAYS(created)*24+HOUR(created) +24 > TO_DAYS(NOW())*24 + HOUR(NOW())
      GROUP BY freezer) max
  ON max.freezer = fl.freezer
JOIN (SELECT freezer, MIN(temp) temp
      FROM freezer_log
      WHERE TO_DAYS(created)*24+HOUR(created) +24 > TO_DAYS(NOW())*24 + HOUR(NOW())
      GROUP BY freezer) min
  ON min.freezer = fl.freezer
WHERE fu.type = '$type'
GROUP BY fl.freezer;";

  $results = mysql_query($tank_query);
  $freezers = array();
  while ( $result = mysql_fetch_assoc($results) ) {
    $freezers[$result['Id']] = $result;
  }
  mysql_close();
  return $freezers;
}

?>
