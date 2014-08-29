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
      <div id="map"></div>
      <div id='set_select_container'>
         <div id='set_select_inst'>Select the ODK forms that will make up your next dataset</div>
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
         <div id="set_mod_loc">
            <div id="set_mod_loc_label">Location</div>
            <div id="set_mod_loc_lat">Not set</div>
            <div id="set_mod_loc_lon">Not set</div>
         </div>
         <div id="set_mod_time">
            <div id="set_mod_time_label">Time</div>
            <div id="set_mod_time_value">Not set</div>
         </div>
      </div>
      <div id="id_mod_container">
         <input id="id_mod_name" type="text" placeholder="Give the ID a name e.g Ear Tag" />
         <input id="id_mod_index" type="hidden" />
         <div id="id_mod_selections">
            
         </div>
         <button id="id_mod_cancel_btn" type="submit">Cancel</button>
         <button id="id_mod_add_btn" type="submit">Add</button>
      </div>
      <script>
         var lits = new LITS();
      </script>
   </body>
</html>
<?php
}
?>

