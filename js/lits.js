function LITS() {
   window.lits = this;
   //initialize general variables
   window.lits.serverURL = "?do=ajax&action=";
   window.lits.data = {};
   window.lits.data.odkForms = new Array();
   window.lits.data.tmp = {};
   window.lits.data.tmp.selectedForms = new Array();
   window.lits.data.tmp.schemas = {};//stores the database schemas for the selected odk forms selected to make up a set
   
   //initialize html objects to be used
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
   
   window.lits.idModCtnr = jQuery("#id_mod_container");
   window.lits.idModName = jQuery("#id_mod_name");
   window.lits.idModSelections = jQuery("#id_mod_selections");
   window.lits.idModIndex = jQuery("#id_mod_index");
   window.lits.idModAddBtn = jQuery("#id_mod_add_btn");
   window.lits.idModCancelBtn = jQuery("#id_mod_cancel_btn");
   
   /*
    * how the forms object looks like:
    * 
    *    forms[formID].ids[idIndex] - where in SQL the nth id used is stored in form m
    *                 .longitude    - where in SQL the longitude is stored in form m
    *                 .latitude     - where in SQL the latitude is stored in form m
    *                 .time         - where in SQL the time is stored in form m
    */
   window.lits.forms = {};
   window.lits.data.ids = new Array();//this object stores the name and index of an id. the index should be what is used in the sets[setIndex].forms[formID].ids array
   
   //run initialization code
   window.lits.showSetSelectionDiv();
   
   window.lits.windowResized();
   jQuery(window).resize(window.lits.windowResized());
   
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
};

/**
 * This method is called whenever the button in select set dialog is clicked
 * 
 * @returns {undefined}
 */
LITS.prototype.setSelectionBtnClicked = function() {
   console.log("setSelectionBtnClicked called");
   
   //send to the server the form ids, it should return the schemas of the forms (tables with the columns in the tables)
   var schemas = window.lits.getDataFromServer("get_form_schemas", false, {forms: window.lits.data.tmp.selectedForms}).schemas;
   
   window.lits.data.tmp.schemas = schemas;
   
   window.lits.setSelectionCtnr.hide();
   
   window.lits.showSetModDiv();
};

/**
 * This method creates the dialog for selecting a set
 * In this case a set is a set of odk forms that are
 * versions of the same tool
 * 
 * @returns {undefined}
 */
LITS.prototype.showSetSelectionDiv = function() {
   console.log("show set called");
   
   var odkFormIDs = window.lits.data.odkForms;
   if(odkFormIDs.length == 0) {
      odkFormIDs = window.lits.getDataFromServer("get_avail_forms", false, {}).forms;
      window.lits.data.odkForms = odkFormIDs;
   }
   
   console.log("odk forms = ", odkFormIDs);
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
};

LITS.prototype.showSetModDiv = function() {
   window.lits.setModCtnr.show();
   //set the name of the set
   var setName = "Dataset";
   window.lits.setModName.html(setName);
   
   //clear the id list
   window.lits.setModIDsList.empty();
   
   //clear location
   window.lits.setModLocLat.html("Not set");
   window.lits.setModLocLon.html("Not set");
   
   //clear time
   window.lits.setModTimeValue.html("Not set");
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
   
   var fullURL = window.lits.serverURL + uri;
   var returnData = {};
   console.log(fullURL);
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
      
      returnData = jsonObject;
   });
   
   return returnData;
};