function LITS() {
   window.lits = this;
   //initialize general variables
   window.lits.serverURL = "?do=ajax&action=";
   window.lits.data = {};
   window.lits.data.odkForms = new Array();
   window.lits.data.tmp = {};
   window.lits.data.tmp.selectedForms = new Array();
   window.lits.data.tmp.mvmntLastIndex = -1;
   window.lits.data.tmp.schemas = {};//stores the database schemas for the selected odk forms selected to make up a set
   /*
    * window.lits.data.animals[0].ids[idIndex]
    *                            .points[0].latitude
    *                                      .longitude
    *                                      .time
    */
   window.lits.data.animals = new Array();//stores animals and the points where animals have been through like this
   
   //initialize html objects to be used
   window.lits.mapCanvas = jQuery("#map");
   
   window.lits.setSelectionCtnr = jQuery("#set_select_container");
   window.lits.setSelectionCtnr.hide();
   window.lits.setSelectionList = jQuery("#set_select_list");
   window.lits.setSelectionBtn = jQuery("#set_select_btn");
   
   window.lits.setModCtnr = jQuery("#set_mod_container");
   window.lits.setModName = jQuery("#set_mod_name");
   window.lits.setModIDs = jQuery("#set_mod_ids");
   window.lits.setModIDsList = jQuery("#set_mod_id_list");
   window.lits.setModIDBtn = jQuery("#set_mod_id_btn");
   window.lits.setModLoc = jQuery("#set_mod_loc");
   window.lits.setModLocLat = jQuery("#set_mod_loc_lat");
   window.lits.setModLocLon = jQuery("#set_mod_loc_lon");
   window.lits.setModTimeValue = jQuery("#set_mod_time_value");
   window.lits.setModLocalityValue = jQuery("#set_mod_locality_value");
   window.lits.setModBtn = jQuery("#set_mod_btn");
   
   window.lits.idModCtnr = jQuery("#id_mod_container");
   window.lits.idModName = jQuery("#id_mod_name");
   window.lits.idModSelections = jQuery("#id_mod_selections");
   window.lits.idModIndex = jQuery("#id_mod_index");
   window.lits.idModAddBtn = jQuery("#id_mod_add_btn");
   window.lits.idModCancelBtn = jQuery("#id_mod_cancel_btn");
   
   window.lits.genModCtnr = jQuery("#gen_mod_container");
   window.lits.genModName = jQuery("#gen_mod_name");
   window.lits.genModSelections = jQuery("#gen_mod_selections");
   window.lits.genModAddBtn = jQuery("#gen_mod_add_btn");
   window.lits.genModCancelBtn = jQuery("#gen_mod_cancel_btn");
   window.lits.genModMode = jQuery("#gen_mod_mode");
   //window.lits.mvmtTimeline = jQuery("#mvmt_timeline");
   window.lits.mvmtTimeline = jQuery("#mvmt_timeline");
   window.lits.mvmtWindow = jQuery("#mvmt_window");
   window.lits.mvmtWindow.hide();
   window.lits.loadingBox = jQuery("#loading_box");
   window.lits.searchBox = jQuery("#search_box_3d");
   window.lits.searchCanvas = jQuery("#lits_search_res");
   window.lits.animalDetails = jQuery("#animal_details");
   window.lits.animalDetailsWndw = jQuery("#animal_details_wndw");
   window.lits.animalDetailsId = jQuery("#animal_details_id");
   window.lits.polylines = [];
   window.lits.markers = [];
   window.lits.localityLabels = [];
   window.lits.mvmtData = null;
   window.lits.mvmtSettings = null;
   window.lits.showDataPointsBtn = jQuery("#show_data_points");
   window.lits.showDataPointsBtn.hide();
   window.lits.showVillageHeatmapBtn = jQuery("#show_village_heatmap");
   window.lits.showAbnormalData = jQuery("#show_abnormal_res");
   window.lits.showVillageHeatmapBtn.hide();
   window.lits.showAbnormalData.hide();
   window.lits.tooltip = jQuery("#mvmt_ttip");
   window.lits.heatmap = null;
   window.lits.villageCoords = [];
   window.lits.searchResults = [];
   window.lits.abnormalResults = [];
   window.lits.visSearchTimeout = 0;
   window.lits.abnormalResShowing = false;
   /*
    * how the forms object looks like:
    * 
    *    forms[formID].ids[idIndex] - where in SQL the nth id used is stored in form m
    *                 .longitude    - where in SQL the longitude is stored in form m
    *                 .latitude     - where in SQL the latitude is stored in form m
    *                 .time         - where in SQL the time is stored in form m
    *                 .locality     - where in SQL the locality (name of geo location) is stored in form m
    */
   window.lits.forms = {};
   window.lits.data.ids = new Array();//this object stores the name and index of an id. the index should be what is used in the sets[setIndex].forms[formID].ids array
   
   window.lits.initMap();
   
   //run initialization code
   window.lits.getSetSelectionData();
   
   window.lits.windowResized();
   jQuery(window).resize(window.lits.windowResized);
   
   window.lits.setSelectionBtn.click(function () {
      window.lits.setSelectionBtnClicked();
   });
   
   window.lits.setModIDBtn.click(function() {
      window.lits.setModIDBtnClicked();
   });
   
   window.lits.idModAddBtn.click(function() {
      window.lits.idModAddBtnClicked();
   });
   
   window.lits.idModCancelBtn.click(function() {
      window.lits.idModCtnr.hide();
   });
   
   window.lits.setModLocLat.click(function() {
      window.lits.setModLocLatClicked();
   });
   
   window.lits.setModLocLon.click(function() {
      window.lits.setModLocLonClicked();
   });
   
   window.lits.setModTimeValue.click(function() {
      window.lits.setModTimeClicked();
   });
   
   window.lits.setModLocalityValue.click(function() {
      window.lits.setModLocalityClicked();
   });
   
   window.lits.genModAddBtn.click(function() {
      window.lits.genModAddBtnClicked();
   });
   
   window.lits.genModCancelBtn.click(function() {
      window.lits.genModCtnr.hide();
   });
   
   window.lits.setModBtn.click(function () {
      console.log("setModBtn clicked");
      window.lits.setModBtnClicked();
   });
   
   window.lits.showAbnormalData.click(function() {
      window.lits.visualizeAbnormalResults();
   });
   window.lits.searchBox.keyup(function(){
      window.lits.searchCanvas.empty();
      if(window.lits.searchBox.val().length > 0){
         window.lits.search(window.lits.searchBox.val());
      }
      else {
         window.lits.searchCanvas.hide();
         window.lits.visualizeAnimalData();
         window.lits.animalDetailsWndw.hide();
      }
   });
   
   window.lits.showDataPointsBtn.click(function(){
      window.lits.populateTimeline();
   });
   window.lits.showVillageHeatmapBtn.click(function() {
      window.lits.toggleVillageHeatmap();
   });
   jQuery(document).ready(function(){
      window.lits.loadingBox.show();
      setTimeout(function(){
         var formData = {
            lits_market:{
               ids:[
                  "lits_market*lits_market_animal_details*animal_details-eartag_number"
               ],
               latitude: "lits_market*lits_market_core*gps_coord-Latitude",
               longitude: "lits_market*lits_market_core*gps_coord-Longitude",
               locality: "lits_market*lits_market_core*which_current_market",
               time: "lits_market*lits_market_core*start"
            },
            lits_slaughter:{
               ids:[
                  "lits_slaughter*lits_slaughter_animal_details*animal_details-eartag_number"
               ],
               latitude: "lits_slaughter*lits_slaughter_core*gps_coord-Latitude",
               longitude: "lits_slaughter*lits_slaughter_core*gps_coord-Longitude",
               locality: "lits_slaughter*lits_slaughter_core*which_slaughterhouse",
               time: "lits_slaughter*lits_slaughter_core*start"
            }
         };
         window.lits.setModBtnClicked(formData);
      },5000);
      window.lits.loadingBox.hide();
   });
}

LITS.prototype.toggleVillageHeatmap = function() {
   if(window.lits.heatmap._latlngs.length == 0) {//no villages in heatmap
      window.lits.redrawHeatmap();
      window.lits.showVillageHeatmapBtn.html("Hide source villages");
   }
   else {
      window.lits.heatmap._latlngs = new Array();
      window.lits.heatmap.redraw();
      window.lits.showVillageHeatmapBtn.html("Show source villages");
   }
};

LITS.prototype.redrawHeatmap = function() {
   window.lits.heatmap._latlngs = new Array();
   for(var index = 0; index < window.lits.villageCoords.length; index++) {
      window.lits.heatmap._latlngs.push(window.lits.villageCoords[index]);
   }
   window.lits.heatmap.redraw();
};

/**
 * This method is called whenever the window is resized.
 * Put any code that will reinitialize html elements' sizes here
 * 
 * @returns {undefined}
 */
LITS.prototype.windowResized = function () {
   console.log("window resized called");
   
   var wHeight = window.innerHeight;
   var wWidth = window.innerWidth;
   
   window.lits.setSelectionCtnr.css("left", ((wWidth/2) - (window.lits.setSelectionCtnr.width() / 2)) + "px");
   window.lits.setSelectionCtnr.css("top", ((wHeight/2) - (window.lits.setSelectionCtnr.height() / 2)) + "px");
   
   window.lits.setModCtnr.css("left", ((wWidth/2) - (window.lits.setModCtnr.width() / 2)) + "px");
   window.lits.setModCtnr.css("top", ((wHeight/2) - (window.lits.setModCtnr.height() / 2)) + "px");
   
   window.lits.idModCtnr.css("left", ((wWidth/2) - (window.lits.idModCtnr.width() / 2)) + "px");
   window.lits.idModCtnr.css("top", ((wHeight/2) - (window.lits.idModCtnr.height() / 2)) + "px");
   
   window.lits.genModCtnr.css("left", ((wWidth/2) - (window.lits.genModCtnr.width() / 2)) + "px");
   window.lits.genModCtnr.css("top", ((wHeight/2) - (window.lits.genModCtnr.height() / 2)) + "px");
   
   window.lits.loadingBox.css("left", ((wWidth/2) - (window.lits.loadingBox.width() / 2)) + "px");
   window.lits.loadingBox.css("top", ((wHeight/2) - (window.lits.loadingBox.height() / 2)) + "px");
   var mvmtWindowPos = {
      y:(window.innerHeight/2 - window.lits.mvmtWindow.height()/2)+"px",
      x:(window.innerWidth/2 - window.lits.mvmtWindow.width()/2)+"px"
   };
   window.lits.mvmtWindow.jqxWindow({height: window.innerHeight+"px", width: window.innerWidth+"px", position: mvmtWindowPos, theme: ''});
   window.lits.showDataPointsBtn.css("top", "20px");
   window.lits.showVillageHeatmapBtn.css("top", "60px");
   window.lits.showAbnormalData.css("top", "100px");
   var animalDetailsWindowPos = {
      y:(window.innerHeight/2 - window.lits.animalDetailsWndw.height()/2)+"px",
      x:(window.innerWidth/2 - window.lits.animalDetailsWndw.width()/2)+"px"
   };
   window.lits.animalDetailsWndw.jqxWindow({height: window.innerHeight+"px", width: window.innerWidth+"px", position: animalDetailsWindowPos, theme: ''});
};

/**
 * This method is called whenever the button in select set dialog is clicked
 * 
 * @returns {undefined}
 */
LITS.prototype.setSelectionBtnClicked = function() {
   console.log("setSelectionBtnClicked called");
   
   //send to the server the form ids, it should return the schemas of the forms (tables with the columns in the tables)
   /*var schemas = window.lits.getDataFromServer("get_form_schemas", false, {forms: window.lits.data.tmp.selectedForms}).schemas;
   
   window.lits.data.tmp.schemas = schemas;
   
   window.lits.setSelectionCtnr.hide();
   
   window.lits.showSetModDiv();*/
   
   window.lits.getDataFromServer("get_form_schemas", true, {forms: window.lits.data.tmp.selectedForms}, function(data){
      var schemas = data.schemas;
      window.lits.data.tmp.schemas = schemas;
      
      window.lits.setSelectionCtnr.hide();
   
      window.lits.showSetModDiv();
   });
};

/**
 * This method creates the dialog for selecting a set
 * In this case a set is a set of odk forms that are
 * versions of the same tool
 * 
 * @returns {undefined}
 */
LITS.prototype.getSetSelectionData = function() {
   console.log("show set called");
   
   var odkFormIDs = window.lits.data.odkForms;
   if(odkFormIDs.length == 0) {
      /*odkFormIDs = window.lits.getDataFromServer("get_avail_forms", false, {}).forms;
      window.lits.data.odkForms = odkFormIDs;*/
      
      window.lits.getDataFromServer("get_avail_forms", true, {}, function(data){
         window.lits.data.odkForms = data.forms;
         window.lits.showSetSelectionDiv();
      });
   }
   else {
      window.lits.showSetSelectionDiv();
   }
   
   /*console.log("odk forms = ", odkFormIDs);
   for(var index = 0; index < odkFormIDs.length; index++){
      var formHTML = "<input type='checkbox' id='" + odkFormIDs[index].form_id + "' />" + odkFormIDs[index].form_id + "<br />";
     
      window.lits.setSelectionList.append(formHTML);
     
      jQuery("#"+odkFormIDs[index].form_id).change({id: odkFormIDs[index].form_id}, function(e){
         var formID = e.data.id;
         if(this.checked){
            window.lits.data.tmp.selectedForms.push(formID);
         }
         else {
            window.lits.data.tmp.selectedForms.splice(jQuery.inArray(formID, window.lits.data.tmp.selectedForms), 1);
         }
      });
   }*/
};

LITS.prototype.showSetSelectionDiv = function(){
   var odkFormIDs = window.lits.data.odkForms;
   for(var index = 0; index < odkFormIDs.length; index++){
      var formHTML = "<input type='checkbox' id='" + odkFormIDs[index].form_id + "' />" + odkFormIDs[index].form_id + "<br />";
     
      window.lits.setSelectionList.append(formHTML);
     
      jQuery("#"+odkFormIDs[index].form_id).change({id: odkFormIDs[index].form_id}, function(e){
         var formID = e.data.id;
         if(this.checked){
            window.lits.data.tmp.selectedForms.push(formID);
         }
         else {
            window.lits.data.tmp.selectedForms.splice(jQuery.inArray(formID, window.lits.data.tmp.selectedForms), 1);
         }
      });
   }
   
   var wWidth = window.innerWidth;
   var wHeight = window.innerHeight;
   window.lits.setSelectionCtnr.css("left", ((wWidth/2) - (window.lits.setSelectionCtnr.width() / 2)) + "px");
   window.lits.setSelectionCtnr.css("top", ((wHeight/2) - (window.lits.setSelectionCtnr.height() / 2)) + "px");
};

LITS.prototype.showSetModDiv = function() {
   window.lits.setModCtnr.show();
   //set the name of the set
   var setName = "Dataset";
   window.lits.setModName.html(setName);
   
   //clear the id list
   window.lits.setModIDsList.empty();
   
   //clear location
   window.lits.setModLocLat.html("Latitude: Not set");
   window.lits.setModLocLon.html("Longitude: Not set");
   
   //clear time
   window.lits.setModTimeValue.html("Not set");
   window.lits.setModLocalityValue.html("Not set");
};

LITS.prototype.setModIDBtnClicked = function(){
   window.lits.showIdModDiv();
   
   window.lits.idModCtnr.css("left", ((window.innerWidth/2) - (window.lits.idModCtnr.width()/2)));
   window.lits.idModCtnr.css("top", ((window.innerHeight/2) - (window.lits.idModCtnr.height()/2)));
};

LITS.prototype.showIdModDiv = function(idIndex) {
   
   //TODO: set value of radio boxes
   
   window.lits.idModCtnr.show();
   
   window.lits.idModSelections.empty();
   
   //add the fields from the different forms in this set to the selections container
   var formIDs = Object.keys(window.lits.data.tmp.schemas);
   
   if(typeof idIndex === 'undefined'){
      window.lits.idModName.val("");
      window.lits.idModAddBtn.html("Add");
      
//      if(typeof window.lits.forms[formIDs[0]] != 'undefined' && typeof window.lits.forms[formIDs[0]].ids != 'undefined'){
//         idIndex = window.lits.forms[formIDs[0]].ids.length;
//      }
//      else {
//         idIndex = 0;
//      }
      idIndex = window.lits.data.ids.length;
   }
   else {
      window.lits.idModName.val(window.lits.data.ids[idIndex]);
      window.lits.idModAddBtn.html("Modify");
   }
   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      var formTables = window.lits.data.tmp.schemas[formIDs[formIndex]];
      
      window.lits.idModIndex.val(idIndex);
      
      var formHTML = "<div class='id_mod_selection'><div style='font-size: 18px; font-style:bold;'>" +formIDs[formIndex]+ "</div></div>";
      var formJQ = jQuery(formHTML);
      
      var tableNames = Object.keys(formTables);
      
      for(var tableIndex = 0; tableIndex < tableNames.length; tableIndex++){
         var columns = formTables[tableNames[tableIndex]];
         
         for(var columnIndex = 0; columnIndex < columns.length; columnIndex++){
            var tableName = tableNames[tableIndex].replace(formIDs[formIndex]+"_", "");
            
            var coreRgx = /core.*/g;
            if(tableName.match(coreRgx)){
               tableName = "";
            }
            else {
               tableName = tableName + "-";
            }
            
            var columnName = tableName + columns[columnIndex].field.toLowerCase();
            var columnID = formIDs[formIndex] + "*" + tableNames[tableIndex] + "*" + columns[columnIndex].field;
            
            var checked = "";
            if(typeof window.lits.forms[formIDs[formIndex]] != 'undefined' && typeof window.lits.forms[formIDs[formIndex]].ids != 'undefined') {
               if(typeof window.lits.forms[formIDs[formIndex]].ids[idIndex] != 'undefined' && window.lits.forms[formIDs[formIndex]].ids[idIndex] == columnID){
                  checked = "checked";
               }
            }
            
            var columnHTML = "<input type='radio' name='"+formIDs[formIndex]+"' value='"+columnID+"' "+checked+" />"+columnName+"<br />";
            formJQ.append(columnHTML);
         }
      }
      
      window.lits.idModSelections.append(formJQ[0].outerHTML);
   }
};

LITS.prototype.idModAddBtnClicked = function(){
   var idIndex = window.lits.idModIndex.val();
   var idName = window.lits.idModName.val();
   
   var trimRegex = /(^\s+)|(\s+$)/g;
   idName.replace(trimRegex, "");
   
   if(idName.length > 0){
      window.lits.data.ids[idIndex] = idName;
      
      //check if li exists for the current id in the id mod_set_id_ul
      var idJQ = jQuery("#id_"+idIndex);
      if(idJQ.length > 0){//li had already been created, just modify it
         idJQ.html(idName);
      }
      else {
         idHTML = "<li id='id_" + idIndex + "' style='cursor:pointer;'>" + idName + "</li>";
         window.lits.setModIDsList.append(idHTML);
         
         jQuery("#id_"+idIndex).click({index:idIndex}, function(e){
            var idIndex = e.data.index;
            window.lits.showIdModDiv(idIndex);
         });
      }
      
      //get values for the id from the different forms
      var formIDs = Object.keys(window.lits.data.tmp.schemas);
      
      var goodForHiding = true;
      
      for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
         var currFormRadio = jQuery("input:radio[name='"+formIDs[formIndex]+"']:checked");
         var columnID = currFormRadio.val();
         if(typeof columnID != 'undefined'){
            var columnIndexes = columnID.split("*");
            if(columnIndexes.length == 3){//means you have the form id, table name and column name
               if(typeof window.lits.forms[columnIndexes[0]] == 'undefined') {
                  window.lits.forms[columnIndexes[0]] = {};
               }
               if(typeof window.lits.forms[columnIndexes[0]].ids == 'undefined'){
                  window.lits.forms[columnIndexes[0]].ids = new Array();
               }

               window.lits.forms[columnIndexes[0]].ids[idIndex] = columnID;
            }
            else {
               goodForHiding = false;
            }
         }
         else {
            goodForHiding = false;
         }
      }
      
      if(goodForHiding == true){
         window.lits.idModCtnr.hide();
      }
   }
   else {
      console.log("user needs to specify the id name");
   }
};

LITS.prototype.getAnimalData = function(animalIndex){
   var animal = window.lits.data.animals[animalIndex];
   
   var forms = window.lits.forms;
   window.lits.getDataFromServer("get_animal_data", true, {data:animal, forms: forms, animal_index:animalIndex}, function(animalData){
      window.lits.showAnimalData(animalData.data, animalData.animal_index);
   });
};

LITS.prototype.cleanAnimalData = function(animalData){
   /*
    * Remove:
    *       - columns that have null
    *       - meta columns (prefixed with a _)
    */
   var formIDs = Object.keys(animalData);
   
   var cleanData = {};
   
   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      cleanData[formIDs[formIndex]] = new Array();
      
      var currForm = animalData[formIDs[formIndex]];
      for(var rIndex = 0; rIndex < currForm.length; rIndex++){
         var currRow = currForm[rIndex];
         
         var columns = Object.keys(currRow);
         
         var rowData = {};
         
         for(var cIndex = 0; cIndex < columns.length; cIndex++){
            var metaRegex = /^_/g;
            if(columns[cIndex].match(metaRegex) == null){//not a meta column
               if(currRow[columns[cIndex]] != null){
                  rowData[columns[cIndex]] = currRow[columns[cIndex]];
               }
            }
         }
         
         cleanData[formIDs[formIndex]].push(rowData);
      }
   }
   
   return cleanData;
};

LITS.prototype.showAnimalData = function(animalData, animalIndex) {
   var cAnimalData = window.lits.cleanAnimalData(animalData);
   
   var formIDs = Object.keys(cAnimalData);
   
   window.lits.animalDetails.empty();
   window.lits.animalDetailsWndw.jqxWindow("setTitle", "");
   //add details on source village
   if(typeof window.lits.data.animals[animalIndex].src_village.name == 'undefined'
           || window.lits.data.animals[animalIndex].src_village.name == null
           || window.lits.data.animals[animalIndex].src_village.name.length == 0) {
      window.lits.animalDetails.append("<div style='font-size: 20px; margin-top: 10px; margin-bottom: 5px;'>Source village unknown</div>");
   }
   else {
      window.lits.animalDetails.append("<div style='font-size: 20px; margin-top: 10px; margin-bottom: 5px;'>Source village: "+window.lits.data.animals[animalIndex].src_village.name+"</div>");
   }
   var html = "";
   for(var fIndex = 0; fIndex < formIDs.length; fIndex++){
      var formHTML = "<div>";
      var formName = formIDs[fIndex];
      if(formIDs[fIndex] == "lits_market") formName = "Data from Markets";
      else if(formIDs[fIndex] == "lits_slaughter") formName = "Data from Slaughterhouse";
      formHTML = formHTML + "<div id='form_data_"+formIDs[fIndex]+"' style='font-size: 20px; margin-top: 10px; margin-bottom: 5px;'>" + formName + "</div>";
      var columns = {};
      var rows = cAnimalData[formIDs[fIndex]];
      //go through all the rows and move the data to the columns object
      for(var rIndex = 0; rIndex < rows.length; rIndex++){
         var rowColumns = Object.keys(rows[rIndex]);
         
         for(var cIndex = 0; cIndex < rowColumns.length; cIndex++){
            if(typeof columns[rowColumns[cIndex]] == 'undefined'){
               columns[rowColumns[cIndex]] = {};//because a row might not have all columns you dont want this to be an array and you pushing stuff into it
            }
            
            columns[rowColumns[cIndex]][rIndex] = rows[rIndex][rowColumns[cIndex]];
         }
      }
      
      var tHTML = "<table border='1' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'><tr>";
      var columnNames = Object.keys(columns);
      for(var cIndex = 0; cIndex < columnNames.length; cIndex++){
         tHTML = tHTML + "<th style='padding-left:3px; padding-right:3px; font-style:normal;'>" + columnNames[cIndex] + "</th>";
      }
      tHTML = tHTML + "</tr>";
      
      for(var rIndex = 0; rIndex < rows.length; rIndex++){
         tHTML = tHTML + "<tr>";
         for(var cIndex = 0; cIndex < columnNames.length; cIndex++){
            var value = columns[columnNames[cIndex]][rIndex];
            if(typeof value == "undefine") value = "";
            tHTML = tHTML + "<td>" + value + "</td>";
         }
         tHTML = tHTML + "</tr>";
      }
      
      tHTML = tHTML + "</table>";
      
      formHTML = formHTML + tHTML + "</div>";
      
      //window.lits.animalDetails.append(formHTML);
      html = html + formHTML;
   }
   
   var wWidth = window.innerWidth;
   var wHeight = window.innerHeight;
   
   /*window.lits.animalDetails.css("left", (wWidth - window.lits.animalDetails.width() - 100)+"px");
   window.lits.animalDetails.css("top", "0px");*/
   window.lits.animalDetailsWndw.jqxWindow("setContent", html);
   var animalDetailsWindowPos = {
      y:(window.innerHeight - window.lits.animalDetailsWndw.height() - 100)+"px",
      x:(window.innerWidth - window.lits.animalDetailsWndw.width() - 100)+"px"
   };
   window.lits.animalDetailsWndw.jqxWindow({height: "250px"});
   window.lits.animalDetailsWndw.jqxWindow("setTitle", window.lits.data.animals[animalIndex].ids[0]);
   window.lits.animalDetails.css("height", "88%");
   window.lits.animalDetailsWndw.show();
   window.lits.visualizeAnimalData([window.lits.data.animals[animalIndex]]);
};

LITS.prototype.setModLocLatClicked = function() {
   window.lits.showGenModDiv("Latitude");
};

LITS.prototype.setModLocLonClicked = function() {
   window.lits.showGenModDiv("Longitude");
};

LITS.prototype.setModTimeClicked = function() {
   window.lits.showGenModDiv("Time");
};

LITS.prototype.setModLocalityClicked = function() {
   window.lits.showGenModDiv("Locality");
};

LITS.prototype.showGenModDiv = function(mode){
   console.log("showGenModDiv called");
   
   window.lits.genModMode.val(mode);
   
   window.lits.genModName.html(mode);
   
   window.lits.genModCtnr.show();
   
   window.lits.genModSelections.empty();
   
   var formIDs = Object.keys(window.lits.data.tmp.schemas);
   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      var formTables = window.lits.data.tmp.schemas[formIDs[formIndex]];
      
      var formHTML = "<div class='gen_mod_selection'><div style='font-size: 18px; font-style:bold;'>" +formIDs[formIndex]+ "</div></div>";
      var formJQ = jQuery(formHTML);
      
      var tableNames = Object.keys(formTables);
      
      for(var tableIndex = 0; tableIndex < tableNames.length; tableIndex++){
         var columns = formTables[tableNames[tableIndex]];
         
         for(var columnIndex = 0; columnIndex < columns.length; columnIndex++){
            var tableName = tableNames[tableIndex].replace(formIDs[formIndex]+"_", "");
            
            var coreRgx = /core.*/g;
            if(tableName.match(coreRgx)){
               tableName = "";
            }
            else {
               tableName = tableName + "-";
            }
            
            var columnName = tableName + columns[columnIndex].field.toLowerCase();
            var columnID = formIDs[formIndex] + "*" + tableNames[tableIndex] + "*" + columns[columnIndex].field;
            
            var checked = "";
            if(typeof window.lits.forms[formIDs[formIndex]] != 'undefined' && typeof window.lits.forms[formIDs[formIndex]][mode.toLowerCase()] != 'undefined') {
               if(window.lits.forms[formIDs[formIndex]][mode.toLowerCase()] == columnID){
                  checked = "checked";
               }
            }
            
            var columnHTML = "<input type='radio' name='"+formIDs[formIndex]+"' value='"+columnID+"' "+checked+" />"+columnName+"<br />";
            formJQ.append(columnHTML);
         }
      }
      
      window.lits.genModSelections.append(formJQ[0].outerHTML);
      
      window.lits.genModCtnr.css("left", ((window.innerWidth/2) - (window.lits.genModCtnr.width()/2)));
      window.lits.genModCtnr.css("top", ((window.innerHeight/2) - (window.lits.genModCtnr.height()/2)));
   }
};

LITS.prototype.genModAddBtnClicked = function(){
   var mode = window.lits.genModMode.val();
   
   var formIDs = Object.keys(window.lits.data.tmp.schemas);
      
   var goodForHiding = true;

   var pairSet = true;

   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      var currFormRadio = jQuery("input:radio[name='"+formIDs[formIndex]+"']:checked");

      var columnID = currFormRadio.val();

      if(typeof columnID != 'undefined'){
         var columnIndexes = columnID.split("*");
         if(columnIndexes.length == 3){//means you have the form id, table name and column name
            if(typeof window.lits.forms[columnIndexes[0]] == 'undefined') {
               window.lits.forms[columnIndexes[0]] = {};
            }

            window.lits.forms[columnIndexes[0]][mode.toLowerCase()] = columnID;
            
            if(mode == "Latitude"){//try automatically setting longitude
               var latRegex = /_LAT$/g;
               
               if(columnID.match(latRegex) != null){
                  var lonColumn = columnID.replace(latRegex, '_LNG');
                  window.lits.forms[columnIndexes[0]].longitude = lonColumn;
               }
               else {
                  pairSet = false;
               }
            }
            
            else if(mode == "Longitude"){//try automatically setting longitude
               var lngRegex = /_LNG$/g;
               if(columnID.match(lngRegex) != null){
                  var latColumn = columnID.replace(latRegex, '_LAT');
                  window.lits.forms[columnIndexes[0]].latitude = latColumn;
               }
               else {
                  pairSet = false;
               }
            }
         }
         else {
            goodForHiding = false;
         }
      }
      else {
         goodForHiding = false;
      }
   }
   
   if(goodForHiding){
      window.lits.genModCtnr.hide();
      if(mode == "Latitude"){
         window.lits.setModLocLat.html("Latitude: Set");
         
         if(pairSet){
            window.lits.setModLocLon.html("Longitude: Set");
         }
      }
      else if(mode == "Longitude"){
         window.lits.setModLocLon.html("Longitude: Set");
         
         if(pairSet){
            window.lits.setModLocLat.html("Latitude: Set");
         }
      }
      else if(mode == "Time"){
         window.lits.setModTimeValue.html("Set");
      }
      else if(mode == "Locality"){
         window.lits.setModLocalityValue.html("Set");
      }
   }
};


LITS.prototype.setModBtnClicked = function(formData) {
   if(typeof formData == 'undefined') {
      //check if longitude, latitude, time and ids are set
      if(window.lits.data.ids.length == 0){
         console.log("user needs to add at least one id");
         return;
      }

      var formIDs = Object.keys(window.lits.forms);

      if(formIDs.length == 0){
         console.log("No forms.. that's odd");
         return;
      }

      if(typeof window.lits.forms[formIDs[0]].longitude == 'undefined' || window.lits.forms[formIDs[0]].longitude.length == 0){//going with the assumption that if longitude is set for one form then it is set for all other forms
         console.log("user needs to set longitude");
         return;
      }
      if(typeof window.lits.forms[formIDs[0]].latitude == 'undefined' || window.lits.forms[formIDs[0]].latitude.length == 0){
         console.log("user needs to set latitude");
         return;
      }
      if(typeof window.lits.forms[formIDs[0]].time == 'undefined' || window.lits.forms[formIDs[0]].time.length == 0){
         console.log("user needs to set time");
         return;
      }
      if(typeof window.lits.forms[formIDs[0]].locality == 'undefined' || window.lits.forms[formIDs[0]].locality.length == 0){
         console.log("user needs to set locality");
         return;
      }
   }
   else {
      window.lits.forms = formData;
   }
   window.lits.getDataFromServer("get_form_data", true, {forms: window.lits.forms}, function(formData){
      window.lits.genAnimalArray(formData.data);
      window.lits.setModCtnr.hide();
   });
   
};

LITS.prototype.genAnimalArray = function(formData) {
   var formIDs = Object.keys(window.lits.forms);
   console.log(formData);
   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      var currFormData = formData[formIDs[formIndex]];
      var formsIDs = window.lits.forms[formIDs[formIndex]].ids;
      for(var rowIndex = 0; rowIndex < currFormData.length; rowIndex++){
         //get the index of the animal ids in this row
         var latitude = currFormData[rowIndex].latitude;
         var longitude = currFormData[rowIndex].longitude;
         var time = currFormData[rowIndex].time;
         var locality = currFormData[rowIndex].locality;
         var srcVillageName = currFormData[rowIndex].src_village_name;
         var srcVillageLat = currFormData[rowIndex].src_village_lat;
         var srcVillageLon = currFormData[rowIndex].src_village_lon;
         var ids = new Array();
         for(var idIndex = 0; idIndex < formsIDs.length; idIndex++){
            ids[idIndex] = currFormData[rowIndex][formsIDs[idIndex]];
         }
         
         //go through all the animals in the animal object and check if the set of ids is the same as the set of ids from this row
         var found = false;
         for(var animIndex = 0; animIndex < window.lits.data.animals.length; animIndex++){
            var compIDs = window.lits.data.animals[animIndex].ids;
            if(jQuery(compIDs).not(ids).length == 0 && jQuery(ids).not(compIDs).length == 0 ){
               window.lits.addPointToAnimal(animIndex, {time: time, locality: locality, latitude:latitude, longitude:longitude});
               if(typeof srcVillageName != 'undefined' && srcVillageName != null) {
                  window.lits.data.animals[animIndex].src_village.name = srcVillageName;
               }
               if(typeof srcVillageLat != 'undefined' && srcVillageLat != null
                       && typeof srcVillageLon != 'undefined' && srcVillageLon != null) {
                  window.lits.data.animals[animIndex].src_village.latitude = srcVillageLat;
                  window.lits.data.animals[animIndex].src_village.longitude = srcVillageLon;
               }
               /*if(typeof muscle != 'undefined' && muscle != null && muscle.length > 0) {
                  currAnimal.results.muscle = muscle;
               }
               if(typeof kidney != 'undefined' && kidney != null && kidney.length > 0) {
                  currAnimal.results.kidney = kidney;
               }
               if(typeof liver != 'undefined' && liver != null && liver.length > 0) {
                  currAnimal.results.liver = liver;
               }
               if(typeof spleen != 'undefined' && spleen != null && spleen.length > 0) {
                  currAnimal.results.spleen = spleen;
               }*/
               if(formIDs[formIndex] == "lits_slaughter") {
                  window.lits.data.animals[animIndex].results = {
                     muscle: currFormData[rowIndex].muscle,
                     kidney: currFormData[rowIndex].kidney,
                     liver: currFormData[rowIndex].liver,
                     spleen: currFormData[rowIndex].spleen
                  };
               }
               if(typeof window.lits.data.animals[animIndex].results != 'undefined' 
                       && (window.lits.data.animals[animIndex].results.muscle == "abnormal" 
                       || window.lits.data.animals[animIndex].results.kidney == "abnormal" 
                       || window.lits.data.animals[animIndex].results.spleen == "abnormal" 
                       || window.lits.data.animals[animIndex].results.liver == "abnormal")) {
                  window.lits.abnormalResults[window.lits.abnormalResults.length] = animIndex;
               }
               found = true;
               break;
            }
         }
         
         if(found === false){
            var currAnimal = {};
            currAnimal.ids = ids;
            currAnimal.points = new Array();
            currAnimal.points.push({
               time: time,
               locality: locality,
               latitude:latitude,
               longitude:longitude,
            });
            currAnimal.src_village = {
               name: srcVillageName,
               latitude: srcVillageLat,
               longitude: srcVillageLon
            };
            /*currAnimal.results = {
               muscle: muscle,
               kidney: kidney,
               liver: liver,
               spleen: spleen
            };*/
            if(formIDs[formIndex] == "lits_slaughter") {
               currAnimal.results = {
                  muscle: currFormData[rowIndex].muscle,
                  kidney: currFormData[rowIndex].kidney,
                  liver: currFormData[rowIndex].liver,
                  spleen: currFormData[rowIndex].spleen
               };
            }
            if(typeof currAnimal.results != 'undefined' && (currAnimal.results.muscle == "abnormal" || currAnimal.results.kidney == "abnormal" || currAnimal.results.spleen == "abnormal" || currAnimal.results.liver == "abnormal")) {
               window.lits.abnormalResults[window.lits.abnormalResults.length] = window.lits.data.animals.length;
            }
            window.lits.data.animals.push(currAnimal);
         }
      }
   }
   window.lits.visualizeAnimalData();
};

LITS.prototype.visualizeAbnormalResults = function() {
   var animals = [];
   if(window.lits.abnormalResShowing == false) {
      window.lits.searchCanvas.html("");
      window.lits.showAbnormalData.html("Show all animals");
      for(var index = 0; index < window.lits.abnormalResults.length; index++){
         animals[animals.length] = window.lits.data.animals[window.lits.abnormalResults[index]];
         window.lits.searchCanvas.append("<div id='res_"+window.lits.abnormalResults[index]+"' class='lits_search_res'>" + window.lits.data.animals[window.lits.abnormalResults[index]].ids[0] + "</div>");

         jQuery("#res_"+window.lits.abnormalResults[index]).click({animalIndex:window.lits.abnormalResults[index]},function(e) {
            var animIndex = e.data.animalIndex;
            window.lits.getAnimalData(animIndex);

         });

         jQuery("#res_"+window.lits.abnormalResults[index]).mouseover(function(){
            jQuery(this).css("text-decoration", "underline");
         });

         jQuery("#res_"+window.lits.abnormalResults[index]).mouseout(function(){
            jQuery(this).css("text-decoration", "none");
         });
      }
      window.lits.searchCanvas.show();
      window.lits.visualizeAnimalData(animals);
      window.lits.abnormalResShowing = true;
   }
   else {
      window.lits.searchCanvas.hide();
      window.lits.showAbnormalData.html("Track sick animals");
      window.lits.visualizeAnimalData();
      window.lits.abnormalResShowing = false;
   }
};

LITS.prototype.addPointToAnimal = function(animalIndex, point) {
   
   if(window.lits.data.animals[animalIndex].points.length > 0){
      
      var added = false;
      
      for(var index = 0; index < window.lits.data.animals[animalIndex].points.length; index++){
         var pointDate = new Date(point.time);
         var currIndexDate = new Date(window.lits.data.animals[animalIndex].points[index].time);
         if(pointDate.getTime() < currIndexDate.getTime()){
            window.lits.data.animals[animalIndex].points.splice(index, 0, point);
            added = true;
            break;
         }
      }
      
      if(added == false){
         window.lits.data.animals[animalIndex].points.push(point);
      }
   }
   else {
      window.lits.data.animals[animalIndex].points.push(point);
   }
};

LITS.prototype.initMap = function() {
   var location = [1.2833, 36.8167];//default location
   //init the map object
   window.lits.map = L.map(window.lits.mapCanvas[0].id, {
      center: location,
      zoom: 8
   });
   
   L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
      subdomains: ['otile1','otile2','otile3','otile4']
   }).addTo( window.lits.map );
   window.lits.heatmap = L.heatLayer([],{
      radius:60
   }).addTo(window.lits.map);
};

LITS.prototype.visualizeAnimalData = function(animalData){
   var data = animalData;
   window.clearTimeout(window.lits.visSearchTimeout);
   if(typeof data == 'undefined'){
      data = window.lits.data.animals;
   }
   var panLocation = null;
   var maxTimeDiff = 0;
   window.lits.clearMap();
   window.lits.mvmtWindow.hide();
   window.lits.villageCoords = [];
   var mvmntTimelineData = [];
   for(var animIndex = 0; animIndex < data.length; animIndex++){
      var currAnimal = data[animIndex];
      var timelineData = {
         ids: currAnimal.ids,
         no_points: currAnimal.points.length
      };
      mvmntTimelineData[mvmntTimelineData.length] = timelineData;
      if(animIndex == Math.floor(data.length/2)) {
         var pIndex = Math.floor(currAnimal.points.length/2);
         if(currAnimal.points[pIndex].latitude.length > 0 && currAnimal.points[pIndex].longitude.length > 0) {
            panLocation = new L.LatLng(currAnimal.points[pIndex].latitude, currAnimal.points[pIndex].longitude);
         }
      }
      if(currAnimal.points.length > 1){
         var timeDiff = new Date(currAnimal.points[currAnimal.points.length - 1].time).getTime() - new Date(currAnimal.points[0].time).getTime();
         if(timeDiff > maxTimeDiff) maxTimeDiff = timeDiff;
         var pointList = new Array();
         for(var pointIndex = 0; pointIndex < currAnimal.points.length; pointIndex++){
            if(currAnimal.points[pointIndex].latitude.length > 0 && currAnimal.points[pointIndex].longitude.length > 0) {
               window.lits.addMarker(new L.LatLng(currAnimal.points[pointIndex].latitude, currAnimal.points[pointIndex].longitude), currAnimal.points[pointIndex].locality);
               pointList.push(new L.LatLng(currAnimal.points[pointIndex].latitude, currAnimal.points[pointIndex].longitude));
            }
         }

         var animPolyline = new L.Polyline(pointList, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
         });
         animPolyline.on('mouseover', function () {
            this.setText('  ►  ', {repeat: true, attributes: {fill: 'blue', 'font-size': 14}});
         });
         animPolyline.on('mouseout', function () {
            this.setText(null);
         });
         //animPolyline.addTo(window.lits.map);
         window.lits.map.addLayer(animPolyline);
         window.lits.polylines[window.lits.polylines.length] = animPolyline;
         //add markers for the first and last points in the polyline
         //first check if the marker is already labeled
         /*window.lits.addMarker(new L.LatLng(currAnimal.points[0].latitude, currAnimal.points[0].longitude), currAnimal.points[0].locality);
         window.lits.addMarker(new L.LatLng(currAnimal.points[currAnimal.points.length - 1].latitude, currAnimal.points[currAnimal.points.length - 1].longitude), currAnimal.points[currAnimal.points.length - 1].locality);*/
      }
      else {
         if(currAnimal.points[0].latitude.length > 0 && currAnimal.points[0].longitude.length > 0) {
            window.lits.addMarker(new L.LatLng(currAnimal.points[0].latitude, currAnimal.points[0].longitude), currAnimal.points[0].locality);
         }
      }
      //add village coordinates to village coords array
      if(typeof currAnimal.src_village.latitude != 'undefined'
              && currAnimal.src_village.latitude != null
              && currAnimal.src_village.latitude.length > 0
              && typeof currAnimal.src_village.longitude != 'undefined'
              && currAnimal.src_village.longitude != null
              && currAnimal.src_village.longitude.length > 0){
         window.lits.villageCoords[window.lits.villageCoords.length] = new L.LatLng(currAnimal.src_village.latitude, currAnimal.src_village.longitude);
         window.lits.addMarker(new L.LatLng(currAnimal.src_village.latitude, currAnimal.src_village.longitude), currAnimal.src_village.name);
      }
      if(data.length == 1) {//showing only details for one animal
        window.lits.showSrcVillage(currAnimal); 
      }
   }
   if(panLocation != null) {
      window.lits.map.panTo(panLocation);
   }
   window.lits.mvmtData = mvmntTimelineData;
   //TODO: make the timeline more interesting
   window.lits.searchBox.show();
   window.lits.showDataPointsBtn.show();
   window.lits.showVillageHeatmapBtn.show();
   window.lits.showAbnormalData.show();
   window.lits.redrawHeatmap();
};

LITS.prototype.showSrcVillage = function(animal) {
   if(typeof animal.src_village.name != 'undefined'
           && animal.src_village.name != null
           && animal.src_village.name.length > 0) {
      if(typeof animal.src_village.latitude != 'undefined'
           && animal.src_village.latitude != null
           && animal.src_village.latitude.length > 0
           && animal.src_village.longitude.length > 0) {
           window.lits.addMarker(new L.LatLng(animal.src_village.latitude, animal.src_village.longitude), animal.src_village.name);
      }
   }
};

LITS.prototype.addMarker = function(latLnt, label) {
   var circleMarker = null;
   if(label != null && $.inArray(label, window.lits.localityLabels) === -1) {
      circleMarker = new L.CircleMarker(latLnt).bindLabel(label, {noHide: true});
      window.lits.localityLabels[window.lits.localityLabels.length] = label;
   }
   else {
      circleMarker = new L.CircleMarker(latLnt);
   }
   circleMarker.setRadius(4);
   circleMarker.addTo(window.lits.map);
   //window.lits.map.addLayer(circleMarker);
   window.lits.markers[window.lits.markers.length] = circleMarker;
};

LITS.prototype.clearMap = function() {
   for(var index = 0; index < window.lits.polylines.length; index++) {
      window.lits.map.removeLayer(window.lits.polylines[index]);
   }
   window.lits.polylines = [];
   for(var index = 0; index < window.lits.markers.length; index++) {
      window.lits.map.removeLayer(window.lits.markers[index]);
   }
   window.lits.markers = [];
   window.lits.localityLabels = [];
}

/**
 * This method facilitates the searching of animal IDs in the window.lits.data.animals object
 * @param {string} query The string to be searched in the animals object
 * 
 * @returns {undefined}
 */
LITS.prototype.search = function(query) {
   
   var results = new Array();
   window.lits.searchResults = [];
   var maxResults = 30;
   for(var animIndex = 0; animIndex < window.lits.data.animals.length; animIndex++){
      var currAnimal =  window.lits.data.animals[animIndex];
      
      var animScore = 0;
      //search the animal ids
      for(var idIndex = 0; idIndex < currAnimal.ids.length; idIndex++){
         var score = window.lits.fuzzySearch(currAnimal.ids[idIndex], query);
         
         animScore = animScore + score;
      }
      //search the locality
      for(var pointIndex = 0; pointIndex < currAnimal.points.length; pointIndex++){
         var score = window.lits.fuzzySearch(currAnimal.points[pointIndex].locality, query);
         animScore = animScore + score;
      }
      
      //search source village
      if(typeof currAnimal.src_village.name != 'undefined'
              && currAnimal.src_village.name != null
              && currAnimal.src_village.name.length > 0) {
         animScore = animScore + window.lits.fuzzySearch(currAnimal.src_village.name, query);
      }
      if(animScore > 0) {
         var inserted = false;
         for(var resIndex = 0; resIndex < results.length; resIndex++){
            if(animScore > results[resIndex].score){
               results.splice(resIndex, 0, {score:animScore, animalIndex:animIndex});
               inserted = true;
               break;
            }
         }

         if(inserted == false){
            results.push({score:animScore, animalIndex:animIndex});
            window.lits.searchResults[window.lits.searchResults.length] = currAnimal;
         }
      }
      if(results.length > maxResults) {
         break;
      }
   }
   
   window.lits.showSearchResults(results);
   window.clearTimeout(window.lits.visSearchTimeout);
   window.lits.visSearchTimeout = window.setTimeout(function(){window.lits.visualizeSearchResults();}, 500);
};

LITS.prototype.visualizeSearchResults = function() {
   if(window.lits.searchResults.length  > 0) {
      window.lits.visualizeAnimalData(window.lits.searchResults);
   }
   else {
      window.lits.visualizeAnimalData();
   }
};

/**
 *  This method shows the search results in the results container
 *  @param {array} results Array of the results already sorted by relevance
 *  
 * @returns {undefined}
 */
LITS.prototype.showSearchResults = function (results) {
   
   if(results.length > 0){
      window.lits.searchCanvas.show();
   }
   
   for(var resIndex = 0; resIndex < results.length; resIndex++){
      var idText = "";
      
      var animal = window.lits.data.animals[results[resIndex].animalIndex];
      
      for(var idIndex = 0; idIndex < animal.ids.length; idIndex++){
         if(animal.ids[idIndex] != null){
            if(idText.length > 0) idText = idText + ", " + window.lits.data.ids[idIndex] + ": " + animal.ids[idIndex]; 
            else idText = window.lits.data.ids[idIndex] + ": " + animal.ids[idIndex]; 
         }
      }
      if(typeof animal.src_village.name != 'undefined'
              && animal.src_village.name != null
              && animal.src_village.name.length > 0) {
         idText = idText+" *";
      }
      if(typeof animal.src_village.latitude != 'undefined'
              && animal.src_village.latitude != null
              && animal.src_village.latitude.length > 0) {
         idText = idText+"*";
      }
      window.lits.searchCanvas.append("<div id='res_"+results[resIndex].animalIndex+"' class='lits_search_res'>" + idText + "</div>");
      
      jQuery("#res_"+results[resIndex].animalIndex).click({animalIndex:results[resIndex].animalIndex},function(e) {
         var animIndex = e.data.animalIndex;
         window.lits.getAnimalData(animIndex);
         
      });
      
      jQuery("#res_"+results[resIndex].animalIndex).mouseover(function(){
         jQuery(this).css("text-decoration", "underline");
      });
      
      jQuery("#res_"+results[resIndex].animalIndex).mouseout(function(){
         jQuery(this).css("text-decoration", "none");
      });
   }
};

LITS.prototype.fuzzySearch = function(string, query){
   if(string != null){
      var score = 1;//max score string can get
      query = query.replace(" ", "");
      var qRegex = query.toLowerCase().split("").reduce(function(a,b){ return a+".*"+b; });
      var result = (new RegExp(qRegex)).test(string.toLowerCase());
      if(result == true){
         return (query.length/string.length) * score;
      }
   }
   return 0;
};

LITS.prototype.populateTimeline = function() {
   window.lits.loadingBox.show();
   if(window.lits.mvmtSettings == null) {
      var timelineData = window.lits.mvmtData;
      var data = [];
      for(var index = 0; index < timelineData.length; index++) {
         var currPoint = {
            animal: timelineData[index].ids[0],
            no_points: timelineData[index].no_points
         };
         data[index] = currPoint;
      }
      // prepare jqxChart settings
      var settings = {
         title: "Number of contact points",
         description: "",
         enableAnimations: true,
         animationDuration: 1000,
         enableAxisTextAnimation: true,
         showLegend: true,
         padding: { left: 5, top: 5, right: 5, bottom: 5 },
         titlePadding: { left: 0, top: 0, right: 0, bottom: 10 },
         source: data,
         xAxis:
         {
             dataField: "animal",
             displayText: "Animal",
             gridLines: {visible: false},
             flip: false
         },
         valueAxis: {
            flip: true,
            minValue: 0
         },
         colorScheme: "scheme01",
         seriesGroups:[{
               type: 'column',
               orientation: 'horizontal',
               columnsGapPercent: 30,
               seriesGapPercent: 0,
               series: [
                  { dataField: 'no_points', displayText: 'Number of points'},
               ]}]
      };
      window.lits.mvmtSettings = settings;
      window.lits.mvmtTimeline.jqxChart(window.lits.mvmtSettings);
   }
   else {
      window.lits.mvmtSettings.source = window.lits.mvmtData;
      window.lits.mvmtTimeline.jqxChart("refresh");
   }
   // create the chart
   window.lits.mvmtWindow.show();
   window.lits.loadingBox.hide();
};

LITS.prototype.showTooltip = function(data, position){
   window.lits.tooltip.empty();
   window.lits.tooltip.show();
   
   window.lits.tooltip.css(position);
   
   var date = new Date(data.time);
   var dateText = date.toLocaleDateString() + " " + date.toLocaleTimeString();//date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
   
   var html = "Locality: " + data.locality + "<br />";
   html = html + "Date: " + dateText + "<br />";
   
   for(var index = 0; index < data.ids.length; index++){
      html = html + window.lits.data.ids[index] + ": " + data.ids[index] + "<br />";
   }
   
   window.lits.tooltip.append(html);
};

/**
 * This method is responsible for performing ajax requests
 * 
 * @param {type} uri
 * @param {type} async
 * @param {type} data
 * @param {type} onComplete
 * @returns {jsonObject}
 */
LITS.prototype.getDataFromServer = function(uri, async, data, onComplete) {
   
   window.lits.loadingBox.show();
   
   var fullURL = window.lits.serverURL + uri;
   var returnData = {};
   jQuery.ajax ({
      url: fullURL,
      type: 'POST',
      async: async,
      data: data
   }).done(function(data){
      var jsonObject = jQuery.parseJSON(data);

      if(typeof onComplete !== 'undefined') {
         onComplete(jsonObject);
      }
      
      window.lits.loadingBox.hide();
      returnData = jsonObject;
   });
   
   return returnData;
};