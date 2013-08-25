<?php
	error_reporting(E_ALL);
   require_once 'azizi_config';
	$conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());

	mysql_select_db(Config::$dbname) or die (mysql_error());

	$cam = ($_GET['cam']) ? $_GET['cam'] : 'unknown';

	$query = "SELECT CreatedOn, {$cam}_image FROM log WHERE {$cam}_image IS NOT NULL and {$cam}_image != '' ORDER BY CreatedOn DESC LIMIT 1";
	$results = mysql_query($query);
	$result = mysql_fetch_row($results);

	$title = 'Image from '.str_replace('_', ' ', $cam).' taken '.$result[0].'.';

	/*$img = imagecreatefromstring($result[1]);
	$nw = round(($_GET['width']) ? $_GET['width'] : imagesx($img));
	$nh = round(imagesy($img)*($nw/imagesx($img)));

	ob_start();
	imagejpeg($img);
	$contents = ob_get_contents();
 	ob_end_clean();*/

 	$output = "<img src='/door_images/{$result[1]}' width='450' />";
 	//imagedestroy($img);

	echo $title.'<br>';
	echo $output;

?>
