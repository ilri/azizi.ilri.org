<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<meta name="generator" content="Steve" />
		<title>Azizi server</title>
	    <link rel="stylesheet" type="text/css" href="azizi.css" />
<link href='http://fonts.googleapis.com/css?family=Open+Sans:400,800' rel='stylesheet' type='text/css'>
	    
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
  
		<table cellpadding="10" cellspacing="2" border = 0>
		<tr><td><img src="WTPlogo.jpg" width="150" alt="azizi"  border="0" /> </td><td>   <h3>Azizi</h3></td><td>&nbsp; </td></tr>
		
			    <tr>
			    
			    <td colspan="3" ><p>Azizi is the storage system and associated informatics tools that comprise the biorepository at ILRI.
			                              The system supports a number of activities and projects including 
			                              <a href="http://sites.google.com/site/idealprojectsite/Home" target="_blank">IDEAL</a>,
  			                              <a href="http://avid.icipe.org/" target="_blank">AVID</a>, 
  			                              <a href="http://www.ilri.org/paz" target="_blank">PAZ</a>,  
  			                              <a href="http://www.genomics.liv.ac.uk/tryps/" target="_blank">a group of projects targeting innate resistance to trypanosomiasis</a>,  
			                              the ILRI livestock diversity collection and ILRI's unique collection
			                              of pathogen isolates. The core collection is approximately 340,000 samples in vapour-phase
			                              liquid nitrogen with uniquely roubust, secure and well monitored ultra-cold
			                              conditions for long-term storage.
			                    <p>This page provides links to resources and real-time monitoring of critical systems.
			                              </td>
			    </tr>

		
	    <tr><td colspan="3" align = center><p><a href="http://azizi.ilri.cgiar.org/labcollector" target="_blank">LIMS system</a>  
   	                              &nbsp;&nbsp;&nbsp;<a href="http://hpc.ilri.cgiar.org/" target='_blank'>High Performance Computing at ILRI</a>
	                              &nbsp;&nbsp;&nbsp;<a href="/wx" target='_blank'>Latest weather satellite images</a>
	                              &nbsp;&nbsp;&nbsp;<a href="/graphs/">Graphical summary of AVID sample collection</a>
	                             &nbsp;&nbsp;&nbsp; <a href="/photo_gallery/">AVID's photo gallery</a>
	                             </td>
	                       
	    </tr>
	    
	    <tr><td>&nbsp; </td>
	                             <td> 
	    
	    <div id='Ajax'>
  </div></td><td>&nbsp;</td></tr>
  
	    <tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
	    <tr><td>&nbsp;
</td><td>

<p><abbr title=" - Azizi is a Swahili word meaning a treasure, a valued thing, a rarity.">why azizi ?</abbr></p></td><td>&nbsp;</td></tr>

</table>
	
				   
	</body>

</html>
