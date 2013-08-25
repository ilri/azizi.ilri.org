<?php
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());
	mysql_select_db(Config::$dbname) or die (mysql_error());
   
	$query = "SELECT a.TankId, a.owner, a.description, a.location, a.contents, b.EventDate, b.temp FROM units AS a LEFT JOIN (SELECT TankID, MAX(EventDate) AS EventDate, temp FROM log GROUP BY TankID) AS b ON a.TankId = b.TankID;";

	$result = mysql_query($query);

	echo "<table>";
	echo "<tr class='odd'><th colspan ='5' class='title'>Unit Descriptions</td><th colspan='2' class='title'>Latest Report</td></tr>";
	echo "<tr class='even'><th>Tank ID</td><th>Owner</td><th>Description</td><th>Location</td><th>Contents</td><th>Measure Time</td><th>Temp</td></tr>";
	$c = 1;
	while ($row = mysql_fetch_row($result))
	{
		$tag = (++$c % 2) ? 'even' : 'odd';
		echo "<tr class='".$tag."'><td>".$row[0]."</td><td>".$row[1]."</td><td>".$row[2]."</td><td>".$row[3]."</td><td>".$row[4]."</td><td>".$row[5]."</td><td>".$row[6]."</td></tr>";
	}
	echo "</table>";

	mysql_close($conn);
?>
