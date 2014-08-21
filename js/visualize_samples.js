/**
 * The constructor for this object
 * 
 * @returns {VisualizeSamples}
 */
function VisualizeSamples() {
   console.log("VisualizeSamples constructing");
   window.vs = this;//not a hack. Way around the ambigous nature of this keyword in javascript
   
   //initialize the html components to be used in this object
   window.vs.mapCanvas = jQuery("#sample_map_canvas");
   window.vs.timeline = jQuery("#sample_timeline");
   window.vs.projectList = jQuery("#project_list");
   
   //initialize data objects
   window.vs.data = {};
   window.vs.serverURI = "mod_visualize_samples.php?do=ajax&action=";
   window.vs.getAllSampleData(window.vs.showDefaultHeatMap);
   window.vs.getAllProjectData(window.vs.showProjects);
   
   //initialize the map
   window.vs.initMap();
   window.vs.getGeoLocation(function(position) {
      window.vs.setMapCenter(position);
   });
   
   //create handlers
   //handler for window resize
   jQuery(window).resize(window.vs.windowResized);
};

/**
 * This method initializes the map
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.initMap = function(){
   console.log("initMap called");
   
   var location = [0, 0];//default location
   
   window.vs.map = new ol.Map({
      target: window.vs.mapCanvas[0].id,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.MapQuest({layer: 'osm'})
        })
      ],
      view: new ol.View({
        center: ol.proj.transform(location, 'EPSG:4326', 'EPSG:3857'),
        zoom: 8
      })
   });
};

/**
 * This  method sets the center for the map
 * @returns {undefined}
 */
VisualizeSamples.prototype.setMapCenter = function(geoLocation) {
   console.log("setMapCenter called");
   
   var location = [36.8167, 1.2833];//default location is Nairobi
   if(typeof geoLocation != 'undefined') {
      location = [geoLocation.coords.longitude, geoLocation.coords.latitude]
   }
   
   window.vs.map.getView().setCenter(ol.proj.transform(location, 'EPSG:4326', 'EPSG:3857'));
};

/**
 * This method is called whenever the window is resized
 * @returns {undefined}
 */
VisualizeSamples.prototype.windowResized = function(){
   console.log("windowResized called");
   
   var height = window.innerHeight;
   console.log("  window height = ", height);
   var width = window.innerWidth;
   console.log("  window width = ", width);
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
      console.log("data gotten from the server");
      console.log("x size of dataset = ",jsonObject.samples.length);
      window.vs.data.samples = window.vs.getGeoJSON(jsonObject.samples);
      
      if(typeof onComplete != 'undefined')  onComplete();
   });
};

VisualizeSamples.prototype.showDefaultHeatMap = function(){
   console.log("showDefaultHeatMap called");
   
   var samplesToDisplay = [];
   
   var extent = window.vs.getMapExtent();
   
   var coordinateArray = new Array();
   
   for(var sIndex = 0; sIndex < window.vs.data.samples.features.length; sIndex++) {
      
      var genPixel = window.vs.map.getPixelFromCoordinate(window.vs.data.samples.features[sIndex].geometry.coordinates);
      genPixel[0] = Math.floor(genPixel[0]);
      genPixel[1] = Math.floor(genPixel[1]);
      
      var genCoord = window.vs.map.getCoordinateFromPixel(genPixel);
      if(jQuery.inArray(genCoord, coordinateArray) == -1){
         if(ol.extent.containsCoordinate(extent, genCoord)){
            var tmp = window.vs.data.samples.features[sIndex];
            tmp.geometry.coordinates = genCoord;
            samplesToDisplay.push(tmp);
            coordinateArray.push(genCoord);
         }
      }
   }
   
   var geoJSON = {
      type: window.vs.data.samples.type,
      features: samplesToDisplay,
      crs: window.vs.data.samples.crs
   };
   
   console.log("x visible geoJSON", geoJSON);
   
   var olJSON = new ol.source.GeoJSON(({object:geoJSON}));
   var heatMapLayer = new ol.layer.Heatmap({
      source: olJSON,
      radius: 2
   });
   
   //heatMapLayer.setExtent(extent);
   
   //console.log("x heatMapLayer = ", heatMapLayer);
   window.vs.map.addLayer(heatMapLayer);
};

VisualizeSamples.prototype.showHeatMap = function() {
   console.log("showHeatMap called");
   
   //1 get the general area represented by a pixel
   
   //2 generalize the coordinates
   //3 check if generalized coordinate is in list of added list
   //4 visualize
};

VisualizeSamples.prototype.getGeoJSON = function(sampleData) {
   //TODO: show loading thingy
   console.log("getGeoJSON called");
   console.log("x Number of samples", sampleData.length);
   
   var geoJSON = {
      type:'FeatureCollection',
      /*totalFeatures: sampleData.length,*/
      features:[],
      crs: {
         type: "EPSG",
         properties : {
            name: "EPSG:8357"
         }
      }
   };
   
   var extent = window.vs.getMapExtent();
   
   for(var sampleIndex = 0; sampleIndex < sampleData.length; sampleIndex++){
      var currCoordinate = ol.proj.transform([sampleData[sampleIndex].Longitude, sampleData[sampleIndex].Latitude], 'EPSG:4326', 'EPSG:3857');

      //if(ol.extent.containsCoordinate(extent, currCoordinate)){
      geoJSON.features.push({
         type: "Feature",
         geometry: {
            type:'Point',
            coordinates: currCoordinate
            /*coordinates: [4e6, -5e6]*/
         },
         properties: sampleData[sampleIndex]
      });
      //}
      //if(sampleIndex == 10) break;
      //TODO: update progress dialog
   }
   
   console.log("x geoJson", geoJSON);
   
   return geoJSON;
};

/**
 * This method gets the brower's geolocation
 */
VisualizeSamples.prototype.getGeoLocation = function(postExecute) {
   if(navigator.geolocation){//HTML5 stuff
      navigator.geolocation.getCurrentPosition(postExecute);
   }
   else {
      postExecute;
   }
};

/**
 * This method gets the bounds of the map currently visible to the user
 */
VisualizeSamples.prototype.getMapExtent = function(){
   console.log("getMapExtent called");
   /*var topLeftPixel = new ol.Pixel();
   console.log(topLeftPixel);*/
   /*var topLeft = window.vs.map.getCoordinateFromPixel([0,0]);
   console.log("top left coordinate", topLeft);
   
   var bottomRight = window.vs.map.getCoordinateFromPixel([window.vs.mapCanvas.width(),window.vs.mapCanvas.height()]);
   console.log("bottom right coordinate", bottomRight);*/
   
   /*return {top:topLeft, bottom:bottomRight};*/
   
   return window.vs.map.getView().calculateExtent([window.vs.mapCanvas.width(),window.vs.mapCanvas.height()]);
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
      console.log("data gotten from the server");
      console.log("x size of dataset = ",jsonObject.projects.length);
      window.vs.data.projects = jsonObject.projects;
      
      if(typeof onComplete != 'undefined') onComplete();
   });
};

/**
 * This method adds projects from the server to the project list html element
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.showProjects = function() {
   var projects = window.vs.data.projects;
   
   for(var projectIndex = 0; projectIndex < projects.length; projectIndex++) {
      var projectHTML = "<input type='checkbox' id='project_"+projects[projectIndex].val_id+"' />";
      var projectJQ = jQuery(projectHTML);
      
      projectJQ.change(function(e){
         console.log(e);
      });
      window.vs.projectList.append(projectJQ[0].outerHTML + projects[projectIndex].value + "<br />");
   }
};

/**
 * This method filters samples to be displayes from the main samples array
 * 
 * @returns {undefined}
 */
VisualizeSamples.prototype.filterSamples = function(){
   
};