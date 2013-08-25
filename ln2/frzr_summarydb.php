
<?php 

echo (date('H.i.s'));

include 'frzr_config.php';    # it is in /etc/php5/include/ which is known to php
                              # 101frzr_config points to the ilri lims server
                              # frzr_config points to azizi localhost

$normal_colour = "#CCCCCC";
$warn_colour =   "#FFFF99";
$alert_colour =  "#FF3300";


$old = 2;         # triggers alert colour if latest report is more than this many HOURS old

$days1 = 14;
$days2 = 28;
$old_phone = 2;
//Kihara wrote: was complaining cant connect to the remote comp, so i edited it
$conn = mysql_connect("$dbhost:3306", $dbuser, $dbpass) or die ('Error connecting to mysql');
mysql_select_db($dbname);

#########################
### 1st look at the the monitoring script ######################

$sql = "select time, signal, success, device,
        date_format(time, '%e %b %y %H:%i') as smart_date,
        time<DATE_SUB(NOW(), INTERVAL $old_phone HOUR) as old
        from phone_status order by time desc limit 1;"; 
        



$rs = mysql_query($sql,$conn);

echo ('<br><br><table border = 1 cellpadding="4" cellspacing="1">');
echo('<tr bgcolor=\'#AAAAAA\'><td colspan = 5 align = \'center\'> SMS alerting script status</td></tr>');

echo('<tr bgcolor=\'#AAAAAA\'><td>GSM on device</td><td align = \'center\'>signal quality<br>(-50 is very good, -100 is very bad)</td><td>GSM connection</td><td>latest GSM log</td><td>All ok ?</td></tr>');

if ($row = mysql_fetch_array($rs)) {
  echo("<tr><td>".$row["device"]."</td>");
 echo("    <td align = 'center'>".$row["signal"]."db</td>");
 
 if ($row["success"]==1){
        echo("    <td align = 'center'><img src='ok.jpg' height='15'></td>");}
    else{
        echo("    <td align = 'center'><img src='not_ok.jpg' height='15'></td>");}

 
 echo("    <td>".$row["smart_date"]."</td>");
 
 
  if (($row["old"]==0) and ($row["success"]==1)){
        echo("    <td align = 'center'><img src='ok.jpg' height='15'></td>");}
    else{
        echo("    <td align = 'center'><img src='not_ok.jpg' height='15'></td>");}
 
 echo("    </tr>");
}

echo('</table><p><p>');



#########################


# what tanks exist ?
$sql = "select tankID from log group by TankId";
$rs = mysql_query($sql,$conn);

$tanklist = array();


while ($row = mysql_fetch_array($rs))
{
	array_push($tanklist, $row["tankID"]);
}


echo ('<table cellpadding="4" cellspacing="1">');
echo("<tr bgcolor='#AAAAAA'><td>Freezer</td><td>Temp</td><td>level</td><td>lid</td><td>fill</td><td>T/C</td><td>alarms</td><td>date</td><td bgcolor = white> </td></tr>\n");

  foreach ($tanklist as $tank)
{


$sql = "select max_temp from units where TankID='".$tank."'";
$rs = mysql_query($sql,$conn);
$row = mysql_fetch_array($rs);
$max_temp = $row["max_temp"];


  
$fixed = "select TankID,  
        date_format(CreatedOn, '%e %b %y %H:%i') as smart_date,
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
        from log where ";  
  
$asql[0]= "$fixed TankID='".$tank."' order by CreatedOn desc limit 1;"; 

$asql[1] = "$fixed date_sub(now(), interval " . $days1 . " DAY) <= CreatedOn and
        TankID='".$tank."' order by temp desc, CreatedOn desc  limit 1;"; 
        
$asql[2] = "$fixed date_sub(now(), interval " . $days2 . " DAY) <= CreatedOn and
        TankID='".$tank."' order by temp desc, CreatedOn desc  limit 1;"; 

$asql[3] = "$fixed lid=1 and TankID='".$tank."' order by CreatedOn desc limit 1;"; 

$asql[4] ="$fixed fill=1 and TankID='".$tank."' order by CreatedOn desc limit 1";      
        
$asql[5] = "$fixed alarms<>'0' and TankID='".$tank."' order by CreatedOn desc limit 1;"; 
  
$text = array(0 =>' latest record', 1 => " max temp in last $days1 days", 2 => " max temp in last $days2 days", 3 => ' last lid opening', 4 => 'last fill', 5 => 'last alarm');

 # foreach ($asql as $eachq)  {
 # foreach (0..4 as $eachq)  {
for ( $counter = 0; $counter <= 5; $counter += 1) {
    
$rs = mysql_query($asql[$counter],$conn);

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
  
    ($row["thermocouple_error"] != 0) ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["thermocouple_state"] . "</td>");
 
 
    ($row["alarms"] != '0') ? $use_colour = $alert_colour : $use_colour = $normal_colour;
 echo("<td  bgcolor=\"" . $use_colour . "\">" . $row["alarmstate"] . "</td>");
 

 echo("<td  bgcolor=\"" . $normal_colour . "\">" . $row["smart_date"] .  "</td>\n");
 
  echo("<td  bgcolor=\"" . 'white' . "\">" . $text[$counter] .  "</td></tr>\n");


}


}

 echo("<tr bgcolor='#FFFFFF'><td> </td><td> </td><td> </td><td> </td><td> </td><td></td><td> </td><td></td><td> </td></tr>\n");

}

echo("</table>\n");


?>
