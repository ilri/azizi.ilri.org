<?php
/**
 * This is the worker who is never recognised. Includes all the necessary files. Initializes a session if need be. Processes the main GET or POST
 * elements and includes necessary files. Calls the necessary functions/methods
 *
 * @author Kihara Absolomon <a.kihara@cgiar.org>
 * @since v0.1
 */
define('OPTIONS_COMMON_FOLDER_PATH', '../common/');
require_once 'azizi_config';

//setting the date settings
date_default_timezone_set ('Africa/Nairobi');

//get what the user wants
$server_name=$_SERVER['SERVER_NAME'];
$queryString=$_SERVER['QUERY_STRING'];
$paging = (isset($_GET['page']) && $_GET['page']!='') ? $_GET['page'] : '';
$sub_module = (isset($_GET['do']) && $_GET['do']!='') ? $_GET['do'] : '';
$action = (isset($_POST['action']) && $_POST['action']!='') ? $_POST['action'] : '';
$user = isset($_SESSION['user']) ? $_SESSION['user'] : '';


define('OPTIONS_HOME_PAGE', $_SERVER['PHP_SELF']);
define('OPTIONS_REQUESTED_MODULE', $paging);
define('OPTIONS_CURRENT_USER', $user);
/**
 * @var string    What the user wants
 */
define('OPTIONS_REQUESTED_SUB_MODULE', $sub_module);
define('OPTIONS_REQUESTED_ACTION', $action);
$t = pathinfo($_SERVER['SCRIPT_FILENAME']);
$requestType = ($t['basename'] == 'mod_ajax.php') ? 'ajax' : 'normal';

define('OPTIONS_REQUEST_TYPE', $requestType);

require_once 'mod_azizi.php';
$Azizi = new Azizi();
?>