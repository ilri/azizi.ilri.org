<?php
class VisualizeSamples {
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

      $this->Dbase->InitializeLogs();
      
      Config::$config['user'] = Config::$config['rw_user']; Config::$config['pass'] = Config::$config['rw_pass'];
      
      $this->Dbase->InitializeConnection();
      
      define(OPTIONS_REQUESTED_SUB_MODULE, $_GET['do']);
      define(OPTIONS_REQUESTED_ACTION, $_GET['action']);
   }
   
   
   public function trafficController(){
      if(OPTIONS_REQUESTED_SUB_MODULE == 'ajax'){
         if(OPTIONS_REQUESTED_ACTION == 'all_sample_data'){
            $this->getAllSamples();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'all_project_data'){
            $this->getAllProjects();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'all_organism_data'){
            $this->getAllOrganisms();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'all_sample_type_data'){
            $this->getAllSampleTypes();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'all_origin_data'){
            $this->getAllOrigins();
         }
      }
   }
   
   private function getAllSamples(){
      $query = "SELECT count, label, date_created, date_updated, sample_type, origin, org, box_id, VisitDate, Longitude, Latitude, Elisa_Results, Project"
               . " FROM ".Config::$config['azizi_db'].".samples"
               . " WHERE Longitude IS NOT null AND Longitude != '' AND Latitude IS NOT null AND Latitude != ''";

       $samples = $this->Dbase->ExecuteQuery($query);

       $query = "SELECT count(`count`) AS orphans"
               . " FROM ".Config::$config['azizi_db'].".samples"
               . " WHERE Longitude IS null OR Longitude = '' OR Latitude IS null OR Latitude = ''";
       $tmp = $this->Dbase->ExecuteQuery($query);

       $data = array();
       if($samples != 1 && $tmp != 1){
          $data['samples'] = $samples;
          $data['orphans'] = $tmp[0]['orphans'];
          $data['error'] = 0;
       }
       else{
          $data['samples'] = array();
          $data['orphans'] = 0;
          $data['error'] = 1;
       }
       
       $testTypes = array();//array holding the different types of tests done
       $resultTypes = array();
       for($index = 0; $index < count($data['samples']); $index++){
          //clean longitude and latitude
          $data['samples'][$index]['Longitude'] = $this->convertLongitude($data['samples'][$index]['Longitude']);
          $data['samples'][$index]['Latitude'] = $this->convertLatitude($data['samples'][$index]['Latitude']);
          
          //clean the elisa results column and get the relevant data
          $test = "";
          $result = "";
          if($data['samples'][$index]['Elisa_Results'] != null && strlen($data['samples'][$index]['Elisa_Results']) > 0){
             $tests = array();
             preg_match_all("/name\s*=\s*([^,]*)\s*,\s*status\s*=\s*([a-z0-9]*)/i", $data['samples'][$index]['Elisa_Results'], $tests);
             
             if(count($tests) == 3){
                if(isset($tests[1][0])) {
                   $test = $tests[1][0];
                   if(array_search($test, $testTypes) === FALSE){
                      array_push($testTypes, $test);
                   }
                }
                
                if(isset($tests[2][0])) {
                   $result = $tests[2][0];
                   //$this->Dbase->CreateLogEntry($tests[2][0], "info");
                   if(array_search($result, $resultTypes) === FALSE){
                      array_push($resultTypes, $result);
                   }
                }
             }
          }
          
          $data['samples'][$index]['test'] = $test;
          $data['samples'][$index]['result'] = $result;
       }
       
       $data['tests'] = array('types' => $testTypes, 'results' => $resultTypes);
       
       echo json_encode($data);
   }
   
   private function getAllProjects() {
      $query = "select b.* from ".Config::$config['azizi_db'].".samples as a"
              . " inner join ".Config::$config['azizi_db'].".modules_custom_values as b on a.Project = b.val_id"
              . " where a.Longitude is not null and a.Longitude != '' and a.Latitude is not null and a.Latitude != ''"
              . " group by a.Project";
      $projects = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if($projects != 1){
         
         for($index=0; $index < count($projects); $index++){
            $projects[$index]['value'] = preg_replace("/[^a-z0-9\s]/i", "", $projects[$index]['value']);
         }
         
         $data['projects'] = $projects;
         $data['error'] = 0;
      }
      else {
         $data['projects'] = array();
         $data['error'] = 1;
      }
      
      echo json_encode($data);
   }
   
   private function getAllSampleTypes() {
      $query = "select b.*"
              . " from ".Config::$config['azizi_db'].".samples as a"
              . " inner join ".Config::$config['azizi_db'].".sample_types_def as b on a.sample_type = b.count"
              . " where a.Longitude is not null and a.Longitude != '' and a.Latitude is not null and a.Latitude != ''"
              . " group by a.sample_type";
      $sampleTypes = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if($sampleTypes != 1){
         $data['sample_types'] = $sampleTypes;
         $data['error'] = 0;
      }
      else {
         $data['sample_types'] = array();
         $data['error'] = 1;
      }
      
      echo json_encode($data);
   }
   
   private function getAllOrganisms() {
      $query = "select b.* from ".Config::$config['azizi_db'].".samples as a"
              . " inner join ".Config::$config['azizi_db'].".organisms as b on a.org = b.org_id"
              . " where a.Longitude is not null and a.Longitude != '' and a.Latitude is not null and a.Latitude != ''"
              . " group by a.org";
      $organisms = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if($organisms != 1) {
         $data['organisms'] = $organisms;
         $data['error'] = 0;
      }
      else {
         $data['organisms'] = array();
         $data['error'] = 1;
      }
      
      echo json_encode($data);
   }
   
   private function getAllOrigins() {
      $query = "select origin from ".Config::$config['azizi_db'].".samples group by origin";
      $origins = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if($origins != 1){
         $data['origins'] = $origins;
         $data['error'] = 0;
      }
      else {
         $data['origins'] = array();
         $data['error'] = 1;
      }
      
      echo json_encode($data);
   }
   
   private function convertLongitude($longitude) {
      
      if(strlen($longitude) > 0) {
         $hemInt = 0;//default to 0 so that if not E or W you will end up with 0 longitude
         if(preg_match("/[a-z]/i", $longitude) == 1){
            
            $hem = strtoupper(substr($longitude, -1));
            
            if($hem =="E" ) {
               $hemInt = 1;
            }
            else if($hem == "W") {
               $hemInt = -1;
            }
         }
         else {
            $hemInt = 1;
         }
         
         if($hemInt != 0) {
            $longitudeFloat = floatval(str_replace($hem, "", $longitude));

            return $hemInt * $longitudeFloat;
         }
         else {
            $this->Dbase->CreateLogEntry("longitude with problems = ".$longitude, "info");
         }
      }
      
      $this->Dbase->CreateLogEntry("longitude with problems = ".$longitude, "info");
      return null;
   }
   
   private function convertLatitude($latitude) {
      return floatval($latitude);
   }
}

define(OPTIONS_COMMON_FOLDER_PATH, '../../common/');

if(isset($_GET['do'])){
   $visualizeSamples = new VisualizeSamples();
   $visualizeSamples->trafficController();
}
else{
?>
<html>
   <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Bio-Repository in 3D</title>
      <script type='text/javascript' src='../../common/jquery/jquery-1.8.3.min.js' /></script>
      <script src='../js/visualize_samples.js'></script>
      <script src='../js/ol.js'></script>
      <!--?php echo "<script src='".OPTIONS_COMMON_FOLDER_PATH."dygraphs/dygraph-combined.js'></script>" ?--> <!-- Outdated version of the lib -->
      <script src="http://dygraphs.com/dygraph-combined.js"></script>
      <!--?php echo "<script src='".OPTIONS_COMMON_FOLDER_PATH."d3/d3.min.js' charset='utf-8'></script>" ?-->
      <?php //echo "<script src='".OPTIONS_COMMON_FOLDER_PATH."/leaflet-0.7.3/leaflet.js'></script>"; ?>
      <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.css" />
      <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
      <link href="../css/azizi.css" rel="stylesheet" type="text/css" />
      <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css' />
      <!--link href='<?php echo OPTIONS_COMMON_FOLDER_PATH; ?>/leaflet-0.7.3/leaflet.css' />
      <!--script src="http://www.mapquestapi.com/sdk/leaflet/v1.0/mq-map.js?key=Fmjtd%7Cluur250220%2C8w%3Do5-9w7w9f "></script><!-- the key in this get request is owned by Jason Rogena -->
   </head>
   <body>
      <script src='../js/leaflet-heat.js'></script>
      <div id="map"></div>
      <div id="samples_timeline"></div>
      <div id="loading_box">Loading</div>
      <div id="play_button"></div>
      <div id="play_slider"></div>
      <div id="sample_count"></div>
      <div id="project_container" class="filter_container">
         <div id="project_label" class="filter_label">Projects</div>
         <div id="project_toggle" class="filter_toggle"></div>
         <div id="project_list" class="filter_list"></div>   
      </div>
      <div id="organism_container" class="filter_container">
         <div id="organism_label" class="filter_label">Organisms</div>
         <div id="organism_toggle" class="filter_toggle"></div>
         <div id="organism_list" class="filter_list"></div>   
      </div>
      <div id="sample_types_container" class="filter_container">
         <div id="sample_types_label" class="filter_label">Sample Types</div>
         <div id="sample_types_toggle" class="filter_toggle"></div>
         <div id="sample_types_list" class="filter_list"></div>   
      </div>
      <div id="test_container" class="filter_container">
         <div id="test_label" class="filter_label">Test done</div>
         <div id="test_toggle" class="filter_toggle"></div>
         <div id="test_list" class="filter_list"></div>   
      </div>
      <div id="result_container" class="filter_container">
         <div id="result_label" class="filter_label">Test Results</div>
         <div id="result_toggle" class="filter_toggle"></div>
         <div id="result_list" class="filter_list"></div>   
      </div>
      <script>
         var visSamples = new VisualizeSamples();
      </script>
   </body>
</html>
<?php
}
?>

