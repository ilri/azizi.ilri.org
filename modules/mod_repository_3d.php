<?php

/**
 * Class responsible for the Repository 3D module
 *
 * @category   Azizi
 * @package    Repository 3D
 * @author     Jason Rogena <j.rogena@cgiar.org>
 * @since      v0.1
 */
class Repository3D{

   public $Dbase;
   public function __construct() {
   }

   public function TrafficController() {
      require_once 'repository_config';
      
      define(OPTIONS_COMMON_FOLDER_PATH, '../../common/');
      require_once OPTIONS_COMMON_FOLDER_PATH . 'dbmodules/mod_objectbased_dbase_v1.0.php';
      require_once OPTIONS_COMMON_FOLDER_PATH . 'mod_general_v0.6.php';

      $this->Dbase = new DBase('mysql');
      $this->Dbase->InitializeConnection();

      if($this->Dbase->dbcon->connect_error || (isset($this->Dbase->dbcon->errno) && $this->Dbase->dbcon->errno!=0)) {

         die('Something wicked happened when connecting to the dbase.');
      }

      $this->Dbase->InitializeLogs();
      
      Config::$config['user'] = Config::$config['rw_user']; Config::$config['pass'] = Config::$config['rw_pass'];
      
      $this->Dbase->InitializeConnection();
      
      define(OPTIONS_REQUESTED_SUB_MODULE, $_GET['do']);
      define(OPTIONS_REQUESTED_ACTION, $_GET['action']);

      if (OPTIONS_REQUESTED_SUB_MODULE == '') $this->HomePage();
      else if (OPTIONS_REQUESTED_SUB_MODULE == 'ajax' && OPTIONS_REQUESTED_ACTION == 'get_box_keepers') $this->getBoxKeepers();
      else if (OPTIONS_REQUESTED_SUB_MODULE == 'ajax' && OPTIONS_REQUESTED_ACTION == 'get_box_samples') $this->getBoxSamples();
      else if (OPTIONS_REQUESTED_SUB_MODULE == 'ajax' && OPTIONS_REQUESTED_ACTION == 'get_tank_details') $this->getTankDetails();
   }

   /**
    * Creates the home page to the parser function
    */
   /*private function HomePage() {
?>
<div id="repo_container" ></div>
<div id="reset_button">Reset</div>
<input id="search_box_3d" placeholder="Search" />
<div id="search_canvas" style="display: none;"></div>
<div id="virt_box" style="display: none;"></div>
<div id="stats_box" style="display: none;"></div>
<div id="sample_ttip" style="display: none;"></div>
<script>
   var repository3D = new Repository3D();
</script>
         <?php
   }*/
   
   private function getBoxKeepers(){
      $query = "SELECT * FROM ".Config::$config['azizi_db'].".contacts";
      
      $results = $this->Dbase->ExecuteQuery($query);
      
      echo json_encode($results);
   }
   
   private function getBoxSamples(){
      $query = "SELECT a.*,b.sample_type_name,c.org_name FROM ".Config::$config['azizi_db'].".samples AS a LEFT JOIN ".Config::$config['azizi_db'].".sample_types_def AS b ON a.sample_type = b.count LEFT JOIN " .Config::$config['azizi_db']. ".organisms AS c ON a.org = c.org_id WHERE a.box_id = :box_id";
      $results = $this->Dbase->ExecuteQuery($query, array("box_id" => $_POST['box_id']));
      
      echo json_encode($results);
   }
   
   private function getTankDetails() {
      //construct project lookup
      $query = "SELECT a.box_id, b.value FROM " . Config::$config['azizi_db'] . ".samples AS a INNER JOIN " .Config::$config['azizi_db']. ".modules_custom_values AS b ON a.Project = b.val_id GROUP BY a.box_id, a.Project";
      $projectLookupTmp = $this->Dbase->ExecuteQuery($query);
      if( $projectLookupTmp == 1){
         $projectLookupTmp = array();
      }
      
      $projectLookup = array();
      for($index = 0; $index < count($projectLookupTmp); $index++){
         if(!isset($projectLookup[$projectLookupTmp[$index]['box_id']])) {
            $projectLookup[$projectLookupTmp[$index]['box_id']] = array();
         }
         
         array_push($projectLookup[$projectLookupTmp[$index]['box_id']], $projectLookupTmp[$index]['value']);
      }
      
      
      //construct organism lookup
      $query = "SELECT a.box_id, b.org_name FROM " . Config::$config['azizi_db'] . ".samples AS a INNER JOIN " . Config::$config['azizi_db'] . ".organisms AS b ON a.org = b.org_id GROUP BY a.box_id, a.org";
      $organismLookupTmp = $this->Dbase->ExecuteQuery($query);
      if($organismLookupTmp == 1) {
         $organismLookupTmp = array();
      }
      
      $organismLookup = array();
      for($index = 0; $index < count($organismLookupTmp); $index++){
         if(!isset($organismLookup[$organismLookupTmp[$index]['box_id']])){
            $organismLookup[$organismLookupTmp[$index]['box_id']] = array();
         }
         
         array_push($organismLookup[$organismLookupTmp[$index]['box_id']], $organismLookupTmp[$index]['org_name']);
      }
      
      //construct sample type lookup
      $query = "SELECT a.box_id, b.sample_type_name FROM " . Config::$config['azizi_db'] . ".samples AS a INNER JOIN "  . Config::$config['azizi_db'] . ".sample_types_def AS b ON a.sample_type = b.count GROUP BY a.box_id, a.sample_type";
      $sampleTypeLookupTmp = $this->Dbase->ExecuteQuery($query);
      if($sampleTypeLookupTmp == 1){
         $sampleTypeLookupTmp = array();
      }
      
      $sampleTypeLookup = array();
      for($index = 0; $index < count($sampleTypeLookupTmp); $index++){
         if(!isset($sampleTypeLookup[$sampleTypeLookupTmp[$index]['box_id']])) {
            $sampleTypeLookup[$sampleTypeLookupTmp[$index]['box_id']] = array();
         }
         
         array_push($sampleTypeLookup[$sampleTypeLookupTmp[$index]['box_id']], $sampleTypeLookupTmp[$index]['sample_type_name']);
      }
      
      //get tank details from azizi_lims
      $query = "SELECT b.id, b.name" .
              " FROM " . Config::$config['dbase'] . ".lcmod_storage_facilities AS a" .
              " INNER JOIN " . Config::$config['azizi_db'] . ".storage_facilities  AS b ON a.id = b.id" .
              " WHERE a.is_tank = 1";
      $result = $this->Dbase->ExecuteQuery($query);
      for ($tankIndex = 0; $tankIndex < count($result); $tankIndex++) {
         $result[$tankIndex]['sectors'] = array();
         $query = "SELECT id, facility, racks_nbr, rack_pos, facility_id FROM " . Config::$config['azizi_db'] . ".boxes_local_def WHERE facility_id = " . $result[$tankIndex]['id'];
         $tempResult = $this->Dbase->ExecuteQuery($query);
         if ($tempResult !== 1) {
            $result[$tankIndex]['sectors'] = $tempResult;
            for ($sectorIndex = 0; $sectorIndex < count($result[$tankIndex]['sectors']); $sectorIndex++) {
               //get all boxes in that sector
               $query = "SELECT a.*, b.status, b.date_added, b.added_by, b.date_deleted, b.deleted_by, b.delete_comment, b.project" .
                       " FROM " . Config::$config['azizi_db'] . ".boxes_def AS a" .
                       " INNER JOIN " . Config::$config['dbase'] . ".lcmod_boxes_def AS b ON a.box_id = b.box_id" .
                       " WHERE a.location = " . $result[$tankIndex]['sectors'][$sectorIndex]['id'] .
                       " AND b.date_deleted IS NULL";
               $tempResult = $this->Dbase->ExecuteQuery($query);

               //get all unique racks in this sector
               if ($tempResult !== 1) {
                  $racks = array();
                  for ($boxIndex = 0; $boxIndex < count($tempResult); $boxIndex++) {
                     //create array of boxes inside rack if it doesnt exist
                     if (strlen($tempResult[$boxIndex]['rack']) > 0 && strlen($tempResult[$boxIndex]['rack_position']) > 0) {
                        if (!isset($racks[$tempResult[$boxIndex]['rack']])) {
                           $racks[$tempResult[$boxIndex]['rack']] = array();
                           $racks[$tempResult[$boxIndex]['rack']]['name'] = $tempResult[$boxIndex]['rack'];
                           $racks[$tempResult[$boxIndex]['rack']]['size'] = $result[$tankIndex]['sectors'][$sectorIndex]['rack_pos']; //assuming here that you will not find a box out of range specified in boxes_local_def
                           $racks[$tempResult[$boxIndex]['rack']]['boxes'] = array();
                        }

                        //get retrieves on the box
                        $query = "SELECT * FROM " . Config::$config['dbase'] . ".lcmod_retrieved_boxes WHERE box_def = " . $tempResult[$boxIndex]['box_id'];
                        $tempResult[$boxIndex]['retrieves'] = $this->Dbase->ExecuteQuery($query);
                        if ($tempResult[$boxIndex]['retrieves'] === 1) {
                           $tempResult[$boxIndex]['retrieves'] = array();
                           $message = $this->Dbase->lastError;
                        }
                        
                        //get project for box
                        if(!isset($projectLookup[$tempResult[$boxIndex]['box_id']])) {
                           $projectLookup[$tempResult[$boxIndex]['box_id']] = array();
                        }
                        $tempResult[$boxIndex]['sample_projects'] = $projectLookup[$tempResult[$boxIndex]['box_id']];
                        
                        //get organisms for box
                        if(!isset($organismLookup[$tempResult[$boxIndex]['box_id']])) {
                           $organismLookup[$tempResult[$boxIndex]['box_id']] = array();
                        }
                        $tempResult[$boxIndex]['sample_organisms'] = $organismLookup[$tempResult[$boxIndex]['box_id']];
                        
                        //get sample types for box
                        if(!isset($sampleTypeLookup[$tempResult[$boxIndex]['box_id']])) {
                           $sampleTypeLookup[$tempResult[$boxIndex]['box_id']] = array();
                        }
                        $tempResult[$boxIndex]['sample_types'] = $sampleTypeLookup[$tempResult[$boxIndex]['box_id']];
                        

                        //push box into parent rack
                        array_push($racks[$tempResult[$boxIndex]['rack']]['boxes'], $tempResult[$boxIndex]);
                     } else
                        $this->Dbase->CreateLogEntry('box_storage: Unable to add box with box_id = ' . $tempResult[$boxIndex]['box_id'] . " because its rack or position on rack has not been specified", 'warnings');
                  }

                  //change racks array from associative to index
                  $newRackIndex = 0;
                  $convertedRacks = array();
                  foreach ($racks as $currRack) {
                     $convertedRacks[$newRackIndex] = $currRack;
                     $newRackIndex++;
                  }

                  $result[$tankIndex]['sectors'][$sectorIndex]['racks'] = $convertedRacks;
               } else
                  $message = $this->Dbase->lastError;
            }
         } else
            $message = $this->Dbase->lastError;
      }

      $jsonArray = array();
      $jsonArray['error'] = $message;

      if ($result === 1) {
         $result = array();
      }
      $jsonArray['data'] = $result;
      //$this->Dbase->CreateLogEntry('bod_box_storage: json for tank information -> '.print_r($result, true), 'debug');
      //setcookie("tankData", json_encode($jsonArray), 0, "/");
      echo json_encode($jsonArray);
   }
}
define(OPTIONS_COMMON_FOLDER_PATH, '../../common/');

if($_GET['page'] == 'data'){
   $repository3D = new Repository3D();
   $repository3D->TrafficController();
}
else {
?>
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Bio-Repository in 3D</title>
      <script type='text/javascript' src='../../common/jquery/jquery-1.8.3.min.js' /></script>
      <script src='../js/three.min.js'></script>
      <script src='../js/tween.min.js'></script>
      <script src='../js/stats.min.js'></script>
      <script src='../js/threex.dynamictexture.js'></script>
      <script src='../js/OrbitControls.js'></script>
      <script src='../js/repository_3d.js'></script>
      <script src='../js/tank_3d.js'></script>
      <link href="../css/azizi.css" rel="stylesheet" type="text/css" />
      <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css' />
   </head>
   <body>
      <div id="repo_container" ></div>
      <div id="reset_button">Reset</div>
      <div id="zoom_in" class="zoom_button" style="display: none;">+</div>
      <div id="zoom_out" class="zoom_button" style="display: none;">-</div>
      <input id="search_box_3d" placeholder="Search" />
      <div id="search_canvas" style="display: none;"></div>
      <div id="virt_box" style="display: none;"></div>
      <div id="stats_box" style="display: none;"></div>
      <div id="sample_ttip" style="display: none;"></div>
      <div id="loading_box">Loading...</div>
      <div id="clear_search" style="display: none;">X</div>
      <script>
         var repository3D = new Repository3D();
      </script>
   </body>
</html>
<?php
}
?>