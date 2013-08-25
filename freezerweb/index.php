<html>
  <head>
    <title>
      Freezer Web - Your daily source of ILRI biobank freezer statistics!
    </title>
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <?php
      require_once('lib/resources.php');
    ?>
    <script type="text/javascript" src="resources/dygraph-combined.js" ></script>
    <script src="javascript/ajax.js" type="text/javascript"></script>
    <script type="text/javascript">
    var fg;
    var pg;
    function LoadGraphs() {
      var days = document.getElementById("time").value;
      var tanks = '';
      for ( var i = 0; i < document.forms[0].elements.length; i++ ) {
	var e = document.forms[0].elements[i];
	if ( (e) && (e.type == 'checkbox') ) {
	  if ( e.checked ) {
	    tanks = tanks + ',' + e.value;
	  }
	}
      }
      tanks = tanks.substring(1);
      LoadFreezerGraph(days, tanks);
      LoadPressureGraph(days);
      LoadFillPointGraph(days);
      LoadLevelGraph(days);
	  LoadBulkTankWeightGraph(days);
      updateImages();
      ajax('lib/summary.php', 'summary_table');
    }
    function LoadFreezerGraph(days, tanks) {
      fg = new Dygraph(// containing div
		       document.getElementById("freezer_graph"),

		       // CSV or path to a CSV file.
		       "plots/freezer_graph.php?days=" + days + "&tanks=" + tanks,

		       // Options
		       {
		       title: 'Freezer tank Temperatures',
			   ylabel: 'Temperature (C)',
			   legend: 'always',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'right' }
		       }
		       );
    }

    function LoadPressureGraph(days) {
      pg = new Dygraph(// containing div
		       document.getElementById("pressure_graph"),

		       // CSV or path to a CSV file.
		       "plots/pressure_graph.php?days=" + days,

		       // Options
		       {
		       title: 'Bulk tank Pressure',
			   ylabel: 'Pressure (bar)',
			   legend: 'always',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'right' }
		       }
		       );
    }

    function LoadLevelGraph(days) {
      pg = new Dygraph(// containing div
		       document.getElementById("level_graph"),

		       // CSV or path to a CSV file.
		       "plots/level_graph.php?days=" + days,

		       // Options
		       {
		       title: 'Bulk tank contents',
			   ylabel: 'Level (%)',
			   legend: 'always',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'right' }
		       }
		       );
    }

    function LoadFillPointGraph(days) {
      pg = new Dygraph(// containing div
		       document.getElementById("fill_point_graph"),

		       // CSV or path to a CSV file.
		       "plots/fill_point_graph.php?days=" + days,

		       // Options
		       {
		       title: 'Fill point temperature',
			   ylabel: 'Temperature (C)',
			   legend: 'always',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'right' }
		       }
		       );
    }

    function LoadBulkTankWeightGraph(days) {
      pg = new Dygraph(// containing div
		       document.getElementById("bulk_tank_weight_graph"),

		       // CSV or path to a CSV file.
		       "plots/bulk_tank_weight_graph.php?days=" + days,

		       // Options
		       {
		       title: 'Bulk Tank Weight',
			   ylabel: 'Voltage (V)',
			   legend: 'always',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'right' }
		       }
		       );
    }

    function updateImages()
    {
      ajax('lib/load_image.php?cam=inside_camera&width=450', 'image0');
      ajax('lib/load_image.php?cam=outside_camera&width=450', 'image1');
    }
    function expand()
    {
      ajax("lib/info.php","info");
    }
    function contract()
    {
      var info = document.getElementById("info")
      info.innerHTML = "<a href='javascript:expand()'>more info</a>";
    }
    </script>

  </head>
  <body onload="LoadGraphs();">
    <div class="main">

      <div class="header">
	<h1>Freezer Web</h1>
	<h3>Online display of freezer information captured from the Azizi ultra cold storage system at ILRI</h3>
	<div id="info" class="info">
	  <a href="javascript:expand()">more info</a>
	</div> <!-- info -->
      </div> <!-- header -->

      <div class="graph">
	<div id="freezer_graph" style="width: 958px; height: 400px"></div>
	<div id="level_graph" style="width: 958px; height: 200px"></div>
	<div id="fill_point_graph" style="width: 958px; height: 200px"></div>
	<div id="pressure_graph" style="width: 958px; height: 200px;"></div>
	<div id="bulk_tank_weight_graph" style="width: 958px; height: 200px;"></div>
      </div> <!-- graph -->
      <div class="controller">
	<form name="graph_controls">
	  Plot:
	  <input type="text" id="time" size="3" value="7">
          Days
          <?php
            print '|';
            foreach ( get_tanks() as $tank ) {
              print ' Tank ' . $tank . '<input type="checkbox" name="tank_' . $tank . '" value="' . $tank . '" checked/> |';
            }
          ?>
	  <input type="button" value="Update Graph" onclick="javascript:LoadGraphs()">
	</form>
      </div> <!-- controller -->

      <div id="summary_table"></div> <!-- summary table -->

      <div class="images">
	<table>
	  <tr class="odd"><td><div id="image0"></div></td><td><div id="image1"></div></td></tr>
	</table>
      </div> <!-- images -->
    </div> <!-- main -->

  </body>
</html>
