<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<meta name="Description" content="Azizi is the ILRI biorepository/biobank system. It is an ultra low cold storage system for storing biological materials collected by researchers in ILRI over the years." />
      <meta name="robots" content="index,follow" />
		<title>Azizi Biorepository</title>
	   <link rel="stylesheet" type="text/css" href="/azizi/css/azizi.css" />
	   <link rel="stylesheet" type="text/css" href="/azizi/css/bootstrap.min.css" />
      <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,800' rel='stylesheet' type='text/css' />
      <script type='text/javascript' src='/common/jquery/jquery-1.8.3.min.js'></script>
      <script type='text/javascript' src='/common/sprintf.js'></script>
      <script type='text/javascript' src='/azizi/js/azizi.js'></script>
	</head>

  <body>
     <div id="top" class="transform_slow">
        <div id="search">
           <input type="text" class="search form-control" name="azizi_search" id="azizi_search" placeholder="Search our repository" style="width: 350px;" />
           <!-- a href='javascript:;'>Advanced Search</a -->
        </div>
        <div id="title" class="center bold">Azizi Biorepository</div>
        <div id="ngombe_image"><img src="/azizi/images/WTPlogo.jpg" width="150" alt="azizi"  border="0" /></div>
     </div>
     <div id="contents" class="transform_slow">
         <div id="info">
            <p>
               Azizi Biorepository is the long term storage system and associated informatics tools that comprise the biorepository at <a href='http://ilri.org' target='_blank'>International Livestock Research Institute (ILRI)</a>.</p><p> The system supports a number of activities and projects including
               <a href="http://sites.google.com/site/idealprojectsite/Home" target="_blank">IDEAL</a>, <a href="http://icipe.org/avid/" target="_blank">AVID</a>,
               <a href="http://www.zoonotic-diseases.org/home/research/paz" target="_blank">PAZ</a>, <a href='http://steps-centre.org/project/drivers_of_disease/' target='_blank'>DDDAC</a>, <a href="http://www.genomics.liv.ac.uk/tryps/" target="_blank">African Bovine Trypanosomiasis</a>,
               the ILRI livestock diversity collection and ILRI's unique collection of pathogen isolates. The core collection is approximately 450,000 samples in vapour-phase liquid nitrogen
               with uniquely roubust, secure and well monitored ultra-cold conditions for long-term storage.
            </p>
            <p class='center'>This page provides links to resources and real-time monitoring of critical systems.</p>
         </div>
         <div id="links" class="center">
           <span><a href="/labcollector" target="_blank">Biorepository LIMS</a></span>
           <span><a href="http://hpc.ilri.cgiar.org/" target='_blank'>ILRI's Research Computing Cluster</a></span>
           <span><a href="javascript:;" id='doc_link'>Documentation</a></span>
           <span><a href="/wx" target='_blank'>Latest weather satellite images</a></span>
           <!--span><a href="/graphs/">Graphical summary of AVID sample collection</a></span-->
           <span><a href="/photo_gallery/">AVID's photo gallery</a></span>
           <span><a href="/repository/mod_ajax.php?page=repository_3d" target="_blank">Bio-Repository in 3D</a></span>
           <span><a href="/repository/mod_ajax.php?page=samples_vis" target="_blank">Collected Samples</a></span>
         </div>
	<!-- div class="center bold">Our monitoring system is down for maintenance for the time being. Sorry for the inconveniences caused.</div -->
   </div>
   <div id='documentation' class='hidden center'>
      <div class='desc'><a href="/azizi/documentation.html#infrastructure"><img src="/azizi/images/doc.png"></a><br /><span>Infrastructure</span></div>
      <div class='desc'><a href="/azizi/documentation.html#sample_storage"><img src="/azizi/images/doc1.png"></a><br /><span>Sample Storage</span></div>
      <div class='desc'><a href="/azizi/documentation.html#sampling_protocol"><img src="/azizi/images/doc2.png"></a><br /><span>Sampling Protocol</span></div>
   </div>

         <div id='equipment_status'>
             <div class="status center hidden">
                System status at <span class="time"></span>: LN2 Monitoring <span class="ln2_monitor"></span>  SMS Alerts <span class="sms_alerts"></span>  Cluster Status <span class="hpc_status"></span>
             </div>
             <div class="ln2_fridges float_left"></div>
             <div class="ancilliary"></div>
             <div class="general hidden">
                The LN plant ran for <span class="latest_plant_uptime bold"></span>&#37; of the time in the last <span class="latest_plant_days"></span> days. It has logged a total of <span class="total_plant_hours bold"></span> hours since 2011-02-16 (<span class="total_plant_uptime"></span>% duty).<br />
                The external fill point was used for <span class="latest_fillpoint_hours"></span> hours in the last <span class="latest_fillpoint_days"></span> days. Since 2011-03-16 it has been in use for <span class="total_fillpoint_hours"></span> hours.
             </div>
             <div class="fridge_freezers float_left"></div>
             <div class="equipments_rooms"></div>
         </div>
         <div id="extra">
             <p><abbr title=" - Azizi is a Swahili word meaning a treasure, a valued thing, a rarity.">why azizi ?</abbr></p>
         </div>
     </div>
     <div id="results" class="hidden transform_slow">
        <div class="left"></div>
        <div class="right" class="transform_slow"></div>
        <div class="extreme_right" class="transform_slow"></div>
     </div>
     <div id="results_count"></div>
     <div id="bottom_panel" class="hidden transform_slow"></div>
     <div id="up_arrow" class="hidden transform_slow"><span class="up_arrow"></span></div>
	</body>

<!--Google analytics. Script block purposely placed here to improve the page load time, even if it is by milli second  -->
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-24006166-1']);
  _gaq.push(['_trackPageview']);
  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
  Azizi.sysConfig = <?php require_once 'azizi_config';  echo json_encode(Config::$sysConfig); ?>;
  Azizi.searchTimoutID = 0;
  $('[name=azizi_search]').focus().live('keyup', function(){
     window.clearTimeout(Azizi.searchTimoutID);
     Azizi.searchTimoutID = window.setTimeout(Azizi.startSearch, 500);
  });
  $('.first_line a').live('click', Azizi.getSampleDetails);
  $('.iis').live('click', Azizi.nextSamples);
  $('#doc_link').live('click', function(){ $('#documentation').toggle('slow'); });
  setTimeout(Azizi.refreshEquipmentStatus, 1000);
</script>

<!--End of google analytics  -->
</html>
