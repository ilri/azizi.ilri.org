<?php
  $type = ($_GET['type'] == 'room') ? 'room' : 'freezer';
  $titles = array(
     'room' => 'Rooms and Equipment',
     'freezer' => 'Lab Fridge and Freezer',
  );
  require_once('lib/resources.php');
?> 
<html>
<head>
<title>
ILRI <?php echo $titles[$type]; ?> Statistics.
</title>
<link rel="stylesheet" type="text/css" href="css/style.css" />
    <script type="text/javascript" src="resources/dygraph-combined.js" ></script>
    <script src="javascript/ajax.js" type="text/javascript"></script>
    <script type="text/javascript">
    var fg;
    function LoadGraphs() {
      var days = document.getElementById("time").value;
      var units = '';
      for ( var i = 0; i < document.forms[0].elements.length; i++ ) {
	var e = document.forms[0].elements[i];
	if ( (e) && (e.type == 'checkbox') ) {
	  if ( e.checked ) {
	    units = units + ',' + e.value;
	  }
	}
      }
      units = units.substring(1);
      LoadFreezerGraph(days, units);
    }
    function LoadFreezerGraph(days, units) {
      fg = new Dygraph(// containing div
		       document.getElementById("freezer_graph"),
		       
		       // CSV or path to a CSV file.
		       "plots/freezer_graph.php?days=" + days + "&units=" + units,
		       
		       // Options
		       {
		       title: '<?php echo $titles[$type]; ?> Temperatures',
			   ylabel: 'Temperature (C)',
			   legend: 'onmouseover',
			   connectSeparatedPoints: 'true',
			   labelsDivStyles: { 'textAlign': 'left', 'left':'60px' },
			   labelsSeparateLines: true,
			   labelsDivWidth: 'auto'
		       }
		       );
    }
    </script>
</head>
<body onload="LoadGraphs();">
<div class="main">
   <div class="header">
   <h1>ILRI <?php echo $titles[$type]; ?></h1>
   <h3>Online display of ILRI <?php echo $titles[$type]; ?> information.</h3>
   </div> <!-- header -->
     <div class="graph">
	<div id="freezer_graph" style="width: 958px; height: 400px"></div>
     </div>
     <div class="controller">
     <form name="graph_controls">
     Plot:
     <input type="text" id="time" size="3" value="7">
     Days
     <?php
       print '|';
       $freezer_info = get_freezers();
       foreach ( $freezer_info as $id => $freezer ) {
         print ' Freezer ' . $id . '<input type="checkbox" name="freezer_' . $id . '" value="' . $id . '" checked/> |';
       }
     ?>
     <input type="button" value="Update Graph" onclick="javascript:LoadGraphs()">
     </form>
   </div> <!-- controller -->
   <div id="summary_table">   
   <?php
     echo "<table><tr class='odd'>";
     $keys = array_keys($freezer_info);
     foreach ($freezer_info[$keys[0]] as $key => $value) {
       echo "<th>$key</td>";
     }
     echo "</tr>";
     $c = 1;
     foreach ($freezer_info as $freezer) {
       $tag = (++$c % 2) ? 'even' : 'odd';
       echo "<tr class='$tag'>";
       foreach ($freezer as $key => $value) {
	 echo "<td>$value</td>";
       }
       echo "</tr>";
     }
     echo "</table>";
   ?>
   </div>
</div>
</body>
</html>
