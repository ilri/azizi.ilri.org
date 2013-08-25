<html>
  <head>
    <title>LN2 status summary </title>
    <link rel="stylesheet" type="text/css" href="../azizi.css" />

    <script type="text/javascript">
      function ajaxFunction()
      {
        var xmlhttp;
        if (window.XMLHttpRequest)
        {
          xmlhttp=new XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        {
          xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");   // code for IE6, IE5
        }
        else
        {
          alert("Your browser does not support XMLHTTP!");
        }
        xmlhttp.onreadystatechange = function()
        {
          if(xmlhttp.readyState == 4)
          {
            var output = document.getElementById('Ajax');
            output.innerHTML = xmlhttp.responseText;
          }
        }
        xmlhttp.open("GET", "frzr_summarydb.php", true);
        xmlhttp.send(null);

	mTimer = setTimeout("ajaxFunction()", 2000); 
     }
    </script>
  </head>
  <body onload="ajaxFunction();"> 
    <?php 
      echo("<h2>Azizi LN<sub>2</sub> freezers <a href=\"/cgi-bin/frzr_web.cgi\" >much more</a></h2>\n");

    ?>
  <div id='Ajax'>
  </div>
  </body>
</html>
