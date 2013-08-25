<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<meta name="generator" content="Steve" />
		<title>Azizi server</title>
	    <link rel="stylesheet" type="text/css" href="azizi.css" />
	    
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
        xmlhttp.open("GET", "ln2/frzr_snap_ajax_db.php", true);
        xmlhttp.send(null);

	mTimer = setTimeout("ajaxFunction()", 10000); 
     }
    </script>
<!--Google analytics-->
<script type="text/javascript">

  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-24006166-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();

</script>

<!--End of google analytics-->

	</head>

  <body onload="ajaxFunction();">
  
		<table cellpadding="10" cellspacing="2">
		<tr><td><img src="WTPlogo.jpg" width="150" alt="azizi"  border="0" /> </td><td>   <h3>Azizi server</h3></td></tr>
	    <tr><td>&nbsp;</td><td><p><a href="http://azizi.ilri.cgiar.org/labcollector" target="_blank">Labcollector</a>
	    <tr><td>&nbsp;</td><td><p><a href="/wx" target='_blank'>Latest weather satellite images</a></p></td></tr>
	    <tr><td>&nbsp;</td><td><p><a href="/graphs/">Graphs based on the AVID data</a></p></td></tr>
	    <tr><td>&nbsp;</td><td><p><a href="/photo_gallery/">AVID's photo gallery</a></p></td></tr>
	    <tr><td>&nbsp;</td><td> 
	    
	    <div id='Ajax'>
  </div></td></tr>
  
	    <tr><td>&nbsp;</td><td>&nbsp;</td></tr>
	    <tr><td>&nbsp;
</td><td>

<p><abbr title=" - Azizi is a Swahili word meaning a treasure, a valued thing, a rarity.">why azizi ?</abbr></p></td></tr>

</table>
	
				   
	</body>

</html>
