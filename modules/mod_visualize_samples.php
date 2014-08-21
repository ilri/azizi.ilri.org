<?php
class VisualizeSamples {
   private $Dbase;
   
   public function __construct() {
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
   }
   
   
   public function trafficController(){
      if(OPTIONS_REQUESTED_SUB_MODULE == 'ajax'){
         if(OPTIONS_REQUESTED_ACTION == 'all_sample_data'){
            $this->getAllSamples();
         }
         else if(OPTIONS_REQUESTED_ACTION == 'all_project_data'){
            $this->getAllProjects();
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
       
       for($index = 0; $index < count($data['samples']); $index++){
          $data['samples'][$index]['Longitude'] = $this->convertLongitude($data['samples'][$index]['Longitude']);
          $data['samples'][$index]['Latitude'] = $this->convertLatitude($data['samples'][$index]['Latitude']);
       }

       echo json_encode($data);
   }
   
   private function getAllProjects() {
      $query = "SELECT * FROM ".Config::$config['azizi_db'].".modules_custom_values";
      $projects = $this->Dbase->ExecuteQuery($query);
      
      $data = array();
      if($projects != 1){
         $data['projects'] = $projects;
         $data['error'] = 0;
      }
      else {
         $data['projects'] = array();
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
      <script src='<?php echo OPTIONS_COMMON_FOLDER_PATH ?>/leaflet-0.7.3/leaflet.js'></script>
      <link href="../css/azizi.css" rel="stylesheet" type="text/css" />
      <link href='http://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css' />
      <link href='<?php echo OPTIONS_COMMON_FOLDER_PATH ?>/leaflet-0.7.3/leaflet.css' />
   </head>
   <body>
      <div id="sample_map_canvas"></div>
      <div id="samples_timeline"></div>
      <div id="project_list"></div>
      <script>
         var visSamples = new VisualizeSamples();
      </script>
   </body>
</html>
<?php
}
?>

