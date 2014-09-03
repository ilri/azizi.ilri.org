<?php

/* 
 * This module handles all the relevant LITS modules including:
 *    - fetching form ids
 *    - getting columns for a set of forms (versions of one form)
 *    - getting data from a set of forms
 */
class LITS {
   
   private $Dbase;
   
   public function __construct() {
      require_once 'repository_config';
      
      require_once OPTIONS_COMMON_FOLDER_PATH . 'dbmodules/mod_objectbased_dbase_v1.0.php';
      require_once OPTIONS_COMMON_FOLDER_PATH . 'mod_general_v0.6.php';

      $this->Dbase = new DBase('mysql');
      $this->Dbase->InitializeConnection();

      if($this->Dbase->dbcon->connect_error || (isset($this->Dbase->dbcon->errno) && $this->Dbase->dbcon->errno!=0)) {
         die('Something wicked happened when connecting to the dbase.');
      }

      //Config::$logSettings['workingDir'] = "../";
      $this->Dbase->InitializeLogs();
      
      //Config::$config['user'] = Config::$config['ro_user']; Config::$config['pass'] = Config::$config['ro_pass'];
      Config::$config['dbase'] = Config::$config['odk_db'];
      
      $this->Dbase->InitializeConnection();
      
      define(OPTIONS_REQUESTED_SUB_MODULE, $_GET['do']);
      define(OPTIONS_REQUESTED_ACTION, $_GET['action']);
   }
   
   public function trafficController() {
      if(OPTIONS_REQUESTED_SUB_MODULE == 'ajax'){
         if(OPTIONS_REQUESTED_ACTION == 'get_avail_forms') {
            $this->getAllFormIDs();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'get_form_schemas') {
            $this->getFormSchemas();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'get_form_data'){
            $this->getFormData();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'get_animal_data'){
            $this->getAnimalData();
         }
      }
   }
   
   private function getAllFormIDs() {
      $query = "SELECT FORM_ID AS form_id FROM ".Config::$config['odk_db']."._form_info ORDER BY FORM_ID";
      $formIDs = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if(is_array($formIDs)){
         $data['forms'] = $formIDs;
         $data['error'] = 0;
         $data['error_message'] = "";
      }
      else {
         $data['forms'] = array();
         $data['error'] = 1;
         $data['error_message'] = $this->Dbase->lastError;
      }
      
      echo json_encode($data);
   }
   
   private function getFormSchemas() {
      $formIDs = $_POST['forms'];
      
      $schemas = array();
      foreach ($formIDs as $currFormID){
         $query = "SHOW TABLES LIKE '$currFormID%'";
         
         $this->Dbase->CreateLogEntry($query, "fatal");
         
         $tables = $this->Dbase->ExecuteQuery($query);
         
         $formSchema = array();
         if(is_array($tables)) {
            foreach ($tables as $currTable){
               $tmpTName = array_values($currTable);
               $tName = $tmpTName[0];
               
               $formSchema[$tName] = array();
               
               $query = "DESC ".$tName;
               $tFields = $this->Dbase->ExecuteQuery($query);
               foreach($tFields as $currField) {
                  if(substr($currField['Field'], 0, 1) != "_"){
                     array_push($formSchema[$tName], array("field" => $currField['Field'], "type" => $currField['Type']));
                  }
               }
            }
         }
         
         $schemas[$currFormID] = $formSchema;
      }
      
      $data = array();
      if(count($schemas) == 0){
         $data['error'] = 1;
         $data['schemas'] = array();
      }
      else {
         $data['error'] = 0;
         $data['schemas'] = $schemas;
      }
      
      echo json_encode($data);
   }
   
   private function getFormData() {
      $forms = $_POST['forms'];
      
      //$this->Dbase->CreateLogEntry(print_r($_POST['forms']), "fatal");
      /*
       *    forms[formID].ids[idIndex] - where in SQL the nth id used is stored in form m
       *                 .longitude    - where in SQL the longitude is stored in form m
       *                 .latitude     - where in SQL the latitude is stored in form m
       *                 .time         - where in SQL the time is stored in form m
       *                 .locality     - where in SQL the locality (name of area) is stored in form m
       */
      
      $data = array();
      
      $formIndex = 0;
      $formNames = array_keys($forms);
      foreach($forms as $currForm){
         $latColumn = "";
         $lonColumn = "";
         $timeColumn = "";
         $localityColumn = "";
         
         //construct a query for each of the forms
         $tables = array();//array storing the tables, inside each of the tables there will be the columns
         
         //get the table names for all the ids
         $ids = $currForm['ids'];
         foreach($ids as $currID){
            $idParts = explode("*", $currID);
            if(count($idParts) == 3){//should have three parts: form, table name, column name
               if(!isset($tables[$idParts[1]])){
                  $tables[$idParts[1]] = array();
               }
               
               array_push($tables[$idParts[1]], $idParts[2]);
            }
         }
         
         //get the table for longitude, latitude, time and locality
         $latParts = explode("*", $currForm['latitude']);
         if(count($latParts) == 3){
            if(!isset($tables[$latParts[1]])){
               $tables[$latParts[1]] = array();
            }
            
            array_push($tables[$latParts[1]], $latParts[2]);
            $latColumn = $latParts[1].".".$latParts[2];
         }
         
         $lonParts = explode("*", $currForm['longitude']);
         if(count($lonParts) == 3){
            if(!isset($tables[$lonParts[1]])){
               $tables[$lonParts[1]] = array();
            }
            
            array_push($tables[$lonParts[1]], $lonParts[2]);
            $lonColumn = $lonParts[1].".".$lonParts[2];
         }
         
         $timeParts = explode("*", $currForm['time']);
         if(count($timeParts) == 3){
            if(!isset($tables[$timeParts[1]])){
               $tables[$timeParts[1]] = array();
            }
            
            array_push($tables[$timeParts[1]], $timeParts[2]);
            $timeColumn = $timeParts[1].".".$timeParts[2];
         }
         
         $locParts = explode("*", $currForm['locality']);
         if(count($locParts) == 3){
            if(!isset($tables[$locParts[1]])){
               $tables[$locParts[1]] = array();
            }
            
            array_push($tables[$locParts[1]], $locParts[2]);
            $localityColumn = $locParts[1].".".$locParts[2];
         }
         
         //$this->Dbase->CreateLogEntry(print_r($tables, true), "fatal");
         
         //create the query
         
         $from = "";
         
         $tableNames = array_keys($tables);
         
         //search for the table with _core[0-9]* suffix
         $coreTableIndex = -1;
         for($tableIndex = 0; $tableIndex < count($tableNames); $tableIndex++){
            if(preg_match("/.*_core[0-9]*/i", $tableNames[$tableIndex]) === 1){
               $this->Dbase->CreateLogEntry("Core table is ".$tableNames[$tableIndex], "fatal");
               
               if($coreTableIndex != -1){//means that there is another core table. Logic for multiple core tables not added yet. Kill this 
                  $coreTableIndex = -1;
                  $this->Dbase->CreateLogEntry("User requesting data from multiple core tables. Kill this", "fatal");
                  break;
               }
               $coreTableIndex = $tableIndex;
            }
         }
         
         //start generating from section of query by starting with the core table
         if($coreTableIndex != -1){
            $from = "FROM ".$tableNames[$coreTableIndex];
         }
         
         //Add all the other tables to the from string
         for($tableIndex = 0; $tableIndex < count($tableNames); $tableIndex++){
            if($tableIndex != $coreTableIndex){
               if(strlen($from) == 0){//might mean that we are not fetching data from a core table
                  $from = "FROM ".$tableNames[$tableIndex];
               }
               else{
                  //if we dont have a core table, inner join with the first table (ie $tableNames[0])
                  if($coreTableIndex == -1){
                     $from .= " INNER JOIN ".$tableNames[$tableIndex]." ON ".$tableNames[0]."._PARENT_AURI = ".$tableNames[$tableIndex]."._PARENT_AURI";
                  }
                  else {//we have a core table, join using that table
                     $from .= " INNER JOIN ".$tableNames[$tableIndex]." ON ".$tableNames[$coreTableIndex]."._URI = ".$tableNames[$tableIndex]."._PARENT_AURI";
                  }
               }
            }
         }
         
         //generate the select portion of the query
         $select = "";
         for($tableIndex = 0; $tableIndex < count($tableNames); $tableIndex++){
            foreach($tables[$tableNames[$tableIndex]] as $currColumn){
               if(strlen($select) == 0){
                  $select = "SELECT ".$tableNames[$tableIndex].".".$currColumn;
               }
               else {
                  $select .= ", ".$tableNames[$tableIndex].".".$currColumn;
               }
               
               if($tableNames[$tableIndex].".".$currColumn == $latColumn){
                  $select .= " AS latitude";
               }
               else if($tableNames[$tableIndex].".".$currColumn == $lonColumn){
                  $select .= " AS longitude";
               }
               else if($tableNames[$tableIndex].".".$currColumn == $timeColumn){
                  $select .= " AS time";
               }
               else if($tableNames[$tableIndex].".".$currColumn == $localityColumn){
                  $select .= " AS locality";
               }
               else{
                  $select .= " AS `".$formNames[$formIndex]."*".$tableNames[$tableIndex]."*".$currColumn."`";
               }
            }
         }
         
         $query = $select . " " . $from;
         
         $this->Dbase->CreateLogEntry("Query is ".$query, 'fatal');
         
         $formData = $this->Dbase->ExecuteQuery($query);
         if($formData === 1) $formData = array();
         
         $data[$formNames[$formIndex]] = $formData;
         
         $formIndex++;
      }
      
      $returnData = array();
      $returnData['error'] = 0;
      $returnData['data'] = $data;
      
      echo json_encode($returnData);
   }
   
   private function getAnimalData(){
      $data = $_POST['data'];
      $forms = $_POST['forms'];
      
      //$this->Dbase->CreateLogEntry(print_r($data, true), "fatal");
      //$this->Dbase->CreateLogEntry(print_r($forms, true), "fatal");
      
      $animalDetails = array();
      
      //construct a query using the animal's ids
      foreach($forms as $currForm){
         //get ids from the current form
         //$this->Dbase->CreateLogEntry("current form ", "fatal");
         //$this->Dbase->CreateLogEntry(print_r($currForm, true), "fatal");
         $ids = $currForm['ids'];
         
         //make sure that all the ids come from the same table
         $tables = array();
         for($idIndex = 0; $idIndex < count($ids); $idIndex++){
            $idParts = explode("*", $ids[$idIndex]);
            
            if(!isset($tables[$idParts[1]])) {
               $tables[$idParts[1]] = array();
            }
            array_push($tables[$idParts[1]], $idParts[2]);
         }
         
         if(count($tables) === 1){
            $this->Dbase->CreateLogEntry(print_r($tables, true), "fatal");
            $tableNames = array_keys($tables);
            $this->Dbase->CreateLogEntry(print_r($tableNames, true), "fatal");
            $tableName = $tableNames[0];
            
            $query = "SELECT * FROM ".$tableName;
            
            $where = "";
            $columnIndex = 0;
            foreach($tables[$tableName] as $currColumn){
               $this->Dbase->CreateLogEntry("column index = ".$columnIndex, "fatal");
               $this->Dbase->CreateLogEntry("data = ".$data, "fatal");
               if(strlen($where) == 0){
                  if($data['ids'][$columnIndex] == 'null' || $data['ids'][$columnIndex] == null){
                     $where = " WHERE " . $currColumn . " is null";
                  }
                  else{
                     $where = " WHERE " . $currColumn . "='".$data['ids'][$columnIndex]."'";
                  }
               }
               else {
                  if($data['ids'][$columnIndex] == 'null' || $data['ids'][$columnIndex] == null){
                     $where .= " AND " . $currColumn . " is null";
                  }
                  else{
                     $where .= " AND " . $currColumn . "='".$data['ids'][$columnIndex]."'";
                  }
               }
               
               $columnIndex++;
            }
            
            $query .= $where;
            
            $currFormAnimalData = $this->Dbase->ExecuteQuery($query);
            
            $animalDetails[$idParts[0]] = $currFormAnimalData;
         }
      }
      
      $data = array();
      $data['error'] = 0;
      $data['data'] = $animalDetails;
      
      echo json_encode($data);
   }
}


define(OPTIONS_COMMON_FOLDER_PATH, "../../common/");
if(isset($_GET['do'])) {
   $lits = new LITS();
   $lits->trafficController();
}
else {
   echo "<script type='text/javascript' src='".OPTIONS_COMMON_FOLDER_PATH."jquery/jquery-1.8.3.min.js' /></script>";
?>
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>ILRI LITS</title>
      <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
      <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
      <script src="../js/lits.js"></script>
      <link href="../css/azizi.css" rel="stylesheet" type="text/css" />
      <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css' />
   </head>
   <body>
      <input id="search_box_3d" placeholder="Search using an animal's ID" style="display: none;" />
      <div id="lits_search_res"></div>
      <div id="animal_details"></div>
      <div id="map"></div>
      <div id="mvmt_timeline"></div>
      <div id='set_select_container'>
         <div id='set_select_inst'>Select the ODK forms that will make up your dataset</div>
         <div id='set_select_list'></div>
         <button id="set_select_btn" type="submit">Okay</button>
      </div>
      <div id="set_mod_container">
         <div id="set_mod_name"></div>
         <div id="set_mod_ids">
            <div id="set_mod_id_label">Identification</div>
            <ul id="set_mod_id_list"></ul>
            <button id="set_mod_id_btn" type="submit">Add ID type</button>
         </div>
         <div id="set_mod_locality">
            <div id="set_mod_locality_label">Locality</div>
            <div id="set_mod_locality_value" style="cursor: pointer;">Not set</div>
         </div>
         <div id="set_mod_loc">
            <div id="set_mod_loc_label">GPS Coordinates</div>
            <div id="set_mod_loc_lat" style="cursor: pointer;">Latitude: Not set</div>
            <div id="set_mod_loc_lon" style="cursor: pointer;">Longitude: Not set</div>
         </div>
         <div id="set_mod_time">
            <div id="set_mod_time_label">Time</div>
            <div id="set_mod_time_value" style="cursor: pointer;">Not set</div>
         </div>
         <button id="set_mod_btn" type="submit">Track</button>
      </div>
      <div id="id_mod_container">
         <input id="id_mod_name" type="text" placeholder="Give the ID a name e.g Ear Tag" />
         <input id="id_mod_index" type="hidden" />
         <div id="id_mod_selections">
            
         </div>
         <button id="id_mod_cancel_btn" type="submit">Cancel</button>
         <button id="id_mod_add_btn" type="submit">Add</button>
      </div>
      
      <div id="gen_mod_container">
         <div id="gen_mod_name"></div>
         <input id="gen_mod_mode" type="hidden" />
         <div id="gen_mod_selections">
         </div>
         <button id="gen_mod_cancel_btn" type="submit">Cancel</button>
         <button id="gen_mod_add_btn" type="submit">Set</button>
      </div>
      
      <div id="mvmt_ttip"></div>
      <div id="loading_box">Loading</div>
      <script>
         var lits = new LITS();
      </script>
   </body>
</html>
<?php
}
?>

