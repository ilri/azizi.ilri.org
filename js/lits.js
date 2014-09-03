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
   window.lits.mvmtTimeline = jQuery("#mvmt_timeline");
   window.lits.loadingBox = jQuery("#loading_box");
   window.lits.searchBox = jQuery("#search_box_3d");
   window.lits.searchCanvas = jQuery("#lits_search_res");
   window.lits.animalDetails = jQuery("#animal_details");
   
   window.lits.tooltip = jQuery("#mvmt_ttip");
   
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
   
   window.lits.searchBox.keyup(function(){
      window.lits.searchCanvas.empty();
      if(window.lits.searchBox.val().length > 0){
         window.lits.search(window.lits.searchBox.val());
      }
      else {
         window.lits.searchCanvas.hide();
      }
   });
}

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
   
   if(window.lits.mvmtTimeline.is(":visible")){
      var timelineMinHeight = wHeight * 0.1;
   
      window.lits.mvmtTimeline.css('top', (wHeight - timelineMinHeight) + "px");
   }
   
   window.lits.loadingBox.css("left", ((wWidth/2) - (window.lits.loadingBox.width() / 2)) + "px");
   window.lits.loadingBox.css("top", ((wHeight/2) - (window.lits.loadingBox.height() / 2)) + "px");
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
   console.log("id index = ", idIndex);
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
   console.log("idIndex = ", idIndex);
   
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
         console.log("columnID is", columnID);
         
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

               console.log(window.lits.forms);
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
   /*var animalData = window.lits.getDataFromServer("get_animal_data", false, {data:animal, forms: forms});
   
   window.lits.showAnimalData(animalData.data);*/
   
   window.lits.getDataFromServer("get_animal_data", true, {data:animal, forms: forms}, function(animalData){
      window.lits.showAnimalData(animalData.data);
   });
};

LITS.prototype.cleanAnimalData = function(animalData){
   /*
    * Remove:
    *       - columns that have null
    *       - meta columns (prefixed with a _)
    */
   console.log(animalData);
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

LITS.prototype.showAnimalData = function(animalData) {
   var cAnimalData = window.lits.cleanAnimalData(animalData);
   
   var formIDs = Object.keys(cAnimalData);
   
   window.lits.animalDetails.empty();
   
   for(var fIndex = 0; fIndex < formIDs.length; fIndex++){
      var formHTML = "<div>";
      formHTML = formHTML + "<div style='font-style:bold; font-size:14px;'>" + formIDs[fIndex] + "</div>";
      
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
            tHTML = tHTML + "<td>" + columns[columnNames[cIndex]][rIndex] + "</td>";
         }
         tHTML = tHTML + "</tr>";
      }
      
      tHTML = tHTML + "</table>";
      
      formHTML = formHTML + tHTML + "</div>";
      
      window.lits.animalDetails.append(formHTML);
   }
   
   var wWidth = window.innerWidth;
   var wHeight = window.innerHeight;
   
   window.lits.animalDetails.css("left", (wWidth/2 - window.lits.animalDetails.width()/2)+"px");
   window.lits.animalDetails.css("top", (wHeight/2 - window.lits.animalDetails.height()/2)+"px");
   window.lits.animalDetails.show();
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
      console.log("columnID is", columnID);

      if(typeof columnID != 'undefined'){
         var columnIndexes = columnID.split("*");
         if(columnIndexes.length == 3){//means you have the form id, table name and column name
            if(typeof window.lits.forms[columnIndexes[0]] == 'undefined') {
               window.lits.forms[columnIndexes[0]] = {};
            }

            window.lits.forms[columnIndexes[0]][mode.toLowerCase()] = columnID;
            
            if(mode == "Latitude"){//try automatically setting longitude
               var latRegex = /_LAT$/g;
               console.log("lat regex = ", columnID.match(latRegex));
               
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

            console.log(window.lits.forms);
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
      
      console.log("mode = ", mode);
      
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
      
      console.log(window.lits.forms);
   }
};


LITS.prototype.setModBtnClicked = function() {
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
   
   //if we've come this far, everything is fine
   
   /*var formData = window.lits.getDataFromServer("get_form_data", false, {forms: window.lits.forms});
   window.lits.genAnimalArray(formData.data);
   window.lits.setModCtnr.hide();*/
   
   window.lits.getDataFromServer("get_form_data", true, {forms: window.lits.forms}, function(formData){
      window.lits.genAnimalArray(formData.data);
      window.lits.setModCtnr.hide();
   });
   
};

LITS.prototype.genAnimalArray = function(formData) {
   var formIDs = Object.keys(window.lits.forms);
   
   for(var formIndex = 0; formIndex < formIDs.length; formIndex++){
      var currFormData = formData[formIDs[formIndex]];
      
      console.log("*********** forms = ", window.lits.forms);
      console.log("formID = ", formIDs[formIndex]);
      
      var formsIDs = window.lits.forms[formIDs[formIndex]].ids;
      
      for(var rowIndex = 0; rowIndex < currFormData.length; rowIndex++){
         //get the index of the animal ids in this row
         var latitude = currFormData[rowIndex].latitude;
         var longitude = currFormData[rowIndex].longitude;
         var time = currFormData[rowIndex].time;
         var locality = currFormData[rowIndex].locality;
         
         var ids = new Array();
         for(var idIndex = 0; idIndex < formsIDs.length; idIndex++){
            console.log("currFormData[rowIndex][formsIDs[idIndex]] = ", currFormData[rowIndex][formsIDs[idIndex]]);
            ids[idIndex] = currFormData[rowIndex][formsIDs[idIndex]];
         }
         
         //go through all the animals in the animal object and check if the set of ids is the same as the set of ids from this row
         var found = false;
         for(var animIndex = 0; animIndex < window.lits.data.animals.length; animIndex++){
            var compIDs = window.lits.data.animals[animIndex].ids;
            if(jQuery(compIDs).not(ids).length == 0 && jQuery(ids).not(compIDs).length == 0 ){
               console.log("they match");
               window.lits.addPointToAnimal(animIndex, {time: time, locality: locality, latitude:latitude, longitude:longitude});
               
               found = true;
               break;
            }
         }
         
         if(found === false){
            var currAnimal = {};
            currAnimal.ids = ids;
            currAnimal.points = new Array();
            currAnimal.points.push({time: time, locality: locality, latitude:latitude, longitude:longitude});
            
            window.lits.data.animals.push(currAnimal);
         }
      }
   }
   
   //console.log(window.lits.data.animals);
   window.lits.visualizeAnimalData();
};

LITS.prototype.addPointToAnimal = function(animalIndex, point) {
   
   if(window.lits.data.animals[animalIndex].points.length > 0){
      console.log("about to push ", point, " into ", window.lits.data.animals[animalIndex].points);
      
      var added = false;
      
      for(var index = 0; index < window.lits.data.animals[animalIndex].points.length; index++){
         var pointDate = new Date(point.time);
         var currIndexDate = new Date(window.lits.data.animals[animalIndex].points[index].time);
         
         console.log("Comparing ", pointDate.getTime(), " with ", currIndexDate.getTime());
         
         if(pointDate.getTime() < currIndexDate.getTime()){
            window.lits.data.animals[animalIndex].points.splice(index, 0, point);
            added = true;
            break;
         }
      }
      
      if(added == false){
         window.lits.data.animals[animalIndex].points.push(point);
      }
      
      console.log("points after push = ", window.lits.data.animals[animalIndex].points);
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
      zoom: 6
   });
   
   L.tileLayer( 'http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://osm.org/copyright" title="OpenStreetMap" target="_blank">OpenStreetMap</a> contributors | Tiles Courtesy of <a href="http://www.mapquest.com/" title="MapQuest" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png" width="16" height="16">',
      subdomains: ['otile1','otile2','otile3','otile4']
   }).addTo( window.lits.map );
};

LITS.prototype.visualizeAnimalData = function(animalData){
   var data = animalData;
   
   if(typeof data == 'undefined'){
      data = window.lits.data.animals;
   }
   
   
   var maxTimeDiff = 0;
   for(var animIndex = 0; animIndex < data.length; animIndex++){
      var currAnimal = data[animIndex];
      
      if(currAnimal.points.length > 1){
         
         var timeDiff = new Date(currAnimal.points[currAnimal.points.length - 1].time).getTime() - new Date(currAnimal.points[0].time).getTime();
         
         if(timeDiff > maxTimeDiff) maxTimeDiff = timeDiff;
         
         var pointList = new Array();
         for(var pointIndex = 0; pointIndex < currAnimal.points.length; pointIndex++){
            pointList.push(new L.LatLng(currAnimal.points[pointIndex].latitude, currAnimal.points[pointIndex].longitude));
         }

         console.log("pointList", pointList);

         var animPolyline = new L.Polyline(pointList, {
            color: 'red',
            weight: 3,
            opacity: 0.5,
            smoothFactor: 1
         });

         animPolyline.addTo(window.lits.map);
      }
      else {
         var circleMarker = new L.CircleMarker(new L.LatLng(currAnimal.points[0].latitude, currAnimal.points[0].longitude));
         circleMarker.setRadius(2);
         circleMarker.addTo(window.lits.map);
      }
   }
   
   window.lits.populateTimeline(maxTimeDiff);
   
   window.lits.searchBox.show();
};

/**
 * This method facilitates the searching of animal IDs in the window.lits.data.animals object
 * @param {string} query The string to be searched in the animals object
 * 
 * @returns {undefined}
 */
LITS.prototype.search = function(query) {
   
   var results = new Array();
   
   for(var animIndex = 0; animIndex < window.lits.data.animals.length; animIndex++){
      var currAnimal =  window.lits.data.animals[animIndex];
      
      var animScore = 0;
      
      for(var idIndex = 0; idIndex < currAnimal.ids.length; idIndex++){
         var score = window.lits.fuzzySearch(currAnimal.ids[idIndex], query);
         
         animScore = animScore + score;
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
         }
      }
   }
   
   window.lits.showSearchResults(results);
};

/**
 *  This method shows the search results in the results container
 *  @param {array} results Array of the results already sorted by relevance
 *  
 * @returns {undefined}
 */
LITS.prototype.showSearchResults = function (results) {
   
   console.log("search results = ",results);
   
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
   
   else {
      return 0;
   }
};

LITS.prototype.populateTimeline = function(maxTimeDiff) {
   
   console.log("maxTimeDiff = ", maxTimeDiff);
   
   window.lits.mvmtTimeline.empty();
   
   var maxAnimalsTimeline = 20;
   
   var lastIndex = window.lits.data.tmp.mvmntLastIndex + maxAnimalsTimeline;
   
   var tWidth = window.lits.mvmtTimeline.width();
   
   var timeDiffWidth = 0;
   if(maxTimeDiff > 0){
      timeDiffWidth = (tWidth - 200) / maxTimeDiff;
      
      console.log("timeDiffWidth = ", timeDiffWidth);
   }
   
   var noTimelineAnims = maxAnimalsTimeline;
   if(window.lits.data.animals.length < noTimelineAnims){
      noTimelineAnims = window.lits.data.animals.length;
   }
   
   var timelineHeight = noTimelineAnims * 20;
   
   window.lits.mvmtTimeline.css("height", timelineHeight + "px");
   
   for(var index = (window.lits.data.tmp.mvmntLastIndex + 1); index <= lastIndex && index < window.lits.data.animals.length; index++){
      var currAnimal = window.lits.data.animals[index];
         
      var lineWidth = (new Date(currAnimal.points[currAnimal.points.length - 1].time).getTime() - new Date(currAnimal.points[0].time).getTime()) * timeDiffWidth;
      console.log("lineWidth = ", lineWidth);
      
      var lineDiv = "<div style='height:1px; width="+lineWidth+"px; background-color:blue;'></div><br />";
      
      //window.lits.mvmtTimeline.append(lineDiv);
      
      for(var pointIndex = 0; pointIndex < currAnimal.points.length; pointIndex++){
         var left = (new Date(currAnimal.points[pointIndex].time).getTime() - new Date(currAnimal.points[0].time).getTime()) * timeDiffWidth;      
         
         var top = index * (100 / noTimelineAnims);
         
         var pointTime = new Date(currAnimal.points[pointIndex].time).getTime();
         
         var pointHTML = "<div id="+index+"_"+pointTime+" class='mvmt_point' style='left:"+left+"px; top:"+top+"%'></div>";
         
         window.lits.mvmtTimeline.append(pointHTML);
         
         
         var tmpData = currAnimal.points[pointIndex];
         tmpData.ids = currAnimal.ids;
         
         jQuery("#"+index+"_"+pointTime).mouseover({data:tmpData}, function(e){
            var data = e.data.data;
            console.log("data = ", e);
            
            window.lits.showTooltip(data, {left:(e.pageX + 20)+"px", top:(e.pageY - 80)+"px"});
         });
         
         jQuery("#"+index+"_"+pointTime).mouseout(function(){
            window.lits.tooltip.hide();
         });
      }
   }
   
   window.lits.showMvmtTimeline();
};

LITS.prototype.showTooltip = function(data, position){
   console.log("position = ", position);
   
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

LITS.prototype.showMvmtTimeline = function() {
   var windowHeight = window.innerHeight;
   
   var top = windowHeight - window.lits.mvmtTimeline.height();
   
   window.lits.mvmtTimeline.show();
   
   window.lits.mvmtTimeline.animate({
      'top' : top + "px"
   }, 200);
   
   
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
   console.log(fullURL);
   jQuery.ajax ({
      url: fullURL,
      type: 'POST',
      async: async,
      data: data
   }).done(function(data){
//      console.log("data from server = ", data);
      var jsonObject = jQuery.parseJSON(data);

      if(typeof onComplete !== 'undefined') {
         onComplete(jsonObject);
      }
      
      window.lits.loadingBox.hide();
      returnData = jsonObject;
   });
   
   return returnData;
};