<?php
class Azizi{

   /**
    * @var  object   The connection object that will be used to connect to the database
    */
   private $mysqlConn;

   /**
    * @var  integer  The number of days to fetch statistics for during calculation of the plant general status
    */
   private $plantRunTime = 10;

   /**
    * @var  string   A string representing a date when we started logging the status of the plant
    */
   private $plantStartTime = '2011-02-16';

   /**
    * @var  integer  The number of days over which to count fillpoint in use/not in use
    */
   private $fillPointTime = 10;

   /**
    * @var  string   A string representing the start date for the total fillpoint log hours
    */
   private $fillPointStartTime = '2011-03-16';

   /**
    *
    * @var  double   The conversion factor to use when calculating bulk tank contents. Get % contents from pressure diff in mV
    */
   private $conversionFactor = 0.0435;

   /**
    *
    * @var  integer  The number of hours after which the modem status become stale
    */
   private $phoneHoursOld = 2;

   /**
    * @var  object   An object to hold the database connection object and its other functions
    */
   public $Dbase;

   /**
    * The main controller. Controls which functions will be called and when
    */
   public function TrafficController(){
      require_once OPTIONS_COMMON_FOLDER_PATH . 'dbmodules/mod_objectbased_dbase_v1.0.php';
      require_once OPTIONS_COMMON_FOLDER_PATH . 'mod_general_v0.6.php';

      $this->Dbase = new DBase('mysql');
      $this->Dbase->InitializeConnection();

      if($this->Dbase->dbcon->connect_error || (isset($this->Dbase->dbcon->errno) && $this->Dbase->dbcon->errno!=0)) {

         die('Something wicked happened when connecting to the dbase.');
      }

      $this->Dbase->InitializeLogs();

      if(OPTIONS_REQUESTED_MODULE == 'equimentStatus') $this->EquipmentStatus();
      elseif(OPTIONS_REQUESTED_MODULE == 'search') $this->SearchDatabase();
      elseif(OPTIONS_REQUESTED_MODULE == 'sample_details') {
         $this->SampleDetails();
      }
      elseif(OPTIONS_REQUESTED_MODULE == 'organism_data') $this->getOrganismData();
      elseif(OPTIONS_REQUESTED_MODULE == 'stabilates') $this->StabilateHistory();
   }

   /**
    * Gets the statuses of all the equipments.
    *
    * Returns nothing. Instead, it creates a json string with all the equipment status
    */
   private function EquipmentStatus(){
      $currentStatus = array();
      if($_POST['initialRequest'] == 'yes'){
         $currentStatus['plantStatus'] = $this->PlantGeneralStatus();
         $currentStatus['fillPointStatus'] = $this->FillPointStatus();
      }
      $currentStatus['ln2FridgeStatuses'] = $this->Ln2FridgesStatuses();
      $currentStatus['ancilliaryStatus'] = $this->AncilliaryStatus();
      $currentStatus['fridgeFreezerStatuses'] = $this->FridgesAndFreezersStatuses();
      $currentStatus['equipmentsAndRoomsStatuses'] = $this->EquipmentAndRoomsStatuses();
      $currentStatus['otherStates'] = $this->OtherStates();

      die(json_encode($currentStatus, JSON_NUMERIC_CHECK));
   }

   /**
    * Calculates the plant averages from the database.
    *
    * @return  array    Returns an array with the plant averages
    */
   private function PlantGeneralStatus(){
      /* I am not re-factoring these sql statements at this time, 2013-08-25 13:10. Its time will come and for all the other queries too */
      //ln2 plant run time
      /*$query ="
         SELECT
            format((SUM( IF (a.LN2_plant >= 1, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60), 0) as running,
            format ((SUM( IF (a.LN2_plant < 1, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60), 0) as stopped
         FROM pressure a
         WHERE a.timestamp > (now() - interval {$this->plantRunTime} day)
         ORDER BY timestamp DESC
     ";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $row = $row[0];
//      var_dump($row);
      $up_duty = round( (100*$row["running"])/ ($row["running"]+$row["stopped"]), 0);

      //total running time averages
      $query = "
         SELECT
            ((SUM( IF (a.LN2_plant >= 1, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60)) as running,
            ((SUM( IF (a.LN2_plant < 1, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60))  as stopped
         FROM pressure a
         WHERE a.timestamp > ('{$this->plantStartTime}')
         ORDER BY timestamp DESC
     ";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $row = $row[0];
      $total_up_duty = round( (100*$row["running"])/ ($row["running"] + $row["stopped"]), 0);
      $total_running_hours = number_format($row["running"]);*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_plant']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         if(count($data) == 1){
            $up_duty = round( (100*$data[0]["ud_running"])/ ($data[0]["ud_running"]+$data[0]["ud_stopped"]), 0);
            $total_up_duty = round( (100*$data[0]["t_running"])/ ($data[0]["t_running"] + $data[0]["t_stopped"]), 0);
            $total_running_hours = number_format($data[0]["t_running"]);
            
            return array('upDuty' => $up_duty, 'totalUpDuty' => $total_up_duty, 'totalRunningHours' => $total_running_hours);
         }
         else if(count($data) == 0) {
            $error = "No data cached in the Solr server";
         }
         else {
            $error = "More than one record (".count($data).") fetched from the Solr server. Only one record expected";
         }
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Calculates the fill point status and averages from the database.
    *
    * @return  array    Returns an array with the fill point averages
    */
   private function FillPointStatus(){
      //fill point usage in the past few days
      /*$query = "
         SELECT
            format((SUM( IF (a.fill_point < 0, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60), 1) as running
         FROM pressure a
         WHERE a.timestamp > (now() - interval {$this->fillPointTime} day)
         ORDER BY timestamp DESC
     ";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $fillPointUsage = $row[0]["running"];

      //total fill poiny usage
      $query = "
         SELECT
            format((SUM( IF (a.fill_point < 0, TIME_TO_SEC(TIMEDIFF(a.timestamp, (SELECT b.timestamp FROM pressure b WHERE b.id = a.id - 1))), 0))) / (60*60), 1) as running
         FROM pressure a
         WHERE a.timestamp > ('{$this->fillPointStartTime}')
         ORDER BY timestamp DESC
     ";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $fillPointTotalUsage = $row[0]['running'];

      return array('fillPointUsage' => $fillPointUsage, 'fillPointTotalUsage' => $fillPointTotalUsage);*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_fill_point']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         if(count($data) == 1){
            $fillPointUsage = $data[0]["u_running"];
            $fillPointTotalUsage = $data[0]['t_running'];
            return array('fillPointUsage' => $fillPointUsage, 'fillPointTotalUsage' => $fillPointTotalUsage);
         }
         else if(count($data) == 0) {
            $error = "No data cached in the Solr server";
         }
         else {
            $error = "More than one record (".count($data).") fetched from the Solr server. Only one record expected";
         }
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Gets the latest fridge statuses
    *
    * @return  array    Returns an array with the fridge statuses
    */
   private function Ln2FridgesStatuses(){
      //number of active tanks
      /*$query = 'select count(*) as active_tanks from units where active = 1';
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $activeTanks = $row[0]['active_tanks'];

      $count = 0; $i = 1;
      while($count != $activeTanks){
         $limit = $activeTanks * $i;
         $query = "
            select
               a.TankID, temp, level, lid, fill, alarms, thermocouple_error, ((unix_timestamp(now()) - unix_timestamp(CreatedOn))/3600) as hours_old,
               if(DATE(CreatedOn) = DATE(NOW()), date_format(CreatedOn, '%H:%i'), date_format(CreatedOn, '%e %b  %H:%i')) as smart_date,
               if(lid=0,'shut','open') as lidstate, if(fill=0,'off','on') as fillstate,
               if(thermocouple_error = 0,'ok','FAULT') as thermocouple_state,
               if(alarms='0','none',alarms) as alarmstate
            from log as a inner join units as b on a.TankID = b.TankID
            where b.active = 1 order by CreatedOn desc limit $limit";
         $fridgeStatuses = array();
         $rows = $this->Dbase->ExecuteQuery($query);
         if($rows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
         foreach($rows as $row){
            if(!key_exists($row['TankID'], $fridgeStatuses)) $fridgeStatuses[$row['TankID']] = $row;
         }
         $count = count($fridgeStatuses);
         $i++;
      }

      return $fridgeStatuses;*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_ln2_freezers']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         $clean = array();
         foreach($data as $row){//solr ensures that we have the latest status for every tank. No need to check if tank duplicates exist
            $clean[$row['TankID']] = $row;
         }
         
         return $clean;
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Gets the status of the ancilliary systems
    *
    * @return  array    Returns an array of the status of the ancilliary systems
    */
   private function AncilliaryStatus(){
      //bulk tank status
      /*$query = "
         select
            if(DATE(timestamp) = DATE(NOW()), date_format(timestamp, '%H:%i'), date_format(timestamp, '%e %b  %H:%i')) as smart_date,
            ((unix_timestamp(now()) - unix_timestamp(timestamp))/3600)  as hours_old,
            format((analog0 * 0.05),1) as bar,
            format((analog1-analog0)/{$this->conversionFactor},0) as contents,
            format((analog1-analog0),2) as diff,
            format((O2),1) as O2,
            format((ambient),1) as ambient,
            if(switch=0,'open','closed') as switch_state,
            if(door=1,'open','closed') as door_state,
            if(fans_status = 1, 'running','stopped') as fans,
            if(LN2_plant > 0, 'running','stopped') as plant,
            if(vent_valve > 0, 'venting','closed') as vent_valve,
            if(vent_alarm > 0, 'alarm!','ok') as vent_alarm,
            if(fill_point < 0,'LN2 flowing', 'warm') as fill_point
         from pressure
         order by timestamp desc limit 1
     ";
      $ancilliaryStatus = $this->Dbase->ExecuteQuery($query);
      if($ancilliaryStatus == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));

      return $ancilliaryStatus[0];*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_ancillary']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         if(count($data) == 1){
            return $data[0];
         }
         else if(count($data) > 1) {
            $error = "More than one record found in the Solr server. Expected only one";
         }
         else {
            $error = "No record found in the Solr server";
         }
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Gets the statuses of the fridges and freezers that are in the system
    *
    * @return  array    Returns an array with current status of the fridges and freezers
    */
   private function FridgesAndFreezersStatuses(){
      //another terrfying SQL from Martin
      /*$query = "
         SELECT
            fl.freezer, fu.location, fu.description, fu.contents, FORMAT((fl.temp),1) AS temp, fu.max_temp, fu.min_temp,
            ((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(fl.created))/3600) AS hours_old,
            IF( DATE(fl.created) = DATE(NOW()), DATE_FORMAT(fl.created, '%H:%i'), DATE_FORMAT(fl.created, '%e %b  %H:%i')) AS smart_date
         FROM freezer_log fl
         JOIN freezer_units fu ON fl.freezer = fu.unitid
         JOIN(
            SELECT freezer, MAX(created) created FROM freezer_log GROUP BY freezer
            ) fl2 ON fl.freezer = fl2.freezer AND fl.created = fl2.created
         where fu.type = 'freezer' and fu.in_use = TRUE
         GROUP BY freezer
     ";

      $fridgeStatuses = array();
      $rows = $this->Dbase->ExecuteQuery($query);
      if($rows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      foreach($rows as $row) $fridgeStatuses[$row['freezer']] = $row;

      return $fridgeStatuses;*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_fridges']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         $clean = array();
         foreach($data as $row){//solr ensures that we have the latest status for every tank. No need to check if tank duplicates exist
            $clean[$row['freezer']] = $row;
         }
         
         return $clean;
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Get the statuses of the other equipments and rooms
    *
    * @return  array    Returns an array with the statuses of the other stuff
    */
   private function EquipmentAndRoomsStatuses(){
      //another terrfying SQL from Martin
      /*$query = "
         SELECT
            fl.freezer, fu.location, fu.description, fu.contents, FORMAT((fl.temp),1) AS temp, FORMAT((fl.O2),1) AS O2, FORMAT((fl.CO2),1) AS CO2, fu.max_temp, fu.min_temp,
            fu.max_co2, fu.min_co2, fu.max_o2, fu.min_o2, ((UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(fl.created))/3600) AS hours_old,
            if(date(fl.created) = date(NOW()), DATE_FORMAT(fl.created, '%H:%i'), DATE_FORMAT(fl.created, '%e %b  %H:%i')) AS smart_date
         FROM freezer_log fl
         JOIN freezer_units fu ON fl.freezer = fu.unitid
         JOIN (
            SELECT freezer, MAX(created) created FROM freezer_log GROUP BY freezer
            ) fl2 ON fl.freezer = fl2.freezer AND fl.created = fl2.created
         where fu.type = 'room' and fu.in_use = TRUE
         GROUP BY freezer
      ";

      $otherStatuses = array();
      $rows = $this->Dbase->ExecuteQuery($query);
      if($rows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      foreach($rows as $row) $otherStatuses[$row['freezer']] = $row;

      return $otherStatuses;*/
      
      $query = str_replace(" ", "+", Config::$config['solr_monitor_rooms']."/select?wt=json&q=*:*");
      
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $error="";
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $data = $raw["response"]["docs"];
         $clean = array();
         foreach($data as $row){//solr ensures that we have the latest status for every tank. No need to check if tank duplicates exist
            $clean[$row['freezer']] = $row;
         }
         
         return $clean;
      }
      else {
         $error = "HTTP Status response from the Solr server was ".$http_status;
      }
      
      die(json_encode(array('error' => true, 'data' => $error)));
   }

   /**
    * Get the status of the HPC and the email and sms monitoring
    *
    * @return  array    Returns an array with the statuses
    */
   private function OtherStates(){
      //HPC RAID status - are the disks in the hardware RAID ok?
      /*$query = "
         SELECT
            if(DATE(date) = DATE(NOW()), date_format(date, '%H:%i'), date_format(date, '%e %b  %H:%i')) AS smart_date,
            xml_data, ((unix_timestamp(now()) - unix_timestamp(date))/3600) AS hours_old
         FROM hpc ORDER BY date DESC LIMIT 1
     ";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $hpcStatus = $row[0];
      $xml = simplexml_load_string($hpcStatus['xml_data']);    //turn it into a SimpleXMLObject
      $hpcDiskCount = count($xml->xpath('//disk[status="Online"]'));*/
      $hpcDiskCount = 0;

      //email/sms monitoring status
      $query = "select time, success, date_format(NOW(), '%H:%i:%s') as servertime, time<DATE_SUB(NOW(), INTERVAL {$this->phoneHoursOld} HOUR) as old from phone_status order by time desc limit 1";
      $row = $this->Dbase->ExecuteQuery($query);
      if($row == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
      $emailSmsStatus = $row[0];

      return array('hpcDiskCount' => $hpcDiskCount, 'emailSmsStatus' => $emailSmsStatus);
   }

   /**
    * Performs a global search for the searched item in the database
    */
   private function SearchDatabase(){
      $start = $_GET['start'];
      $size = $_GET['size'];
      
      //search samples
      //clean the search query
      $rawQuery = preg_replace("/\s\s+/", " ", $_GET['q']);
      
      $strings = explode(" ", $rawQuery);
      $query = "";
      foreach($strings as $string){
         if(strlen($query) == 0){
            $query .= "(store_label:*".$string."*";
         }
         else {
            $query .= " AND (store_label:*".$string."*";
         }
         
         $query .= " OR origin:*".$string."*";
         $query .= " OR organism:*".$string."*";
         $query .= " OR box_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR project_name:*".$string."*";
         $query .= " OR sample_type:*".$string."*";
         $query .= " OR comments:*".$string."*)";
      }
      
      $fieldList = "";
      if($_GET['light'] == 1){
         $fieldList = "&fl=sample_id";//only get the sample id
      }
      
      $query = str_replace(" ", "+", Config::$config['solr_samples']."/select?wt=json&start=".$start."&rows=".$size.$fieldList."&q=".urlencode($query));//implement pagenation
      $this->Dbase->CreateLogEntry("Samples query = ".$query,"debug");
      $ch = curl_init();
      
      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);
      
      $numResults = 0;
      $samples = array();
      $error = false;
      $qTime = 0;
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $qTime = $raw['responseHeader']['QTime'];
         $samples = $raw["response"]["docs"];
         for($index = 0; $index < count($samples); $index++){
            $samples[$index]['collection'] = "samples";
            if(!isset($_GET['light']) && $_GET['light'] == 0)
            $samples[$index]['date_created'] = preg_replace("/T.*/", "", $samples[$index]['date_created']);
         }
         $numResults = $numResults + $raw["response"]['numFound'];
      }
      else {
         $error = true;
      }
      
      //search stabilates
      //clean the search query
      $rawQuery = preg_replace("/\s\s+/", " ", $_GET['q']);
      
      $size = $size - count($samples);
      $start = $start - $numResults;
      
      $strings = explode(" ", $rawQuery);
      $query = "";
      foreach($strings as $string){
         if(strlen($query) == 0){
            $query .= "(stab_no:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }
         else {
            $query .= " AND (stab_no:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }

         $query .= " OR isolation_date:*".$string."*";
         $query .= " OR isolation_method:*".$string."*";
         $query .= " OR infection_host:*".$string."*";
         $query .= " OR country_name:*".$string."*";
         $query .= " OR preservation_date:*".$string."*";
         $query .= " OR locality:*".$string."*";
         $query .= " OR preservation_method:*".$string."*";
         $query .= " OR parasite_name:*".$string."*";
         $query .= " OR strain_morphology:*".$string."*";
         $query .= " OR strain_pathogenicity:*".$string."*";
         $query .= " OR strain_infectivity:*".$string."*)";
      }

      if($start<0){//done to prevent errors on the solr side
         $start = 0;
         $size = 0;
      }
      $stabilates = array();
      
      $fieldList = "";
      if($_GET['light'] == 1){
         $fieldList = "&fl=stab_id";//only get the sample id
      }
      
      $query = str_replace(" ", "+", Config::$config['solr_stabilates']."/select?wt=json&start=".$start."&rows=".$size.$fieldList."&q=".urlencode($query));//implement pagenation
      $this->Dbase->CreateLogEntry("stabilates query = ".$query,"debug");
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $qTime = $qTime + $raw['responseHeader']['QTime'];
         $stabilates = $raw["response"]["docs"];
         for($index = 0; $index < count($stabilates); $index++){
            $stabilates[$index]['collection'] = "stabilates";
         }
         $numResults = $numResults + $raw["response"]['numFound'];
      }
      else {
         $error = true;
      }
      
      //search cell cultures
      //clean the search query
      $rawQuery = preg_replace("/\s\s+/", " ", $_GET['q']);
      
      $size = $size - count($stabilates);
      $start = $start - $numResults;
      
      $strings = explode(" ", $rawQuery);
      $query = "";
      foreach($strings as $string){
         if(strlen($query) == 0){
            $query .= "(culture_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }
         else {
            $query .= " AND (culture_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }

         $query .= " OR cell_type_details:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR animal_id:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR history:*".$string."*";
         $query .= " OR date_stored:*".$string."*";
         $query .= " OR growth_medium:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR storage_medium:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR reference_cultures:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR comments:*".$string."*)";
      }

      if($start<0){//done to prevent errors on the solr side
         $start = 0;
         $size = 0;
      }
      $cellCultures = array();
      
      $fieldList = "";
      if($_GET['light'] == 1){
         $fieldList = "&fl=stab_id";//only get the sample id
      }
      
      $query = str_replace(" ", "+", Config::$config['solr_cell_cultures']."/select?wt=json&start=".$start."&rows=".$size.$fieldList."&q=".urlencode($query));//implement pagenation
      $this->Dbase->CreateLogEntry("Cell cultures query = ".$query,"debug");
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $qTime = $qTime + $raw['responseHeader']['QTime'];
         $cellCultures = $raw["response"]["docs"];
         for($index = 0; $index < count($cellCultures); $index++){
            $cellCultures[$index]['collection'] = "cell_cultures";
         }
         $numResults = $numResults + $raw["response"]['numFound'];
      }
      else {
         $error = true;
      }
      
      //search tick stabilates
      //clean the search query
      $rawQuery = preg_replace("/\s\s+/", " ", $_GET['q']);
      
      $size = $size - count($cellCultures);
      $start = $start - $numResults;
      
      $strings = explode(" ", $rawQuery);
      $query = "";
      foreach($strings as $string){
         if(strlen($query) == 0){
            $query .= "(stabilate_no:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }
         else {
            $query .= " AND (stabilate_no:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         }

         $query .= " OR date_prepared:*".$string."*";
         $query .= " OR parasite:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR stock:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR material_frozen:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR source:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR origin:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR experiment_no:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR medium_used:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR cryoprotectant:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR colour:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR ticks_ground:*".$string."*";
         $query .= " OR mean_infect:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR infected_acin:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR remarks:*".$string."*";
         $query .= " OR testing_experiment:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR testing_date:*".$string."*";
         $query .= " OR parasite_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR material_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*";
         $query .= " OR species_name:*".preg_replace("/[^a-zA-Z0-9]/", "", $string)."*)";
      }

      if($start<0){//done to prevent errors on the solr side
         $start = 0;
         $size = 0;
      }
      $tickStabilates = array();
      
      $fieldList = "";
      if($_GET['light'] == 1){
         $fieldList = "&fl=stab_id";//only get the sample id
      }
      
      $query = str_replace(" ", "+", Config::$config['solr_tick_stabilates']."/select?wt=json&start=".$start."&rows=".$size.$fieldList."&q=".urlencode($query));//implement pagenation
      $this->Dbase->CreateLogEntry("Tick stabilates query = ".$query,"debug");
      $ch = curl_init();

      curl_setopt($ch, CURLOPT_URL, $query);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($ch);
      $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      curl_close($ch);

      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $qTime = $qTime + $raw['responseHeader']['QTime'];
         $tickStabilates = $raw["response"]["docs"];
         for($index = 0; $index < count($tickStabilates); $index++){
            $tickStabilates[$index]['collection'] = "tstabilates";
         }
         $numResults = $numResults + $raw["response"]['numFound'];
      }
      else {
         $error = true;
      }
      
      //we are all good. lets return this data
      $data = array_merge($samples, $stabilates, $cellCultures, $tickStabilates);
      die(json_encode(array('error' => $error, 'data' => $data, 'count' => $numResults, 'time' => $qTime), JSON_FORCE_OBJECT));
   }
   
   /**
    * This function gets organism graph data from Solr
    */
   private function getOrganismData() {
      //"http://192.168.5.43:8080/solr/samples/select?q=open_access%3A0&wt=json&indent=true&group=true&group.field=organism";
      //$openAccessQuery = str_replace(" ", "+", Config::$config['solr_samples']."/select?q=!organism%3Acow AND open_access%3A1&wt=json&indent=true&group=true&group.field=organism");//open access samples grouped by organism
      $openAccessQuery = str_replace(" ", "+", Config::$config['solr_samples']."/select?q=open_access%3A1&wt=json&indent=true&group=true&group.field=organism");//open access samples grouped by organism
      //$closedAccessQuery = str_replace(" ", "+", Config::$config['solr_samples']."/select?q=!organism%3Acow AND open_access%3A0&wt=json&indent=true&group=true&group.field=organism");//closed access samples group by organism
      $closedAccessQuery = str_replace(" ", "+", Config::$config['solr_samples']."/select?q=open_access%3A0&wt=json&indent=true&group=true&group.field=organism");//closed access samples group by organism
      $organisms = array();
      //fetch the open access samples
      $oaCH = curl_init();
      curl_setopt($oaCH, CURLOPT_URL, $openAccessQuery);
      curl_setopt($oaCH, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($oaCH, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult = curl_exec($oaCH);
      $http_status = curl_getinfo($oaCH, CURLINFO_HTTP_CODE);
      curl_close($oaCH);
      $error = false;
      if($http_status == 200){
         $raw = json_decode($curlResult, true);
         $organismGroups = $raw['grouped']['organism']['groups'];
         foreach($organismGroups as $currGroup) {
            $organism = $currGroup['groupValue'];
            if(strlen($organism) == 0) $organism = "unknown";
            if(!isset($organisms[$organism])) {
               $organisms[$organism] = array(
                  "open_access" => 0,
                  "closed_access" => 0
               );
            }
            $organisms[$organism]['open_access'] = $currGroup['doclist']['numFound'];
         }
      }
      else {
         $this->Dbase->CreateLogEntry("An error occurred while trying to get organism details from solr for open access samples","fatal");
         $error = true;
      }
      
      //fetch the closed access samples
      $caCH = curl_init();
      curl_setopt($caCH, CURLOPT_URL, $closedAccessQuery);
      curl_setopt($caCH, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($caCH, CURLOPT_USERAGENT, "Codular Sample cURL Request");
      $curlResult2 = curl_exec($caCH);
      $http_status2 = curl_getinfo($caCH, CURLINFO_HTTP_CODE);
      curl_close($caCH);
      if($http_status2 == 200){
         $raw = json_decode($curlResult2, true);
         $organismGroups = $raw['grouped']['organism']['groups'];
         foreach($organismGroups as $currGroup) {
            $organism = $currGroup['groupValue'];
            if(strlen($organism) == 0) $organism = "unknown";
            if(!isset($organisms[$organism])) {
               $organisms[$organism] = array(
                  "open_access" => 0,
                  "closed_access" => 0
               );
            }
            $organisms[$organism]['closed_access'] = $currGroup['doclist']['numFound'];
         }
      }
      else {
         $this->Dbase->CreateLogEntry("An error occurred while trying to get organism details from solr for closed access samples","fatal");
         $error = true;
      }
      
      $organismKeys = array_keys($organisms);
      $data = array();
      foreach($organismKeys as $currKey) {
         $data[] = array("organism" => $currKey, "open_access" => $organisms[$currKey]['open_access'], "closed_access" => $organisms[$currKey]['closed_access']);
      }
      function sortByOpenAccess($a, $b) {
         return ($a['open_access'] + $a['closed_access']) - ($b['open_access'] + $b['closed_access']);
      }
      usort($data, 'sortByOpenAccess');
      $data1 = array();
      $data2 = array();
      foreach($data as $currOrganism) {
         if(($currOrganism['open_access'] + $currOrganism['closed_access']) > 3000) {
            $data2[] = $currOrganism;
         }
         else {
            $data1[] = $currOrganism;
         }
      }
      if($_GET['populous'] == 0) {
         $data = $data1;
      }
      else {
         $data = $data2;
      }
      die(json_encode(array('error' => $error, 'data' => $data)));
   }

   /**
    * Fetches the sample details
    */
   private function SampleDetails(){
      //get the sample id
      preg_match('/(.+)_([0-9]{1,8})/', $_GET['id'], $ids);
      if(!is_numeric($ids[2])) die(json_encode(array('error' => true, 'data' => 'System Error! Please contact the system administrator.')));

      if($ids[1] == 'azizi'){
         //build query to fetch azizi data
         $database = Config::$aziziDb;
         $query = "select a.comments, a.open_access, a.label, a.date_created, b.sample_type_name as sample_type, c.value as Project, a.open_access, d.box_name, e.org_name"
                 . " from $database.samples as a"
                 . " left join $database.sample_types_def as b on a.sample_type = b.count"
                 . " left join $database.modules_custom_values as c on a.Project = c.val_id"
                 . " left join $database.boxes_def as d on a.box_id = d.box_id"
                 . " left join $database.organisms as e on a.org = e.org_id"
                 . " where a.count = :id";
         $this->Dbase->CreateLogEntry($query,"debug");
         $res = $this->Dbase->ExecuteQuery($query, array('id' => $ids[2]));
         if($res == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));

         //we are all good. lets return this data
         $res[0]['collection'] = 'azizi';
         if($res[0]['open_access'] == 0){
            $res[0]['comments'] = "Extra details hidden";
         } 
            
         die(json_encode(array('error' => false, 'data' => $res[0]), JSON_NUMERIC_CHECK));
         //else die(json_encode(array('error' => false, 'data' => array('collection' => 'azizi', 'comments' => 'Other details hidden'))));
      }
      elseif($ids[1] == 'stabilates'){
         //build query to fetch stabilate data
         $database = Config::$stabilatesDb;
         $query = "SELECT a.`id`, a.`stab_no`, a.`locality`, a.`isolation_date`, a.`preservation_date`, a.`number_frozen`, a.`strain_count`,".
           " a.`strain_morphology`, a.`strain_infectivity`, a.`strain_pathogenicity`, a.`preserved_type`, a.`stabilate_comments`, b.`host_name`,".
           " c.`parasite_name`, d.`method_name` AS  `isolation_method`, e.`method_name` AS  `preservation_method`, f.`host_name` AS `infection_host`,".
           " g.`user_names`, h.`country_name`".
           " FROM $database.`stabilates` AS a".
             " INNER JOIN $database.`hosts` AS b ON a.host = b.id".
             " INNER JOIN $database.`parasites` AS c ON a.`parasite_id` = c.id".
             " INNER JOIN $database.`isolation_methods` AS d ON a.`isolation_method` = d.id".
             " INNER JOIN $database.`preservation_methods` AS e ON a.`freezing_method` = e.id".
             " INNER JOIN $database.`infection_host` AS f ON a.`infection_host` = f.id".
             " INNER JOIN $database.`users` AS g ON a.`frozen_by` = g.id".
             " INNER JOIN $database.`origin_countries` AS h ON a.country = h.id".
           " WHERE a.id = :id";

         $res = array(); //object carrying what is returned to javascript

         //fetch result from query just created
         $fetchedRows = $this->Dbase->ExecuteQuery($query, array('id' => $ids[2]));
         if($fetchedRows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));

         //initialize the stabilate entry in res to the first result from query. there should be only one result anyways
         $res['stabilate'] = $fetchedRows[0];

         //build query to fetch passages data
         $query = "SELECT a.`passage_no`, a.`inoculum_ref`, a.`infection_duration`, a.`number_of_species`, a.`radiation_freq`, a.`radiation_date`,".
           " a.`added_by`, b.`inoculum_name`, c.`species_name`".
         " FROM $database.`passages` AS a".
           " INNER JOIN $database.`inoculum` AS b ON a.`inoculum_type` = b.`id`".
           " INNER JOIN $database.`infected_species` AS c ON a.`infected_species` = c.`id`".
         " WHERE a.`stabilate_ref` = :id";

         //fetch result from the query
         $fetchedRows = $this->Dbase->ExecuteQuery($query, array('id' => $ids[2]));
         if($fetchedRows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));

         //initialize the passages entry to the rows fetched from the last query
         $res['passages'] = $fetchedRows;
         $res['collection'] = 'stabilates';
         die(json_encode(array('error' => false, 'data' => $res), JSON_NUMERIC_CHECK));
      }
      else if($ids[1] == 'cculture') {
         $database = Config::$stabilatesDb;
         $query = "select culture_name, cell_type_details, animal_id, history, date_stored, no_vials, growth_medium, storage_medium, reference_cultures, comments"
               . " from $database.cultures"
               . " where id = :id";
         $fetchedRows = $this->Dbase->ExecuteQuery($query, array("id" => $ids[2]));
         
         if($fetchedRows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
         //we are all good. lets return this data
         $fetchedRows[0]['collection'] = 'cell_cultures';
         
         die(json_encode(array('error' => false, 'data' => $fetchedRows[0]), JSON_NUMERIC_CHECK));
      }
      else if($ids[1] == 'tstabilates') {
         $database = Config::$stabilatesDb;
         $query = "select a.stabilate_no, a.date_prepared, a.parasite, a.stock, a.material_frozen, a.source, a.origin, a.experiment_no, a.medium_used, cryoprotectant, a.colour, a.ticks_ground, a.mean_infect, a.infected_acin, a.remarks, a.testing_experiment, a.testing_date, a.vol_prepared, a.no_stored,
                     b.parasite_name, 
                     c.material_name,
                     d.species_name
                     from $database.tick_stabilates as a
                     left join $database.tick_parasites as b on a.parasite_id = b.id
                     left join $database.tick_frozen_material as c on a.frozen_material_id = c.id
                     left join $database.tick_species as d on a.source_species_id = d.id
                     where a.id = :id";
         $fetchedRows = $this->Dbase->ExecuteQuery($query, array("id" => $ids[2]));
         
         if($fetchedRows == 1) die(json_encode(array('error' => true, 'data' => $this->Dbase->lastError)));
         //we are all good. lets return this data
         $fetchedRows[0]['collection'] = 'tstabilates';
         
         die(json_encode(array('error' => false, 'data' => $fetchedRows[0]), JSON_NUMERIC_CHECK));
      }
   }

   /**
    * Get the narrow history of this stabilate up to the earliest grandfather
    */
   private function StabilateHistory($die = true){
      $stabilateId = $_POST['stabilate_id'];
      $history = array();
      $query = 'select id, stab_no from '. Config::$config['stabilates_db'] .'.stabilates where id = :stab';
      $res = $this->Dbase->ExecuteQuery($query, array('stab' => $stabilateId));
      if($res == 1) die('Error');
      $history[] = array('start_id' => $res[0]['id'], 'starting_stabilate' => $res[0]['stab_no']);

      while(1){
         $passes = $this->StabilateParent($stabilateId);
         if(!$passes || count($passes) == 0) break;
         else{
            //get the stabilate id of the parent(i.e. the returned stabilate)... we assume that this stabilate is in the db
            $query = 'select id from '. Config::$config['stabilates_db'] .'.stabilates where stab_no = :stab';
            $res = $this->Dbase->ExecuteQuery($query, array('stab' => $passes['parent_stab']));
            if($res == 1) die('Error');
            if(count($res) == 1){
               $history[] = array('stab_no' => $passes['parent_stab'], 'passage_count' => $passes['count'], 'stab_id' => $res[0]['id'], 'parent_stab_id' => $stabilateId);
               //now the current stabilate becomes the child... we now continue to look for its parent!
               $stabilateId = $res[0]['id'];
            }
            else if(count($res) > 1) $this->Dbase->CreateLogEntry("Error! We have multiple instances of the stabilate '{$passes['parent_stab']}'.", 'fatal');
            else if(count($res) == 0){
               $history[] = array('stab_no' => $passes['parent_stab'], 'passage_count' => $passes['count'], 'stab_id' => NULL, 'parent_stab_id' => $stabilateId);
               $this->Dbase->CreateLogEntry("The stabilate '{$passes['parent_stab']}' is not appearing in the list of stabilates, yet it is referenced as a parent stabilate in the passages table.", 'fatal');
            }
            if(count($res) > 1 || count($res) == 0) break;     //if we encounter an error or an unfavourable situation... break
         }
      }
      if($die) die(json_encode(array('error' => false, 'data' => $history)));
      else return $history;
   }

   /**
    * Gets the parent stabilate of the current stabilate
    *
    * @param   integer  $stabilateId   The id of the current, of which we are interested in the parent stabilate
    * @return  array    Returns an array with the parent stabilate name and the number of passages for this stabilate
    */
   private function StabilateParent($stabilateId){
      $query = 'select passage_no, inoculum_ref from '. Config::$config['stabilates_db'] .'.passages where stabilate_ref = :stab_id order by passage_no';
      $res = $this->Dbase->ExecuteQuery($query, array('stab_id' => $stabilateId));
      if($res == 1) return die('Error');
      elseif(count($res) == 0) return array();

      $passages = array('stab_id' => $stabilateId);
      foreach($res as $t){
         if($t['passage_no'] == 1) $passages['parent_stab'] = $t['inoculum_ref'];
      }
      $passages['count'] = count($res);

      return $passages;
   }
}
?>
