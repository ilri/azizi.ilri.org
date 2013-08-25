<?php
   require_once 'azizi_config';
  $id   = isset($_GET['id'])   ? $_GET['id']   : 11;
  $days = isset($_GET['days']) ? $_GET['days'] : 7;

  if ( $id ) { // Open the mysql connection
     $conn = mysql_connect(Config::$dbhost, Config::$dbuser, Config::$dbpass) or die (mysql_error());
     mysql_select_db(Config::$dbname) or die (mysql_error());

    $query = "SELECT description
              FROM freezer_units
              WHERE unitid = ${id}";

    $tank_name = mysql_fetch_row(mysql_query($query));
    $tank_name = $tank_name[0];

    // Get all unknown fields as potential graphs
    $invalid = array('record', 'freezer', 'created', 'alert', 'alarm'); // non-graphable fields
    $results = mysql_query("DESCRIBE freezer_log");
    $fields = '';
    while ( $result = mysql_fetch_row($results) ) {
      if ( !in_array($result[0], $invalid) ) {
        $fields .= "MAX(" . $result[0] . ") AS " . $result[0] . ", ";
      }
    }

    // if we have some fields, remove those without values
    if ( $fields ) {
      $fields = substr($fields, 0, -2);
      $query = "SELECT freezer, ${fields}
                FROM freezer_log
                WHERE freezer = ${id}
                  AND ${days} * 24 > (TO_DAYS(NOW())*24+HOUR(NOW())) - (TO_DAYS(created)*24+HOUR(created))
                GROUP BY freezer;";

      $fields = array();
      $results = mysql_fetch_assoc(mysql_query($query));

      foreach ( $results as $field => $value ) {
        if ( $value and $field != 'freezer' ) {
          array_push($fields, $field);
        }
      }
    }

    // Get info about the unit

    $query = "SELECT description, type, location, contents, ";
    foreach ( $fields as $field ) {
      if (substr($field, -2) == '_2' or substr($field, -4) == '_ref') {
        continue;
      }
      $query .= 'max_' . $field . ', ';
      $query .= 'min_' . $field . ', ';
    }
    $query .= 'in_use ';
    $query .= "FROM freezer_units
               WHERE unitid = ${id};";

    $info = mysql_fetch_assoc(mysql_query($query));
  }

  $title = $id ? "Unit information for " . $tank_name // If an id is set
               : '';                        // If not

?>

<html>
  <head>
    <title><?php echo $title; ?></title>
    <script type="text/javascript" src="resources/dygraph-combined.js" ></script>
    <script type="text/javascript" src="resources/jquery-1.6.4.min.js" ></script>
    <script type="text/javascript" src="resources/labfreezer.js" ></script>
    <script type="text/javascript">
      var g;
      function LoadFreezerGraph(id, unit, days, element, label) {
        g = new Dygraph(

          // containing div
          document.getElementById(element),

          // CSV or path to a CSV file.
          "graph.php?id=" + id + "&unit=" + unit + "&days=" + days ,

          // Options
          {
            ylabel: label,
            legend: 'always',
            connectSeparatedPoints: 'true',
            labelsDivStyles: { 'textAlign': 'right' }
          }
        );
      }

      function LoadGraphs(days) {
        <?php
          foreach ( $fields as $field ) {
            if (substr($field, -2) == '_2' or substr($field, -4) == '_ref') {
              continue;
            }
            $graph_fields = $field;
            if (in_array("${field}_2", $fields)) {
              $graph_fields .= ",${field}_2";
            }
            if (in_array("${field}_ref", $fields)) {
              $graph_fields .= ",${field}_ref";
            }
            echo "LoadFreezerGraph(${id}, \"${graph_fields}\", days, \"${field}_graph\", ";
            switch ($field) {
              case 'temp'  : echo "\"Temperature (C)\""; break;
              case 'co2'   : echo "\"CO2 (%)\""; break;
              case 'o2'    : echo "\"O2 (%)\""; break;
              default:       echo "\"${field}\"";
            }
            echo ");\n";
          }
        ?>
      }
    </script>
    <link rel="stylesheet" type="text/css" href="css/style.css" />
  </head>
  <body onload="LoadGraphs(<?php echo "${days}"?>);">
    <div class="main">
      <h1><?php echo $title; ?></h1>
      <div class='info'>
        <?php
          echo "<table><tr><th>Plot days</td>";
          foreach ( $info as $key => $value ) {
            echo "<th>" . ucfirst(str_replace('_', ' ', $key)) . "</td>";
          }
          echo "</tr><tr><td><input type='textfield' size='3' id='plot_days' value='${days}'></td>";
          foreach ( $info as $key => $value ) {
            echo "<td>" . ucfirst(str_replace('_', ' ', $value)) . "</td>";
          }
          echo "</tr></table>";
        ?>
      </div>
      <?php
        foreach ( $fields as $field ) {
          if (substr($field, -2) == '_2' or substr($field, -4) == '_ref') {
            continue;
          }
          echo "<div id='${field}_graph' class='graph' style='width:960px; height:200px;'></div>\n";
        }
      ?>
    </div>
  </body>
</html>
