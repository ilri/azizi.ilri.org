/**
 * The constructor for this object
 * 
 * @returns {VisualizeSamples}
 */
function VisualizeSamples() {
   console.log("VisualizeSamples constructing");
   window.vs = this;//not a hack. Way around the ambigous nature of this keyword in javascript
   
   //initialize the html components to be used in this object
   window.vs.mapCanvas = jQuery("#map");
   window.vs.timeline = jQuery("#samples_timeline");
   window.vs.projectContainer = jQuery("#project_container");
   window.vs.projectList = jQuery("#project_list");
   window.vs.organismContainer = jQuery("#organism_container");
   window.vs.organismList = jQuery("#organism_list");
   window.vs.sampleTypesContainer = jQuery("#sample_types_container");
   window.vs.sampleTypesList = jQuery("#sample_types_list");
   window.vs.loadingDialog = jQuery("#loading_box");
   window.vs.loadingDialog.show();
   
   window.vs.assets = {
      toggleOff: "url(../images/ic_action_cancel.png)",
      toggleOn: "url(../images/ic_action_accept.png)",
      loading:"url(../images/ic_action_loading.gif)"
   };
   
   jQuery(".filter_toggle").css("background-image", window.vs.assets.loading);
   window.vs.projectToggle = jQuery("#project_toggle");
   window.vs.organismToggle = jQuery("#organism_toggle");
   window.vs.sampleTypesToggle = jQuery("#sample_types_toggle");
   window.vs.sampleCountDialog = jQuery("#sample_count");
   window.vs.windowResized();//since here is where all the dynamic positions and sizes are set
   
   //initialize data objects
   window.vs.loading = 0;//this variable stores the progress of loading the different data sets ie (samples, projects, organisms, sampletypes)
   window.vs.data = {};
   window.vs.data.filterIn = new Array();
   window.vs.data.filterOut = new Array();
   window.vs.data.projects = new Array();
   window.vs.data.organisms = new  Array();
   window.vs.data.sampleTypes = new Array();
   
   window.vs.filters = {projects:[], organisms:[], sampleTypes:[]};
   
   window.vs.layers = {};
   window.vs.serverURI = "mod_visualize_samples.php?do=ajax&action=";
   window.vs.getAllSampleData();
   window.vs.getAllProjectData();
   window.vs.getAllOrganismData();
   window.vs.getAllSampleTypeData();
   
   //initialize the map
   window.vs.initMap();
   /*window.vs.getGeoLocation(function(position) {
      window.vs.setMapCenter(position);
   });*/
   
   //create handlers
   //handler for window resize
   jQuery(window).resize(window.vs.windowResized);
   jQuery("#project_label").click(function(){
      window.vs.toggleProjects();
   });
   jQuery("#organism_label").click(function (){
      window.vs.toggleOrganisms();
   });
   jQuery("#sample_types_label").click(function (){
      console.log("sample types clicked");
      window.vs.toggleSampleTypes();
   });
   
   //initialize the toggle handlers
   window.vs.projectToggle.click(function(){
      window.vs.projectToggle.css("background-image", window.vs.assets.loading);
      
      if(window.vs.filters.projects.length > 0){//at least something in projects filter, clear everything
         window.vs.filters.projects = new Array();
         
         for(var index = 0; index < window.vs.data.projects.length; index++){
            jQuery("#project_" + window.vs.data.projects[index].val_id).prop("checked", false);
         }
         
      }
      else {         
         for(var index = 0; index < window.vs.data.projects.length; index++){
            window.vs.filters.projects.push(window.vs.data.projects[index].val_id);
            jQuery("#project_" + window.vs.data.projects[index].val_id).prop("checked", true);
         }
      }
      
      window.setTimeout(window.vs.filter, 100);
   });
   
   window.vs.organismToggle.click(function(){
      window.vs.organismToggle.css("background-image", window.vs.assets.loading);
      
      if(window.vs.filters.organisms.length > 0){//at least something in projects filter, clear everything
         window.vs.filters.organisms = new Array();
         
         for(var index = 0; index < window.vs.data.organisms.length; index++){
            jQuery("#organism_" + window.vs.data.organisms[index].org_id).prop("checked", false);
         }
      }
      else {
         for(var index = 0; index < window.vs.data.organisms.length; index++){
            window.vs.filters.organisms.push(window.vs.data.organisms[index].org_id);
            jQuery("#organism_" + window.vs.data.organisms[index].org_id).prop("checked", true);
         }
      }
      
      window.setTimeout(window.vs.filter, 100);
   });
   
   window.vs.sampleTypesToggle.click(function(){
      window.vs.sampleTypesToggle.css("background-image", window.vs.assets.loading);
      
      if(window.vs.filters.sampleTypes.length > 0){//at least something in projects filter, clear everything
         window.vs.filters.sampleTypes = new Array();
         
         for(var index = 0; index < window.vs.data.sampleTypes.length; index++){
            jQuery("#sample_type_" + window.vs.data.sampleTypes[index].count).prop("checked", false);
         }
      }
      else {
         for(var index = 0; index < window.vs.data.sampleTypes.length; index++){
            window.vs.filters.sampleTypes.push(window.vs.data.sampleTypes[index].count);
            jQuery("#sample_type_" + window.vs.data.sampleTypes[index].count).prop("checked", true);
         }
      }
      
      window.setTimeout(window.vs.filter, 100);
   });
   
};

/**
 * This method is called whenever the window is resized
 * @returns {undefined}
 */
VisualizeSamples.prototype.windowResized = function(){
   console.log("windowResized called");
   
   window.vs.loadingDialog.css("top", (window.innerHeight/2)-(window.vs.loadingDialog.height()/2)+"px");
   window.vs.loadingDialog.css("left", (window.innerWidth/2)-(window.vs.loadingDialog.width()/2)+"px");
   
   var labelHeight = jQuery("#project_label").height();
   var filterWidth = jQuery("#project_container").width();
   jQuery(".filter_toggle").css("height", labelHeight);
   jQuery(".filter_toggle").css("width", labelHeight);
   jQuery(".filter_label").css("width", filterWidth - labelHeight);
   
   window.vs.timeline.css("top", (window.innerHeight - window.vs.timeline.height()) + "px");
   
   /*var height = window.innerHeight;
   console.log("  window height = ", height);
   var width = window.innerWidth;
   console.log("  window width = ", width);*/
};

/**
 * This method initializes the map
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.initMap = function(){
   console.log("initMap called");
   
   var location = [1.2833, 36.8167];//default location
   //init the map object
   window.vs.map = L.map(window.vs.mapCanvas[0].id, {
      center: location,
      zoom: 3
   });
   
   L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
      subdomains: ['otile1','otile2','otile3','otile4']
   }).addTo( window.vs.map );
   
   window.vs.layers.heatmapLayer = L.heatLayer([],{
      radius:20
   }).addTo(window.vs.map);
};

VisualizeSamples.prototype.updateLoadingProgress = function(){
   window.vs.loading++;
   if(window.vs.loading === 4){//all data has been loaded
      window.vs.loadingDialog.hide();
      window.vs.filter();
   }
   else{
      window.vs.loadingDialog.html(window.vs.loadingDialog.html()+".");
   }
};

/**
 * This method fetches all samples with location data from the
 * server
 * Note that some of the code in this method runs asynchronously
 * 
 * @param {type} onComplete   Code to be executed once the data is gotten from the server
 * @returns {undefined}
 */
VisualizeSamples.prototype.getAllSampleData = function(onComplete){
   console.log("getAllSampleData called");
   var uri = window.vs.serverURI + "all_sample_data";
   
   jQuery.ajax({
      url: uri,
      type: 'POST',
      async: true
   }).done(function(data){
      var jsonObject = jQuery.parseJSON(data);
      console.log("************************************");
      console.log("sample data gotten from the server");
      console.log("x size of dataset = ",jsonObject.samples.length);
      window.vs.data.samples = jsonObject.samples;
      
      for(var index = 0; index < window.vs.data.samples.length; index++ ){
         window.vs.data.filterIn.push(window.vs.data.samples[index]);
      }
      
      window.vs.updateLoadingProgress();
      
      if(typeof onComplete != 'undefined')  onComplete();
   });
};



VisualizeSamples.prototype.getDefaultHeatmap = function(){
   //var heatmapCoords = window.vs.getHeatmapCoords();
   
   //window.vs.layers.heatmapLayer.setData(heatmapCoords);
   
   var samplesData = window.vs.data.samples;
   for(var index = 0; index < samplesData.length; index++){
      //console.log(L.latLng(samplesData[index].Latitude, samplesData[index].Longitude));
      window.vs.data.filterIn.push(samplesData[index]);
      window.vs.layers.heatmapLayer._latlngs.push(new L.latLng(samplesData[index].Latitude, samplesData[index].Longitude));
   }
   
   window.vs.layers.heatmapLayer.redraw();
};

VisualizeSamples.prototype.getHeatmapCoords = function(){
   var heatmapCoords = new Array();
   var coordsArray = new Array();
   
   var samplesData = window.vs.data.samples;
   
   for(var index = 0; index < samplesData.length; index++){
      var heatIndex = jQuery.inArray([samplesData[index].Latitude, samplesData[index].Longitude], coordsArray);
      if(heatIndex == -1){//not in array
         heatmapCoords.push({lat:samplesData[index].Latitude, lon:samplesData[index].Longitude, count: 1});
         coordsArray.push([samplesData[index].Latitude, samplesData[index].Longitude]);
      }
      else {
         heatmapCoords[heatIndex].count = heatmapCoords[heatIndex].count++;
      }
   }
   
   return heatmapCoords;
};

/**
 * This method gets data on projects from the server
 * Note that some of the code in this function will run asynchronously from the
 * main thread
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.getAllProjectData = function(onComplete) {
   var uri = window.vs.serverURI + "all_project_data";
   
   jQuery.ajax({
      url: uri,
      type: 'POST',
      async: true
   }).done(function(data){
      var jsonObject = jQuery.parseJSON(data);
      console.log("******************************");
      console.log("project data gotten from the server");
      console.log("x size of dataset = ",jsonObject.projects.length);
      window.vs.data.projects = jsonObject.projects;
      
      for(var index = 0; index < window.vs.data.projects.length; index++){
         window.vs.filters.projects.push(window.vs.data.projects[index].val_id);
      }
      
      window.vs.updateLoadingProgress();
      
      window.vs.projectToggle.css("background-image", window.vs.assets.toggleOff);
      
      if(typeof onComplete != 'undefined') onComplete();
   });
};

/**
 * This method gets data on organisms from the server
 * Note that some of the code in this function will run asynchronously from the
 * main thread
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.getAllOrganismData = function(onComplete) {
   var uri = window.vs.serverURI + "all_organism_data";
   
   jQuery.ajax({
      url: uri,
      type: 'POST',
      async: true
   }).done(function(data){
      var jsonObject = jQuery.parseJSON(data);
      console.log("******************************");
      console.log("organism data gotten from the server");
      console.log("x size of dataset = ",jsonObject.organisms.length);
      window.vs.data.organisms = jsonObject.organisms;
      
      for(var index = 0; index < window.vs.data.organisms.length; index++) {
         window.vs.filters.organisms.push(window.vs.data.organisms[index].org_id);
      }
      
      window.vs.updateLoadingProgress();
      
      window.vs.organismToggle.css("background-image", window.vs.assets.toggleOff);
      
      if(typeof onComplete != 'undefined') onComplete();
   });
};

/**
 * This method gets data on sample types from the server
 * Note that some of the code in this function will run asynchronously from the
 * main thread
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.getAllSampleTypeData = function(onComplete) {
   var uri = window.vs.serverURI + "all_sample_type_data";
   
   jQuery.ajax({
      url: uri,
      type: 'POST',
      async: true
   }).done(function(data){
      var jsonObject = jQuery.parseJSON(data);
      console.log("******************************");
      console.log("sample type data gotten from the server");
      console.log("x size of dataset = ",jsonObject.sample_types.length);
      window.vs.data.sampleTypes = jsonObject.sample_types;
      
      for(var index = 0; index < window.vs.data.sampleTypes.length; index++){
         window.vs.filters.sampleTypes.push(window.vs.data.sampleTypes[index].count);
      }
      
      window.vs.updateLoadingProgress();
      
      window.vs.sampleTypesToggle.css("background-image", window.vs.assets.toggleOff);
      
      if(typeof onComplete != 'undefined') onComplete();
   });
};

/**
 * This method adds projects from the server to the project list html element
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.showSampleTypes = function() {
   var sampleTypes = window.vs.data.sampleTypes;
   
   for(var stIndex = 0; stIndex < sampleTypes.length; stIndex++) {
      
      var checked = "";
      if(jQuery.inArray(sampleTypes[stIndex].count, window.vs.filters.sampleTypes) != -1) checked = "checked";
      
      var stHTML = "<input type='checkbox' id='sample_type_"+sampleTypes[stIndex].count+"' "+checked+" />"+ sampleTypes[stIndex].sample_type_name + "<br />";
      console.log(stHTML);
      
      window.vs.sampleTypesList.append(stHTML);
      
      jQuery("#sample_type_"+sampleTypes[stIndex].count).change({stIndex:stIndex}, function(e){
         window.vs.sampleTypesToggle.css("background-image", window.vs.assets.loading);
         
         var stIndex = e.data.stIndex;
         var stId = window.vs.data.sampleTypes[stIndex].count;
         
         if(this.checked == true){//add organimsId to filters
            window.vs.filters.sampleTypes.push(stId);
         }
         else {
            window.vs.filters.sampleTypes.splice(jQuery.inArray(stId, window.vs.filters.sampleTypes),1);
         }
         
         window.setTimeout(window.vs.filter, 100);
         //window.vs.filterOrganisms(organismIndex, this.checked);
      });
   }
};

/**
 * This method adds projects from the server to the project list html element
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.showOrganisms = function() {
   var organisms = window.vs.data.organisms;
   
   for(var organismIndex = 0; organismIndex < organisms.length; organismIndex++) {
      
      var checked = "";
      if(jQuery.inArray(organisms[organismIndex].org_id, window.vs.filters.organisms) != -1) checked = "checked";
      
      var organismHTML = "<input type='checkbox' id='organism_"+organisms[organismIndex].org_id+"' "+checked+" />"+ organisms[organismIndex].org_name + "<br />";
      
      window.vs.organismList.append(organismHTML);
      
      jQuery("#organism_"+organisms[organismIndex].org_id).change({organismIndex:organismIndex}, function(e){
         window.vs.organismToggle.css("background-image", window.vs.assets.loading);
         
         var organismIndex = e.data.organismIndex;
         var orgId = window.vs.data.organisms[organismIndex].org_id;
         
         if(this.checked == true){//add organimsId to filters
            window.vs.filters.organisms.push(orgId);
         }
         else {
            window.vs.filters.organisms.splice(jQuery.inArray(orgId, window.vs.filters.organisms),1);
         }
         
         window.setTimeout(window.vs.filter, 100);
         //window.vs.filterOrganisms(organismIndex, this.checked);
      });
   }
};

/**
 * This method adds projects from the server to the project list html element
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.showProjects = function() {
   var projects = window.vs.data.projects;
   
   for(var projectIndex = 0; projectIndex < projects.length; projectIndex++) {
      
      var checked = "";
      
      if(jQuery.inArray(projects[projectIndex].val_id, window.vs.filters.projects) != -1) checked = "checked";
      
      var projectHTML = "<input type='checkbox' id='project_"+projects[projectIndex].val_id+"' " + checked + " />"+ projects[projectIndex].value + "<br />";
      
      window.vs.projectList.append(projectHTML);
      
      jQuery("#project_"+projects[projectIndex].val_id).change({projectIndex:projectIndex}, function(e){
         window.vs.projectToggle.css("background-image", window.vs.assets.loading);
         console.log(window.vs.assets.loading);
         
         var projectIndex = e.data.projectIndex;
         var projectId = window.vs.data.projects[projectIndex].val_id;
         
         if(this.checked == true){
            window.vs.filters.projects.push(projectId);
         }
         else {
            window.vs.filters.projects.splice(jQuery.inArray(projectId, window.vs.filters.projects),1);
         }
         
         window.setTimeout(window.vs.filter, 100);
      });
   }
};

VisualizeSamples.prototype.filter = function() {
   console.log("filter called");
   console.log("size of filterIn before = ", window.vs.data.filterIn.length);
   console.log("size of filterOut before = ", window.vs.data.filterOut.length);
   
   var projI = ":" + window.vs.filters.projects.join(":") + ":";
   console.log("project search index = ", projI);
   var orgI = ":" + window.vs.filters.organisms.join(":") + ":";
   console.log("organism search index = ", orgI);
   var stI = ":" + window.vs.filters.sampleTypes.join(":") + ":";
   console.log("sample type index = ",stI);
   
   var histogram = new Array();
   
   for(var index = 0; index < window.vs.data.filterIn.length; index++){
      //check if element meets all the criteria
      
      if(projI.indexOf(":" + window.vs.data.filterIn[index].Project + ":") == -1 ){//sample's project not part of filter
         window.vs.data.filterOut.push(window.vs.data.filterIn[index]);
         window.vs.data.filterIn.splice(index, 1);
         index--;
         continue;
      }
      
      if(orgI.indexOf(":" + window.vs.data.filterIn[index].org + ":") == -1){
         window.vs.data.filterOut.push(window.vs.data.filterIn[index]);
         window.vs.data.filterIn.splice(index, 1);
         index--;
         continue;
      }
      
      if(stI.indexOf(":" + window.vs.data.filterIn[index].sample_type + ":")) {
         window.vs.data.filterOut.push(window.vs.data.filterIn[index]);
         window.vs.data.filterIn.splice(index, 1);
         continue;
      }
      
      //if has reached this point then it passes all curr sample passes all filters
      //add to histogram
      var sampleDate = window.vs.data.filterIn[index].date_created.split(" ")[0];//get only the date and discard the time
      var unixTimestamp = new Date(sampleDate).getTime();
      
      if(typeof histogram[unixTimestamp] == 'undefined') {
         histogram[unixTimestamp] = 1;
      }
      else {
         histogram[unixTimestamp]++;
      }
   }
   
   console.log("size of filterIn katikati = ", window.vs.data.filterIn.length);
   console.log("size of filterOut katikati = ", window.vs.data.filterOut.length);
   
   for(var index = 0; index < window.vs.data.filterOut.length; index++){
      
      if(window.vs.filters.projects.length > 0 && projI.indexOf(":" + window.vs.data.filterOut[index].Project + ":") == -1 ){//sample's project not part of filter
         //console.log(":" + window.vs.data.filterOut[index].Project + ":");
         continue;
      }
      if(window.vs.filters.organisms.length > 0 && orgI.indexOf(":" + window.vs.data.filterOut[index].org + ":") == -1){
         //console.log(":" + window.vs.data.filterOut[index].org + ":");
         continue;
      }
      if(window.vs.filters.sampleTypes.length > 0 && stI.indexOf(":" + window.vs.data.filterOut[index].sample_type + ":") == -1){
         console.log("f");
         continue;
      }
      
      //if we have reached this far, it means the sample passes all filters
      var allFilters = window.vs.filters.organisms.length + window.vs.filters.projects.length + window.vs.filters.sampleTypes.length;
      
      if(allFilters > 0){
         window.vs.data.filterIn.push(window.vs.data.filterOut[index]);
         
         //add to histogram
         var sampleDate = window.vs.data.filterOut[index].date_created.split(" ")[0];//get only the date and discard the time
         var unixTimestamp = new Date(sampleDate).getTime();

         if(typeof histogram[unixTimestamp] == 'undefined') {
            histogram[unixTimestamp] = 1;
         }
         else {
            histogram[unixTimestamp]++;
         }
         
         window.vs.data.filterOut.splice(index, 1);
         index--;
      }
   }
   
   var sampleLabel = " Samples";
   if(window.vs.data.filterIn.length == 1) sampleLabel = " Sample";
   
   window.vs.sampleCountDialog.show();
   window.vs.sampleCountDialog.html(window.vs.data.filterIn.length + sampleLabel);
   
   console.log("size of filterIn after = ", window.vs.data.filterIn.length);
   console.log("size of filterOut after = ", window.vs.data.filterOut.length);
   window.vs.refreshHeatmap();
   window.vs.initTimeline(histogram);
   
   window.vs.resetFilterIcons();
   console.log("done");
};

VisualizeSamples.prototype.resetFilterIcons = function() {
   if(window.vs.filters.projects.length == 0){
      window.vs.projectToggle.css("background-image", window.vs.assets.toggleOn);
   }
   else {
      window.vs.projectToggle.css("background-image", window.vs.assets.toggleOff);
   }

   if(window.vs.filters.organisms.length == 0){
      window.vs.organismToggle.css("background-image", window.vs.assets.toggleOn);
   }
   else {
      window.vs.organismToggle.css("background-image", window.vs.assets.toggleOff);
   }

   if(window.vs.filters.sampleTypes.length == 0){
      window.vs.sampleTypesToggle.css("background-image", window.vs.assets.toggleOn);
   }
   else {
      window.vs.sampleTypesToggle.css("background-image", window.vs.assets.toggleOff);
   }
};

VisualizeSamples.prototype.refreshHeatmap = function(){
   console.log("refreshHeatmap called");
   
   window.vs.layers.heatmapLayer._latlngs = new Array();
   
   var samplesData = window.vs.data.filterIn;
   for(var index = 0; index < samplesData.length; index++){
      //console.log(L.latLng(samplesData[index].Latitude, samplesData[index].Longitude));
      
      window.vs.layers.heatmapLayer._latlngs.push(new L.latLng(samplesData[index].Latitude, samplesData[index].Longitude));
      
//      if(index % 500 == 0) window.vs.layers.heatmapLayer.redraw();
   }
   
   window.vs.layers.heatmapLayer.redraw();
};

VisualizeSamples.prototype.toggleProjects = function(){
   
   if(window.vs.data.projects.length > 0){
      var isVisible = true;
      if(jQuery("#project_"+window.vs.data.projects[0].val_id).length == 0) isVisible = false;
      
      if(isVisible == true) {
         window.vs.projectList.empty();
         window.vs.projectContainer.css("z-index",2);
      }
      else {
         window.vs.organismList.empty();
         window.vs.sampleTypesList.empty();
         //window.vs.organismContainer.hide();
         window.vs.projectContainer.css("z-index",3);
         window.vs.organismContainer.css("z-index",2);
         window.vs.sampleTypesContainer.css("z-index",2);
         window.vs.showProjects();
      }
   }
};

VisualizeSamples.prototype.toggleOrganisms = function() {
   if(window.vs.data.organisms.length > 0){
      var isVisible = true;
      if(jQuery("#organism_"+window.vs.data.organisms[0].org_id).length == 0) isVisible = false;
      
      if(isVisible == true) {
         window.vs.organismList.empty();
         window.vs.organismContainer.css("z-index",2);
      }
      else {
         window.vs.projectList.empty();
         window.vs.sampleTypesList.empty();
         //window.vs.projectContainer.hide();
         window.vs.organismContainer.css("z-index",3);
         window.vs.projectContainer.css("z-index",2);
         window.vs.sampleTypesContainer.css("z-index",2);
         window.vs.showOrganisms();
      }
   }
};

VisualizeSamples.prototype.toggleSampleTypes = function(){
   if(window.vs.data.sampleTypes.length > 0){
      var isVisible = true;
      if(jQuery("#sample_type_"+window.vs.data.sampleTypes[0].count).length == 0) isVisible = false;
      
      if(isVisible == true) {
         window.vs.sampleTypesList.empty();
         window.vs.sampleTypesContainer.css("z-index",2);
      }
      else {
         window.vs.projectList.empty();
         window.vs.organismList.empty();
         //window.vs.projectContainer.hide();
         window.vs.sampleTypesContainer.css("z-index",3);
         window.vs.projectContainer.css("z-index",2);
         window.vs.organismContainer.css("z-index",2);
         window.vs.showSampleTypes();
      }
   }
};

VisualizeSamples.prototype.initTimeline = function(histogram){
   console.log("initTimeline called");
   
   var plot = function(){
      var histKeys = Object.keys(histogram);
   
      histKeys.sort(function(a, b){
         if(parseInt(a) > parseInt(b)) return 1;
         else if(parseInt(a) < parseInt(b)) return -1;
         else return 0;
      });//sort keys in ascending order. Remember keys are unix timestamps

      var plotData = "x,y\n";
      for(var index = 0; index < histKeys.length; index++){
         var date = new Date(parseInt(histKeys[index]));
         plotData = plotData + date.toString() + "," + histogram[parseInt(histKeys[index])] + "\n";
      }

      // This function draws bars for a single series. See
         // multiColumnBarPlotter below for a plotter which can draw multi-series
         // bar charts.


      var graphObject = new Dygraph(window.vs.timeline[0], plotData,{
         drawGrid: false,
         drawYAxis: false,
         plotter: function(e){
            var ctx = e.drawingContext;
            var points = e.points;
            var y_bottom = e.dygraph.toDomYCoord(0);

            // The RGBColorParser class is provided by rgbcolor.js, which is
            // packed in with dygraphs.
            /*var color = new RGBColorParser(e.color);
            color.r = Math.floor((255 + color.r) / 2);
            color.g = Math.floor((255 + color.g) / 2);
            color.b = Math.floor((255 + color.b) / 2);*/
            ctx.fillStyle = "#006064";

            // Find the minimum separation between x-values.
            // This determines the bar width.
            var min_sep = Infinity;
            for (var i = 1; i < points.length; i++) {
              var sep = points[i].canvasx - points[i - 1].canvasx;
              if (sep < min_sep) min_sep = sep;
            }
            var bar_width = Math.floor(2.0 / 3 * min_sep);

            // Do the actual plotting.
            for (var i = 0; i < points.length; i++) {
              var p = points[i];
              var center_x = p.canvasx;

              ctx.fillRect(center_x - bar_width / 2, p.canvasy,
                  bar_width, y_bottom - p.canvasy);

              ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
                  bar_width, y_bottom - p.canvasy);
            }
         },
         xAxisLabelFormatter: function(d, gran) {
            return Dygraph.zeropad(d.getMonth() + 1) + "/" + Dygraph.zeropad(d.getYear() + 1900);
         },
         axisLabelColor: "#006064"
      });
   };
   
   window.vs.timeline.empty();
   
   var tHeight = window.innerHeight * 0.075;
   
   if(window.vs.data.filterIn.length == 0){
      window.vs.timeline.animate({
         height: "0px",
         top: window.innerHeight + "px",
         background: "#e0f7fa"
      }, 400, "swing", function(){window.vs.timeline.hide();});
   }
   else {
      if(window.vs.timeline.is(":visible")) {
         plot();
      }
      else {//timeline is not showing. means that there was nothing to plot the last time
         window.vs.timeline.show();
         window.vs.timeline.animate({
            height: tHeight + "px",
            top: (window.innerHeight - tHeight)+"px",
            background: "#e0f7fa"
         }, 400, "swing", plot);
      }
   }
   
};
