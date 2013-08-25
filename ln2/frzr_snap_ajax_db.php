<?php 



include 'frzr_config.php'; # it is in /usr/lib/php/include/ which is known to php
                              # 101frzr_config points to the ilri lims server
                              # frzr_config points to azizi localhost

$normal_colour = "#CCCCCC";
$warn_colour =   "#FFFF99";
$alert_colour =  "#FF3300";
$low_p_colour =  "#87ceeb";
$high_p_colour = "#ff8c00";

$high_temp_colour = "#FF3300";
$low_temp_colour =  "#87ceeb";   # warning colours used for lab freezers

$old = 2;         # triggers alert colour if latest report is more than this many HOURS old
$old_phone = 2;   # declares problem if phone status is more than this many HOURS old


$cluster_old = 1;
$pressure_old = 1.5;
$freezer_old = 1.5;
$hpc_raid_old = 1; # report not ok if more than this many hours old

$max_bar = 5;
$min_bar = 2;
$min_O2 = 19.3;
$min_contents = 20;
$max_contents = 110;
$plant_time = 10;  # days over which to count LN2 plant runing/not running
$plant_start_time = '2011-02-16';  # start date for total log hours

$fill_point_time = 10;  # days over which to count fillpoint in use/not in use
$fill_point_start_time = '2011-03-16';  # start date for total fillpoint log hours

$conversion_factor = 0.0435;   # get % contents from pressure diff in mV
# $conversion_factor = 0.07;   # get % contents from pressure diff in mV

$max_cluster_temp = 23.5;
$max_freezer_temp = -14;

//Kihara wrote: There was a problem while connecting to the server, so i added the port and it worked
#$conn = mysql_connect("$dbhost:3306", $dbuser, $dbpass) or die ('Error connecting to mysql. '.mysql_error());
$conn = mysql_connect("$dbhost", $dbuser, $dbpass) or die ('Error connecting to mysql. '.mysql_error());
mysql_select_db($dbname);


# what tanks exist ?



### temp kludge to remove tank 3 while under repair

 $sql = "select tankID from log group by TankId";
# $sql = "select tankID from log where TankId <> 3 group by TankId";


$rs = mysql_query($sql,$conn);

$tanklist = array();


while ($row = mysql_fetch_array($rs))
{
	array_push($tanklist, $row["tankID"]);
}

# echo (' '.date('H:i:s'));

//Kihara wrote: was complaining about the date settings not being set so i set them
date_default_timezone_set('Africa/Nairobi');
$s=date('s') / 10;

 ($s % 2 == 0 ) ? $tick=('-') : $tick=('|');

#echo ("$tick");



### is the email/sms monitoring tool running ?

$sql = "select time, success, 
        date_format(NOW(), '%H:%i:%s') as servertime,
        time<DATE_SUB(NOW(), INTERVAL $old_phone HOUR) as old
        from phone_status order by time desc limit 1;"; 
        
$rs = mysql_query($sql,$conn);

if ($row = mysql_fetch_array($rs)){
  echo(" <p> Status at db server time ".$row[servertime].". ");
  if ($row["old"] == 0) {
        echo(" LN Monitoring <img src='/ln2/ok.jpg' height='15'>");
        if ($row["success"] == 1) {echo(" sms alerting <img src='/ln2/ok.jpg' height='15'>");}
           else {echo(" sms alerting <img src='/ln2/not_ok.jpg' height='15'>");}
    } else {
            echo(" Monitoring system is down  <img src='/ln2/not_ok.jpg' height='20'> ");   
       }

}

echo ('<table cellpadding="4" cellspacing="1" border=0 >');   
echo('<tr><td align = "left">');
####outer table

echo("<h2>LN<sub>2</sub> refrigerators <a href=\"/freezerweb/\" >more</a></h2>\n");

echo ('<table cellpadding="4" cellspacing="1">');
echo("<tr bgcolor='#AAAAAA'><td>Unit</td><td>Temp</td><td>level</td><td>lid</td><td>fill</td> <td>alarms</td><td>last report</td></tr>\n");

foreach ($tanklist as $tank){
	$sql = "select max_temp, active from units where TankID='".$tank."'";
	$rs = mysql_query($sql,$conn);
	$row = mysql_fetch_array($rs);
	$max_temp = $row["max_temp"];
	$active = $row['active'];
	if($active == 0){
		continue;	//This tank is not active... so dont display it on the browser
	}
  
$sql = "select TankID,  

        if (   DATE(CreatedOn) = DATE(NOW()),  date_format(CreatedOn, '%H:%i'), date_format(CreatedOn, '%e %b  %H:%i')) as smart_date,

        ((unix_timestamp(now()) - unix_timestamp(CreatedOn))/3600)  as hours_old, 
        temp, 
        level, 
        lid,
        if (lid=0,'shut','open') as lidstate, 
        fill,
        if (fill=0,'off','on') as fillstate,
        thermocouple_error,
        if (thermocouple_error=0,'ok','FAULT') as thermocouple_state,
        alarms,
        if (alarms='0','none',alarms) as alarmstate
        from log where TankID='".$tank."' order by CreatedOn desc limit 1;"; 


$rs = mysql_query($sql,$conn);

while ($row = mysql_fetch_array($rs))
{
 ($row["temp"] > $max_temp) ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 echo("<tr bgcolor=\"" . $normal_colour . "\"><td>" . $row["TankID"] . "</td><td  bgcolor=\"" . $use_colour . "\">" . $row["temp"] . "</td>\n");


 ($row["level"] != 'normal')  ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 if ($row["level"] == 'high')   $use_colour = $warn_colour;

 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["level"] . "</td>");
 
  ($row["lid"] != '0') ? $use_colour = $warn_colour : $use_colour = $normal_colour;
 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["lidstate"] . "</td>");
 
   ($row["fill"] != '0') ? $use_colour = $warn_colour : $use_colour = $normal_colour;
 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["fillstate"] . "</td>");
 
  
 
 
 
    ($row["alarms"] != '0') ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["alarmstate"] . "</td>");
 
 ($row["hours_old"] > $old) ? $use_colour = $alert_colour : $use_colour = $normal_colour;

 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["smart_date"] .  "</td></tr>\n");
}


}


echo("</table>\n");

echo('</td><td align = "right">');
####outer table

##############
############## bulk tank status ?


$sql = "select 

        if (   DATE(timestamp) = DATE(NOW()),  date_format(timestamp, '%H:%i'), date_format(timestamp, '%e %b  %H:%i')) as smart_date,

        ((unix_timestamp(now()) - unix_timestamp(timestamp))/3600)  as hours_old, 
        format((analog0 * 0.05),1) as bar,
        format((analog1-analog0)/$conversion_factor,0) as contents,
        format((analog1-analog0),2) as diff,
        format((O2),1) as O2,
        format((ambient),1) as ambient,
         if (switch=0,'open','closed') as switch_state,
         if (door=1,'open','closed') as door_state,
         if (LN2_plant > 0, 'running','stopped') as plant,
         if (vent_valve > 0, 'venting','closed') as vent_valve,
         if (vent_alarm > 0, 'alarm!','ok') as vent_alarm,
         if (fill_point < 0,'LN2 flowing', 'warm') as fill_point
        from pressure
        order by timestamp desc limit 1;";
        
$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);


{



if ($row["fill_point"]  != 'warm') {
   $fill_point_header_text = "<td>fill point</td>";
   $fill_point_table_text = "<td  bgcolor=\"" . $alert_colour . "\">" . $row["fill_point"] .  "</td>\n";}
else
  {
   $fill_point_header_text = "";
   $fill_point_table_text = "";
  }



if ($row["switch_state"] != 'open') {
   $top_switch_state_header_text = "<td>LN supply</td>";
   $switch_state_header_text = "<td>Shutoff valve</td>";
   $switch_state_table_text = "<td  bgcolor=\"" . $alert_colour . "\">" . $row["switch_state"] .  "</td>\n";}
else
  {
   $top_switch_state_header_text = " ";
   $switch_state_header_text = "";
   $switch_state_table_text = "";
  }


if ($row["vent_valve"] != 'closed') {
   $top_vent_valve_header_text = "<td>Hot gas</td>";
   $vent_valve_header_text = "<td>vent valve</td>";
   $vent_valve_table_text = "<td  bgcolor=\"" . $warn_colour . "\">" . $row["vent_valve"] .  "</td>\n";}
else
  {
   $top_vent_valve_header_text = " ";
   $vent_valve_header_text = "";
   $vent_valve_table_text = "";
  }



if ($row["vent_alarm"] != 'ok') {
   $top_vent_alarm_header_text = "<td>Hot gas</td>";
   $vent_alarm_header_text = "<td>vent alarm</td>";

   $vent_alarm_table_text = "<td  bgcolor=\"" . $alert_colour . "\">" . $row["vent_alarm"] .  "</td>\n";}
else
  {
   $top_vent_alarm_header_text = " ";
   $vent_alarm_header_text = "";
   $vent_alarm_table_text = "";
  }


if ($row["door_state"] != 'closed') {
   $top_door_header_text = "<td> </td>";
   $door_header_text = "<td>Door</td>";

   $door_table_text = "<td  bgcolor=\"" . $warn_colour . "\">" . $row["door_state"] .  "</td>\n";}
else
  {
   $top_door_header_text = " ";
   $door_header_text = "";
   $door_table_text = "";
  }



echo ('<h2> Ancilliary LN<sub>2</sub> systems</h2>');

echo ('<table cellpadding="4" cellspacing="1" style="vertical-align:top">');

echo("<tr bgcolor='#AAAAAA'><td colspan = '2' align = 'center'>Bulk tank</td> $top_door_header_text $top_switch_state_header_text $top_vent_valve_header_text $top_vent_alarm_header_text <td>room</td> <td>$fill_point_header_text</td><td>&nbsp;</td></tr>\n");

echo("<tr bgcolor='#AAAAAA'><td>Contents</td><td>Pressure</td>$door_header_text $switch_state_header_text $vent_valve_header_text $vent_alarm_header_text <td> O<sub>2</sub></td>$fill_point_header_text<td>LN plant</td><td>last report</td></tr>\n");

 ($row["contents"] > $max_contents) ? $use_colour = $high_p_colour : $use_colour = $normal_colour;
 if ($row["contents"] < $min_contents){$use_colour = $low_p_colour;}
 echo("<tr bgcolor=\"" . $normal_colour . "\"><td  bgcolor=\"" . $use_colour . "\">" . $row["contents"] . " %</td>\n");

## $use_colour = $normal_colour;
## echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["diff"] . " mV</td>\n");

 ($row["bar"] > $max_bar) ? $use_colour = $high_p_colour : $use_colour = $normal_colour;
 if ($row["bar"] < $min_bar){$use_colour = $low_p_colour;}
 
  echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["bar"] . " bar</td>\n");
  
  
    
##  ($row["switch_state"] != 'open') ? $use_colour = $alert_colour : $use_colour = $normal_colour; 
##  echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["switch_state"] .  "</td>\n");
 
echo($door_table_text); 
echo($switch_state_table_text ); 
echo($vent_valve_table_text ); 
echo($vent_alarm_table_text ); 

  
    ($row["O2"]  < $min_O2) ? $use_colour = $alert_colour : $use_colour = $normal_colour; 
  echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["O2"] .  "%</td>\n");
  
echo($fill_point_table_text);


  echo("<td  bgcolor=\"" .  $normal_colour . "\">" . $row["plant"] .  "</td>\n");


 ($row["hours_old"] > $pressure_old) ? $use_colour = $alert_colour : $use_colour = $normal_colour;

 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["smart_date"] .  "</td></tr>\n");
}

echo("</table><p>\n");



##############
############## bulk tank status ?



echo("</td></tr>\n");
echo('<tr><td align = "left" colspan = "2">'); 
####outer table


############## LN2 plant

$sql =" SELECT 

 format((SUM( IF (a.LN2_plant >= 1,    
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60), 0) as running,

format ((SUM( IF (a.LN2_plant < 1,     
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b
WHERE b.id = a.id - 1))), 0))) / (60*60), 0)  as stopped


FROM pressure a
WHERE a.timestamp > (now() - interval ".$plant_time." day)
ORDER BY timestamp DESC;";


$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);
$up_duty = round( (100*$row["running"])/ ($row["running"]+$row["stopped"]), 0);


echo("<br>The LN plant ran for <b>".$up_duty ."%</b> of the time in the last " .$plant_time." days." );
 
##############

$sql =" SELECT 


 ((SUM( IF (a.LN2_plant >= 1,    
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60)) as running,

 
((SUM( IF (a.LN2_plant < 1,     
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60))  as stopped

FROM pressure a
WHERE a.timestamp > ('".$plant_start_time."')
ORDER BY timestamp DESC;";


$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);
$up_duty = round( (100*$row["running"])/ ($row["running"] + $row["stopped"]), 0);

#$row["running"] = round($row["running"],0);
$row["running"] = number_format($row["running"]);


echo(" It has logged a total of <b>".$row["running"] ." hours</b> since " .$plant_start_time." (". $up_duty."% duty).");
 
##############LN2 plnt







############## fill point use

$sql =" SELECT 

 format((SUM( IF (a.fill_point < 0,    
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60), 1) as running,

format ((SUM( IF (a.fill_point >= 0,     
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60), 1)  as stopped


FROM pressure a
WHERE a.timestamp > (now() - interval ".$fill_point_time." day)
ORDER BY timestamp DESC;";


$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);

$fp_str = " The external fill point was used for ".$row["running"] ." hours in the last " .$fill_point_time." days. ";


##############



$sql =" SELECT 

 format((SUM( IF (a.fill_point < 0,    
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60), 1) as running,

format ((SUM( IF (a.fill_point >= 0,     
TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b 
WHERE b.id = a.id - 1))), 0))) / (60*60), 1)  as stopped



FROM pressure a
WHERE a.timestamp > ('".$fill_point_start_time."')
ORDER BY timestamp DESC;";


$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);
$up_duty = round( (100*$row["running"])/ ($row["running"]+$row["stopped"]), 0);

$fp_str.="  Since ".$fill_point_start_time." it has been in use for ".$row["running"].  " hours.";
 

echo("<br>$fp_str");

echo("</td></tr>\n");
echo("<tr><td>\n");
#### outer table






####################
## lab freezers  ?
## they are considered freezer if their max_temp is < 10
## as distinct from room ambients, cluster temps etc
####################


echo "<br><br>";

echo("<h2>GS FLX lab fridges & freezers <a href='/labfreezers/?type=freezer'> more</a></h2>\n");

echo ('<table cellpadding="4" cellspacing="1">');
echo("<tr bgcolor='#AAAAAA'><td>id</td><td>location</td><td>description</td><td>temp</td><td>last report</td></tr>\n");


#################### another terrfying SQL from Martin

    $sql = "SELECT fl.freezer , 
      fu.location,
      fu.description,
      fu.contents,
      FORMAT((fl.temp),1) AS temp, 
      fu.max_temp, 
      fu.min_temp,
      ((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(fl.created))/3600) AS hours_old,
      IF (   DATE(fl.created) = DATE(NOW()),  
             DATE_FORMAT(fl.created, '%H:%i'), 
             DATE_FORMAT(fl.created, '%e %b  %H:%i')) AS smart_date
FROM freezer_log fl 

JOIN freezer_units fu 
 ON fl.freezer = fu.unitid 
 
JOIN (SELECT freezer, MAX(created) created
     FROM freezer_log GROUP BY freezer) fl2
 ON fl.freezer = fl2.freezer
AND fl.created = fl2.created
where fu.type = 'freezer' and fu.in_use = TRUE
GROUP BY freezer";
    
    
    
            
    $rs = mysql_query($sql,$conn);
    while ($row = mysql_fetch_array($rs))
    {
      echo("<tr bgcolor=\"" . $normal_colour . "\"><td  bgcolor=\"" . $normal_colour . "\">" . $row["freezer"] . "</td>\n");

      echo("<td  bgcolor=\"" .$normal_colour . "\">" . $row["location"] . "</td>\n");
      echo("<td  bgcolor=\"" .$normal_colour . "\"><a href=\"labfreezer/?id=" . $row["freezer"] . "\">" . $row["description"] . "</a></td>\n");

      
      if ($row["temp"] < $row["min_temp"])      {$use_colour = $low_temp_colour;}
      elseif  ($row["temp"] > $row["max_temp"]) {$use_colour = $high_temp_colour;}
      else                                      {$use_colour = $normal_colour;}
      
      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["temp"] .  "</td>\n");
      
      ($row["hours_old"] > $freezer_old) ? $use_colour = $alert_colour : $use_colour = $normal_colour;
      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["smart_date"] .  "</td></tr>\n");

    }   
    
echo("</table>\n");




echo("</td><td align = right>\n");
#### outer table



####################
## NON lab freezers  ?
## they are considered NOT freezer if their max_temp is >= 10
## ie room ambients, cluster temps etc
####################
?>
	<br><br>
	<h2>GS FLX equipment and rooms <a href="/labfreezers/?type=room" > more</a></h2>
	<table cellpadding="4" cellspacing="1">
	<tr bgcolor='#AAAAAA'><td>id</td><td>location</td><td>description</td><td>temp</td><td>CO2</td><td>O2</td><td>last report</td></tr>

<?php
#################### another terrfying SQL from Martin

    $sql = "SELECT fl.freezer , 
      fu.location,
      fu.description,
      fu.contents,
      FORMAT((fl.temp),1) AS temp, 
      FORMAT((fl.O2),1) AS O2,
      FORMAT((fl.CO2),1) AS CO2,
      fu.max_temp, 
      fu.min_temp,

      fu.max_co2, 
      fu.min_co2,
      
      fu.max_o2, 
      fu.min_o2,
      
      ((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(fl.created))/3600) AS hours_old,
      IF (   DATE(fl.created) = DATE(NOW()),  
             DATE_FORMAT(fl.created, '%H:%i'), 
             DATE_FORMAT(fl.created, '%e %b  %H:%i')) AS smart_date
FROM freezer_log fl 

JOIN freezer_units fu 
 ON fl.freezer = fu.unitid 
 
JOIN (SELECT freezer, MAX(created) created
     FROM freezer_log GROUP BY freezer) fl2
 ON fl.freezer = fl2.freezer
AND fl.created = fl2.created
where fu.type = 'room' and fu.in_use = TRUE
GROUP BY freezer";
    
    
    
            
    $rs = mysql_query($sql,$conn);
    while ($row = mysql_fetch_array($rs))
    {
      echo("<tr bgcolor=\"" . $normal_colour . "\"><td  bgcolor=\"" . $normal_colour . "\">" . $row["freezer"] . "</td>\n");

      echo("<td  bgcolor=\"" .$normal_colour . "\">" . $row["location"] . "</td>\n");
      echo("<td  bgcolor=\"" .$normal_colour . "\"><a href=\"labfreezer/?id=" . $row["freezer"] . "\">" . $row["description"] . "</a></td>\n");

      
      if ($row["temp"] < $row["min_temp"])      {$use_colour = $low_temp_colour;}
      elseif  ($row["temp"] > $row["max_temp"]) {$use_colour = $high_temp_colour;}
      else                                      {$use_colour = $normal_colour;}
      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["temp"] .  "</td>\n");
 
 
      if (($row["CO2"] < $row["min_co2"]))      {$use_colour = $low_temp_colour;}
      elseif  ($row["CO2"] > $row["max_co2"]) {$use_colour = $high_temp_colour;}
      else                                      {$use_colour = $normal_colour;}
      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["CO2"] .  "</td>\n");
      
      if (($row["O2"] < $row["min_o2"]))      {$use_colour = $low_temp_colour;}
      elseif  ($row["O2"] > $row["max_o2"]) {$use_colour = $high_temp_colour;}
      else                                      {$use_colour = $normal_colour;}

      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["O2"] .  "</td>\n");

      
      ($row["hours_old"] > $freezer_old) ? $use_colour = $alert_colour : $use_colour = $normal_colour;
      echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["smart_date"] .  "</td></tr>\n");

    }   
    
echo("</table>\n");




#### outer table


/*

$sql =  "select 

        if (   DATE(date) = DATE(NOW()),  date_format(date, '%H:%i'), date_format(date, '%e %b  %H:%i')) as smart_date,

        unitid, 
        ((unix_timestamp(now()) - unix_timestamp(date))/3600)  as hours_old, 
        temp from cluster order by date desc limit 1 ";  

$rs = mysql_query($sql,$conn);


$row = mysql_fetch_array($rs);

{

($row["hours_old"] > $cluster_old) ? $pic =  "not up <img src='/ln2/not_ok.jpg' height='20'>" : $pic =  " <img src='/ln2/ok.jpg' height='20'>";

echo ('<h2> GS FLX compute cluster '. $pic. '</h2>');

echo ('<table cellpadding="4" cellspacing="1">');
echo("<tr bgcolor='#AAAAAA'><td>Temp</td><td>last report</td></tr>\n");



 ($row["temp"] > $max_cluster_temp) ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 echo("<tr bgcolor=\"" . $normal_colour . "\"><td  bgcolor=\"" . $use_colour . "\">" . $row["temp"] . "</td>\n");

 ($row["hours_old"] > $cluster_old) ? $use_colour = $alert_colour : $use_colour = $normal_colour;

 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["smart_date"] .  "</td></tr>\n");
}

echo("</table>\n");

*/

####################
## HPC RAID status
## - are the disks in the hardware RAID ok?
####################

	$conn = mysql_connect($dbhost, $dbuser, $dbpass) or die ('Error connecting to mysql. '.mysql_error());
	mysql_select_db($dbname);

	$sql = "SELECT
		IF(DATE(date) = DATE(NOW()), date_format(date, '%H:%i'), date_format(date, '%e %b  %H:%i')) AS smart_date,
		xml_data,
		((unix_timestamp(now()) - unix_timestamp(date))/3600) AS hours_old
		FROM hpc ORDER BY date DESC LIMIT 1";
	$rs = mysql_query($sql,$conn);

	$row = mysql_fetch_array($rs);

	# turn it into a SimpleXMLObject
	$xml = simplexml_load_string($row[xml_data]);

	#echo ('<p> </p><p><u>HPC status</u></p>');
	# is the HPC's hardware RAID status current?
	($row["hours_old"] > $hpc_raid_old) ? $pic =  " <img src='/ln2/not_ok.jpg' height='20'>" : $pic =  " <img src='/ln2/ok.jpg' height='20'>";
	echo ('<h2>HPC RAID: monitoring'. $pic);
	# are all disks online (all 16 should be "Online")?
	(count($xml->xpath('//disk[status="Online"]')) != 16) ? $pic =  " <img src='/ln2/not_ok.jpg' height='20'>" : $pic =  " <img src='/ln2/ok.jpg' height='20'>";
	echo (' status'. $pic . '</h2>');
	
	if (count($xml->xpath('//disk[status="Online"]')) != 16){     ## show status of disks only if NOT all OK
	  echo ('<table cellpadding="4" cellspacing="1">');

	  # 16 disks, 4 rows of 4
	  # print row by row, instead of by columns!
	  # disk 0, disk 4, disk 8, disk 12
	  # disk 1, disk 5, disk 9, disk 13
	  # etc...
	  echo '  <table cellpadding="4" cellspacing="1">'."\n";
	  foreach(range(0,3) as $n) {
		$rowmax = $n+12;
		echo '      <tr>'."\n";
		for($x=$n; $x <= $rowmax; $x=$x+4) {
			# set the color based on the disk's status
			if( $xml->disk[$x]->status == "Online" ) $colour = $normal_colour; else $colour = $alert_colour;
			echo '          <td style="background-color: '.$colour.';">'.$xml->disk[$x]->id.'</td>'."\n";
		}
		echo '      </tr>'."\n";
	  }
	echo '  </table>'."\n";
    }




echo("</td></tr><table>\n");
#### outer table
?>
