var Azizi = {
   resultsPerPage: 15, iisPageCount: 10, pageIndex:0,

   refreshEquipmentStatus: function(){
      if(Azizi.stopUpdateStatus !== undefined && Azizi.stopUpdateStatus === true){
         setTimeout(Azizi.refreshEquipmentStatus, 10000);
         return;
      }
      isInitialRequest = ($('.latest_plant_days').html() == '') ? 'yes' : 'no';
      Azizi.isInitialRequest = isInitialRequest;
      $.ajax({
         type:"POST", url:'/azizi/mod_ajax.php?page=equimentStatus', dataType:'json', data: {initialRequest: isInitialRequest},
		  error: Azizi.communicationError,
		  success: Azizi.updateStatus
      });
   },

   communicationError: function(data){
      //Keep asking for data
      setTimeout(Azizi.refreshEquipmentStatus, 10000);
   },

   updateStatus: function(data){
      Azizi.updateMonitoringStatus(data.otherStates);
      if(Azizi.isInitialRequest == 'yes'){
         Azizi.updateGeneralStatus(data.plantStatus, data.fillPointStatus);
         $('.status, .general').slideToggle('slow');
      }
      Azizi.updateLn2FridgesStatuses(data.ln2FridgeStatuses);
      Azizi.updateAncilliaryStatus(data.ancilliaryStatus)
      Azizi.updateFridgeFreezerStatuses(data.fridgeFreezerStatuses);
      Azizi.updateEquipmentsAndRoomsStatuses(data.equipmentsAndRoomsStatuses);
      //after a successfull update, call it again
      setTimeout(Azizi.refreshEquipmentStatus, 10000);
   },

   /**
    * Updates the general system statuses
    *
    * @param   object   data  The data fetched from the db
    * @returns {undefined}
    */
   updateGeneralStatus: function(plant, fillPoint){
      $('.latest_plant_days').html(Azizi.sysConfig.plantTime);
      $('.latest_plant_uptime').html(plant.upDuty);
      $('.total_plant_hours').html(plant.totalRunningHours);
      $('.total_plant_uptime').html(plant.totalUpDuty);
      $('.latest_fillpoint_days').html(Azizi.sysConfig.fillPointTime);
      $('.latest_fillpoint_hours').html(fillPoint.fillPointUsage);
      $('.total_fillpoint_hours').html(fillPoint.fillPointTotalUsage);
   },

   /**
    * Updates the general system statuses
    *
    * @param   object   data  The data fetched from the db
    * @returns {undefined}
    */
   updateMonitoringStatus: function(data){
      var smsContent, systemContent, hpcContent;
      if(data.emailSmsStatus.old == 0){
         systemContent = "<img src='/azizi/images/ok.jpg' height='15'>";
         smsContent = (data.emailSmsStatus.success == 1) ? "<img src='/azizi/images/ok.jpg' height='15' />" : "<img src='/azizi/images/not_ok.jpg' height='15' />";
      }
      else{
         systemContent = "<img src='/azizi/images/not_ok.jpg' height='20'> ";
         smsContent = "<img src='/azizi/images/not_ok.jpg' height='20'> ";
      }
      hpcContent = (data.hpcDiskCount == Azizi.sysConfig.raidDisksCount) ? "<img src='/azizi/images/ok.jpg' height='15' />" : "<img src='/azizi/images/not_ok.jpg' height='15' />";
      $('.ln2_monitor').html(systemContent);
      $('.sms_alerts').html(smsContent);
      $('.hpc_status').html(hpcContent);
   },

   /**
    * Updates the statuses of the LN2 Fridges
    *
    * @param   object   data     An object with the freezer statuses
    * @returns {undefined}
    */
   updateLn2FridgesStatuses: function(data){
      var content = "<h2>LN<sub>2</sub> Refrigerators <a href='/azizi/freezerweb/'>more</a></h2>\n\
            <table cellpadding='4' cellspacing='1' style='border-spacing:1;'>\n\
            <tr bgcolor='#AAAAAA'><td>Unit</td><td>Temp</td><td>level</td><td>lid</td><td>fill</td> <td>alarms</td><td>last report</td></tr>";
      var cfg = Azizi.sysConfig, use_colour;

      $.each(data, function(){
         use_colour = (this.temp > this.max_temp) ? cfg.alertColour : cfg.normalColour;
         content += sprintf("<tr bgcolor='%s'><td>%s</td><td  bgcolor='%s'>%s</td>", cfg.normalColour, this.TankID, use_colour, this.temp);

         use_colour = (this.level != 'normal')  ? cfg.alertColour : cfg.normalColour;
         if(this.level == 'high') use_colour = cfg.warnColour;
         content += sprintf("<td bgcolor='%s'>%s</td>", use_colour, this.level);

         use_colour = (this.lid != '0') ? use_colour = cfg.warnColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td>", use_colour, this.lidstate);

         use_colour = (this.fill != '0') ? use_colour = cfg.warnColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td>", use_colour, this.fillstate);

         use_colour = (this.alarms != '0') ? use_colour = cfg.alertColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td>", use_colour, this.alarmstate);

         use_colour = (this.hours_old > cfg.reportAgeLimit) ? use_colour = cfg.alertColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td></tr>", use_colour, this.smart_date);
      });

      $('.ln2_fridges').html(content);
   },

   /**
    * Updates the ancilliary statuses
    *
    * @param   object   data     An object with the ancilliary statuses
    * @returns {undefined}
    */
   updateAncilliaryStatus: function(data){
      var headers = '', values = '', cfg = Azizi.sysConfig, use_colour, headerCount = 0;

      if(data.fill_point !== 'warm') {
         headers += "<td>Fill Point</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.fill_point);
         headerCount++;
      }

      if(data.switch_state !== 'open') {
         headers += "<td>Shutoff Valve</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.switch_state);
         headerCount++;
      }

      if(data.vent_valve !== 'closed') {
         headers += "<td>Vent Valve</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColor, data.vent_valve);
         headerCount++;
      }

      if(data.vent_alarm !== 'ok') {
         headers += "<td>Vent Alarm</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.vent_alarm);
         headerCount++;
      }

      if (data.door_state !== 'closed') {
         headers += "<td>Door</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColor, data.door_state);
         headerCount++;
      }

      var additionalTopHeader = (headerCount !== 0) ? sprintf("<td colspan='%d' class='center'>Others</td>", headerCount) : '';

      var content = sprintf("\
         <h2 class='center'> Ancilliary LN<sub>2</sub> systems</h2>\n\
         <table cellpadding='4' cellspacing='1' style='vertical-align:top'>\n\
         <tr bgcolor='#AAAAAA'><td colspan = '2' align = 'center'>Bulk Tank</td><td>Room</td><td colspan='2' class='center'>LN Supply</td>%s</tr>\n\
         <tr bgcolor='#AAAAAA'><td>Contents</td><td>Pressure</td><td> O<sub>2</sub></td><td>LN Plant</td><td>Last Report</td>%s</tr>", additionalTopHeader, headers);

      use_colour = (data.contents > cfg.maxContents) ? cfg.high_p_colour : cfg.normalColour;
      if(data.contents < cfg.minContents) use_colour = cfg.low_p_colour;
      content += sprintf("<tr bgcolor='%s'><td bgcolor='%s'>%s &#37</td>", cfg.normalColour, use_colour, data.contents);

      use_colour = (data.bar > cfg.maxBar) ? cfg.high_p_colour : cfg.normalColour;
      if(data.bar < cfg.minBar) use_colour = cfg.low_p_colour;
      content += sprintf("<td bgcolor='%s'>%s bar</td>", use_colour, data.bar);

      use_colour = (data.O2  < cfg.minO2) ? cfg.alertColour : cfg.normalColour;
      content += sprintf("<td bgcolor='%s'>%s &#37</td>", use_colour, data.O2);
      content += sprintf("<td bgcolor='%s'>%s</td>", cfg.normalColour, data.plant);

      use_colour = (data.hours_old > cfg.pressureOld) ? cfg.alertColour : cfg.normalColour;
      content += sprintf("<td bgcolor='%s'>%s</td>%s</tr>\n", use_colour, data.smart_date, values);

      content += "</table>";

      $('.ancilliary').html(content);
   },

   /**
    * Updates the statuses for the fridges and freezers
    *
    * @param   object   data     An object with the statuses
    * @returns {undefined}
    */
   updateFridgeFreezerStatuses: function(data){
      var content, cfg = Azizi.sysConfig, use_colour;
      content = "\
         <h2>GS FLX lab fridges & freezers <a href='/azizi/labfreezers/?type=freezer'> more</a></h2>\n\
         <table cellpadding='4' cellspacing='1'>\n\
            <tr bgcolor='#AAAAAA'><td>id</td><td>Location</td><td>Description</td><td>Temp</td><td>Last Report</td></tr>";

      $.each(data, function(){
         content += sprintf("<tr bgcolor='%s'><td bgcolor='%s'>%s</td>", cfg.normalColour, cfg.normalColour, this.freezer);
         content += sprintf("<td bgcolor='%s'>%s</td>", cfg.normalColour, this.location);
         content += sprintf("<td bgcolor='%s'><a href='/azizi/labfreezer/?id=%s'>%s</a></td>", cfg.normalColour, this.freezer, this.description);

         if(this.temp < this.min_temp) use_colour = cfg.low_temp_colour;
         else if(this.temp > this.max_temp) use_colour = cfg.high_temp_colour;
         else use_colour = cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%f</td>", use_colour, this.temp);

         use_colour = (this.hours_old > cfg.freezerOld) ? cfg.alertColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td></tr>", use_colour, this.smart_date);
      });
    content += "</table>\n";
    $('.fridge_freezers').html(content);
   },

   /**
    * Updates the statuses for the rooms and equipments
    *
    * @param   object   data     An object with the statuses
    * @returns {undefined}
    */
   updateEquipmentsAndRoomsStatuses: function(data){
      var content, cfg = Azizi.sysConfig, use_colour;
      content ="\
      <h2 class='text_right'>GS FLX equipment and rooms <a href='/azizi/labfreezers/?type=room' > more</a></h2>\n\
      <table cellpadding='4' cellspacing='1'>\n\
      <tr bgcolor='#AAAAAA'><td>id</td><td>Location</td><td>Description</td><td>Temp</td><td>CO2</td><td>O2</td><td>Last Report</td></tr>";

      $.each(data, function(){
         if(this.CO2 == null) this.CO2 = '';
         if(this.O2 == null) this.O2 = '';
         content += sprintf("<tr bgcolor='%s'><td bgcolor='%s'>%s</td>\n", cfg.normalColour, cfg.normalColour, this.freezer);
         content += sprintf("<td bgcolor='%s'>%s</td>\n", cfg.normalColour, this.location);
         content += sprintf("<td bgcolor='%s'><a href='/azizi/labfreezer/?id=%s'>%s</a></td>\n", cfg.normalColour, this.freezer, this.description);

         if(this.temp < this.min_temp) use_colour = cfg.low_temp_colour;
         else if(this.temp > this.max_temp) $use_colour = cfg.high_temp_colour;
         else use_colour = cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%f</td>\n", use_colour, this.temp);

         if((this.CO2 < this.min_co2)) use_colour = cfg.low_temp_colour;
         else if(this.CO2 > this.max_co2) use_colour = cfg.high_temp_colour;
         else use_colour = cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td>\n", use_colour, this.CO2);

         if((this.O2 < this.min_o2)) use_colour = cfg.low_temp_colour;
         else if(this.O2 > this.max_o2) use_colour = cfg.high_temp_colour;
         else use_colour = cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td>\n", use_colour, this.O2);

         use_colour = (this.hours_old > cfg.freezerOld) ? cfg.alertColour : cfg.normalColour;
         content += sprintf("<td bgcolor='%s'>%s</td></tr>\n", use_colour, this.smart_date);
      });
      content += "</table>\n";
      $('.equipments_rooms').html(content);
   },

   /**
    * Starts a global search using the search criteria. If there is nothing to search, it restores the page to its previous state
    *
    * @param   {type} event
    * @returns {undefined}
    */
   startSearch: function(event){
      if(event != null) Azizi.pageIndex = 0;//reset the pageIndex if the function is called by the search box changing
      
      if($("#azizi_search").val() < 3){
         if(Azizi.isSearching !== undefined && Azizi.isSearching){
            $('.narrow_top').attr('id', 'top');
            $('#top').removeClass('narrow_top');
            $('#bottom_panel').html($('#info p').html());
            $('#results').fadeOut('slow', 'linear');
            $('#results_count').fadeOut('slow', 'linear');
            $('#contents').fadeIn('slow', 'linear');
            $('#equipment_status').fadeIn('slow', 'linear');
            $('#extra').fadeIn('slow', 'linear');
            $('#bottom_panel, #up_arrow').fadeOut('slow', 'linear');
            Azizi.isSearching = false;
            Azizi.stopUpdateStatus = false;
            $("#azizi_search").val("");
            Azizi.pageIndex = 0;
         }
      }
      else{
         //if we have a search term > 3 letters... start the search, but first prepare the UI
         if(Azizi.isSearching === undefined || Azizi.isSearching === false){
            $('#top').addClass('narrow_top');
            $('#top').removeAttr('id');
            $('#contents').fadeOut('slow', 'linear');
            $('#equipment_status').fadeOut('slow', 'linear');
            $('#extra').fadeOut('slow', 'linear');
            $('#bottom_panel, #up_arrow').fadeIn('slow', 'linear');
            $('#results').fadeIn('slow', 'linear');
            $('#results_count').fadeIn('slow', 'linear');
            Azizi.isSearching = true;
            Azizi.stopUpdateStatus = true;
         }
         $.ajax({
            type:"GET", url:'/azizi/mod_ajax.php?page=search&q='+$("#azizi_search").val()+'&start='+(Azizi.pageIndex*Azizi.resultsPerPage)+"&size="+Azizi.resultsPerPage, dataType:'json', error: Azizi.communicationError, success: Azizi.updateSearchResults
         });
      }
   },

   /**
    * Updates the interface with the search results google-style
    *
    * @param {type} data
    * @returns {undefined}
    */
   updateSearchResults: function(data){
      Azizi.currentResults = data;
      Azizi.displaySamples();
   },

   displaySamples: function(){
      //var clearing = (Object.keys(Azizi.currentResults.data).length === 0) ? 'No Results...' : '';
      $('#results .left').html('');
      $('#results .right').html('');
      $('#results .extreme_right').html('');
      
      var time = Azizi.currentResults.time/1000;
      //console.log(time);
      $("#results .left").append("<div style='margin-left:50px;font-size:14px;color:#428bca;margin-bottom:10px;'>"+Azizi.currentResults.count+" results in "+time+" seconds</div>");
      
      for(var i = 0; i < Object.keys(Azizi.currentResults.data).length; i++){
         var t = Azizi.currentResults.data[i];
         if(t.collection === 'samples') Azizi.displayAziziSamples(t);
         else if(t.collection === 'stabilates') Azizi.displayStabilatesSamples(t);
      }

      //construct the aziiiizi tings
      if(Object.keys(Azizi.currentResults.data).length > 0){
         var totalNoPages = Azizi.currentResults.count / Azizi.resultsPerPage;
         var groupIndex = Math.floor(Azizi.pageIndex / Azizi.iisPageCount);
         
         var repeat = totalNoPages - (groupIndex*Azizi.iisPageCount);
         if(repeat > Azizi.iisPageCount){
            repeat = Azizi.iisPageCount;
         }
         
         var additional = "";
         
         if(groupIndex < Math.floor((totalNoPages-1)/Azizi.iisPageCount)){//check if this is the last group
            additional = "<span><a class='iis more' id='next_group' href='javascript:;'>>></a></span>";//TODO: implement on click
         }
         
         var less = "";
         if(Azizi.pageIndex >= Azizi.iisPageCount){
            less = "<span><a class='iis less' id='prev_group' href='javascript:;'><<</a></span>";
         }
         
         var iis = "";
         for(var index = 0; index < repeat; index++){
            if(index === (Azizi.pageIndex - (groupIndex*Azizi.iisPageCount))){
               iis = iis + "<a class='iis' href='javascript:;' style='font-size:24px;'>i</a>";
            }
            else {
               console.log()
               iis = iis + "<a class='iis' id='page_"+((groupIndex*Azizi.iisPageCount)+index)+"' href='javascript:;' style='font-size:18px;'>i</a>";
            }
         }
         
         //var iis = Azizi.repeatString("<a class='iis' href='javascript:;'>i</a>", repeat);
         var content = sprintf("<div>%sAz%szi%s</div>", less, iis, additional);
         $('#results_count').html(content);
         
         $("#next_group").click(function(){
            //get the first page in the next group
            var currGroupIndex = Math.floor(Azizi.pageIndex / Azizi.iisPageCount);
            var firstIndexNG = (currGroupIndex+1) * Azizi.iisPageCount;
            console.log(firstIndexNG);
            Azizi.pageIndex = firstIndexNG;
            Azizi.startSearch(null);
         });
         
         $("#prev_group").click(function(){
            //get the first page in the next group
            var currGroupIndex = Math.floor(Azizi.pageIndex / Azizi.iisPageCount);
            if((currGroupIndex - 1) >= 0 ){
               var firstIndexNG = (currGroupIndex - 1) * Azizi.iisPageCount;
               console.log(firstIndexNG);
               Azizi.pageIndex = firstIndexNG;
               Azizi.startSearch(null);
            }
         });
         
         $(".iis").click(function(){
            var id = $(this).attr("id").replace("page_", "");
            //var firstIndex = id * Azizi.resultsPerPage;
            if(!isNaN(id)){
               Azizi.pageIndex = id;
               console.log(Azizi.pageIndex);
               Azizi.startSearch(null);
            }
         });
      }
      else{
         $('#results_count').empty();
      }
   },

   /**
    * Displays a sample from the stabilate database
    *
    * @param   object   t     The sample details to be displayed
    * @returns {undefined}
    */
   displayStabilatesSamples: function(t){
      var content = '', others, access;
      /*Cater for the stabilates*/
      if(t.locality !== null) others += sprintf("  <span>Loc: %s</span>", t.locality);
      if(t.isolation_date !== null) others += sprintf("  <span>Iso. Date: %s</span>", t.isolation_date);
      if(t.preservation_date !== null) others += sprintf("  <span>Pres. Date: %s</span>", t.preservation_date);
      if(t.number_frozen !== null) others += sprintf("  <span>No. frozn: %s</span>", t.number_frozen);
      access = 'open-access.png';
      content = sprintf("<div class='result_set'><div class='access'><img src='/azizi/images/%s'></div><div class='first_line'>\n\
         <a href='javascript:;' class='stabilates_%s'><span>%s:</span><span>%s,</span> %s</a>\n\
      </div>\n\
      <div class='second_line'>\n\
         <span>P: %s</span>%s\n\
      </div></div>",
         access, t.id, t.stab_no, t.parasite_name, t.infection_host, t.country_name, others);
      $('#results .left').append(content);
   },

   /**
    * Displays a sample from the azizi database
    *
    * @param   object   t     The sample details to be displayed
    * @returns {undefined}
    */
   displayAziziSamples: function(t){
      var content = '', others = "", access;
      //cater for azizi samples
      if(t.organism !== "") others += sprintf("  <span>A: %s</span>", t.organism);
      if(t.date_created !== "") others += sprintf("  <span>Col. Date: %s</span>", t.date_created);
      if(t.origin !== "") others += sprintf("  <span>Origin: %s</span>", t.origin);
      
      access = (t.open_access === '1') ? 'open-access.png' : 'closed-access.png';
      content = sprintf("<div class='result_set'><div class='access'><img src='/azizi/images/%s'></div><div class='first_line'>\n\
         <a href='javascript:;' class='azizi_%s'><span>%s:</span> <span>%s</span>, <span>%s</span></a>\n\
      </div>\n\
      <div class='second_line'>\n\
         <span>P: %s</span>%s\n\
      </div></div>",
         access, t.sample_id, t.sample_name, (t.organism == '')?'Unknown organims':t.organism, (t.sample_type == '')?"Unknown type":t.sample_type, t.project_name, others);
      $('#results .left').append(content);
   },

   /**
    * Get the sample details and display them to the panel on the right hand side
    * @returns {undefined}
    */
   getSampleDetails: function() {
      $('.selected').removeClass('selected');
      $(this.parentNode.parentNode).addClass('selected');
      $.ajax({
         type: "POST", url: '/azizi/mod_ajax.php?page=sample_details&id=' + this.className, dataType: 'json',
         error: Azizi.communicationError,
         success: function(data) {
            if (data.error)  return;
            else if(data.data.collection === 'stabilates') Azizi.showStabilatesDetails(data);
            else if(data.data.collection === 'azizi'){
               $('#results .right').html(data.data.comments);
            }
         }
      });
   },

   showStabilatesDetails: function(data){
      //update the right hand div with the data as received from the database
      var stabilate = data.data.stabilate;
      var passages = data.data.passages;

      var content = "";
      var stabilateDetails = Array();
      var stabilateLabels = Array();
      stabilateLabels.push("Stabilate No.: ");
      stabilateDetails.push(stabilate.stab_no);
      stabilateLabels.push("Parasite: ");
      stabilateDetails.push(stabilate.parasite_name);
      stabilateLabels.push("Host: ");
      stabilateDetails.push(stabilate.host_name);
      stabilateLabels.push("Infection in host: ");
      stabilateDetails.push(stabilate.infection_host);
      stabilateLabels.push("Locality: ");
      stabilateDetails.push(stabilate.locality);
      stabilateLabels.push("Origin Country: ");
      stabilateDetails.push(stabilate.country_name);
      stabilateLabels.push("Stabilate Comments: ");
      stabilateDetails.push(stabilate.stabilate_comments);
      //remove those elements in the stabilateDetails array that are null
      for (var i = 0; i < stabilateDetails.length; i++) {
         if (stabilateDetails[i] === null || stabilateDetails[i] === "") {
            stabilateDetails.splice(i, 1);
            stabilateLabels.splice(i, 1);
            i--;
         }
      }

      //construct the stabilate interface
      if (stabilateDetails.length > 0) {
         content = content + sprintf("<table class='search_details'><tr><td colspan='2'><h2>Stabilate</h2></td></tr>");
         for (var i = 0; i < stabilateDetails.length; i++) {
            //use modulus to check if i is odd or even
            if ((i % 2) === 0) {//EVEN
               if (stabilateLabels[i] === "Stabilate Comments: ") {
                  content = content + sprintf("<tr><td colspan='2'><span class='result_lables'>%s</span>%s</td></tr>", stabilateLabels[i], stabilateDetails[i]);
               }
               else {
                  content = content + sprintf("<tr><td class='search_columns'><span class='result_lables'>%s</span>%s</td>", stabilateLabels[i], stabilateDetails[i]);
                  if (i === (stabilateDetails.length - 1))
                     content = content + "</tr>"; // last element in the array
               }
            }
            else if ((i % 2) === 1) {//ODD
               if (stabilateLabels[i] === "Stabilate Comments: ") {
                  content = content + sprintf("<td></td></tr><tr><td colspan='2'><span class='result_lables'>%s</span>%s</td></tr>", stabilateLabels[i], stabilateDetails[i]);
               }
               else {
                  content = content + sprintf("<td class='search_columns'><span class='result_lables'>%s</span>%s</td></tr>", stabilateLabels[i], stabilateDetails[i]);
               }
            }
         }
         content = content + "</table>";
      }

      //add preservation data to array
      var preservationDetails = Array();
      var preservationLabels = Array();
      preservationLabels.push("Preservation Date: ");
      preservationDetails.push(stabilate.preservation_date);
      preservationLabels.push("Number Preserved: ");
      preservationDetails.push(stabilate.number_frozen);
      preservationLabels.push("Preserved Type: ");
      preservationDetails.push(stabilate.preserved_type);
      preservationLabels.push("Preservation Method: ");
      preservationDetails.push(stabilate.preservation_method);
      preservationLabels.push("Preserved By: ");
      preservationDetails.push(stabilate.user_names);
      //filter out any null preservation data
      for (var i = 0; i < preservationDetails.length; i++) {
         if (preservationDetails[i] === null || preservationDetails[i] === "") {
            preservationDetails.splice(i, 1);
            preservationLabels.splice(i, 1);
            i--;
         }
      }

      //construct preservation data table
      if (preservationDetails.length > 0) {
         content = content + sprintf("<table class='search_details'><tr><td colspan='2'><h2>Preservation</h2></td></tr>");
         for (var i = 0; i < preservationDetails.length; i++) {
            if ((i % 2) === 0) {//even
               content = content + sprintf("<tr><td class='search_columns'><span class='result_lables'>%s</span>%s</td>", preservationLabels[i], preservationDetails[i]);
               if (i === (preservationDetails.length - 1))
                  content = content + "</tr>"; // last element in the array
            }
            else if ((i % 2) === 1) {//odd
               content = content + sprintf("<td class='search_columns'><span class='result_lables'>%s</span>%s</td></tr>", preservationLabels[i], preservationDetails[i]);
            }
         }
         content = content + "</table>";
      }

      //collect strain data into array
      var strainLabels = Array();
      var strainDetails = Array();
      strainLabels.push("Strain Morphology: ");
      strainDetails.push(stabilate.strain_morphology);
      strainLabels.push("Strain Count: ");
      strainDetails.push(stabilate.strain_count);
      strainLabels.push("Strain Infectivity: ");
      strainDetails.push(stabilate.strain_infectivity);
      strainLabels.push("Strain Pathogenicity: ");
      strainDetails.push(stabilate.strain_pathogenicity);
      //filter out any null strain data
      for (var i = 0; i < strainDetails.length; i++) {
         if (strainDetails[i] === null || strainDetails[i] === "") {
            strainDetails.splice(i, 1);
            strainLabels.splice(i, 1);
            i--;
         }
      }

      //construct strain data table
      if (strainDetails.length > 0) {
         content = content + sprintf("<table class='search_details'><tr><td colspan='2'><h2>Strain Data</h2></td></tr>");

         for (var i = 0; i < strainDetails.length; i++) {
            if ((i % 2) === 0) {//even
               content = content + sprintf("<tr><td class='search_columns'><span class='result_lables'>%s</span>%s</td>", strainLabels[i], strainDetails[i]);
               if (i === (strainDetails.length - 1))
                  content = content + "</tr>"; // last element in the array
            }
            else if ((i % 2) === 1) {//odd
               content = content + sprintf("<td class='search_columns'><span class='result_lables'>%s</span>%s</td></tr>", strainLabels[i], strainDetails[i]);
            }
         }

         content = content + "</table>";
      }

      if (passages.length > 0) {
         content = content + sprintf("<table class='search_details'><tr><td colspan='6'><h2>Passages</h2></td></tr>");
         content = content + sprintf("<tr><th>Passage No.</th><th>Pass Parent</th><th>Inoculum Type</th><th>Species</th><th>Days</th><th>Rad. Freq</th></tr>");

         for (var i = 0; i < passages.length; i++) {
            var currentPassage = passages[i];
            content = content + sprintf("<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>", currentPassage.passage_no, currentPassage.inoculum_ref, currentPassage.inoculum_name, currentPassage.species_name, currentPassage.infection_duration, currentPassage.radiation_freq);
         }
         ;
         content = content + sprintf("</table>");
      }
      Azizi.viewStabilateHistory(stabilate.id);
      $('#results .right').html(content);
   },

   /**
    * View the stabilate history
    *
    * @returns {String}
    */
   viewStabilateHistory: function(stabilateId) {
      //get the history
      var params = 'collection=stabilates&stabilate_id=' + stabilateId + '&action=stabilate_history';
      $.ajax({
         type: "POST", url: '/azizi/mod_ajax.php?page=stabilates&do=browse', dataType: 'json', async: false, data: params,
         error: Azizi.communicationError,
         success: function(data) {
            var mssg, content, all = '';
            if (data.data.length > 1) {//only show history if stabilate actually has a history
               $.each(data.data, function(i, item) {
                  if (i === 0) {
                     content = "<div class='stabilate'>" + item.starting_stabilate + '</div>';
                  }
                  else {
                     var heading = "";
                     if (i === (data.data.length - 1)) {
                        heading = "<h2>History</h2>";
                     }
                     content = heading + "<div class='stabilate'>" + item.stab_no + '</div>';
                     content += "<div class='passages'><img src='/azizi/images/down_arrow.png' />" + item.passage_count + ' Passage(s)</div>';
                  }
                  all = content + all;
               });
               $('#results .extreme_right').html(all);
            }

            //return all;
         }
      });
   },

   /**
    * Repeats a string the number of specified times
    *
    * @param   string   pattern     The string to be repeated
    * @param   integer  num         The number of times the string will be repeated
    * @returns string   Returns the repeated string
    */
   repeatString: function(pattern, num){
      if (num < 1) return '';
      var result = '';
      while (num > 0) {
        if (num & 1) result += pattern;
        num >>= 1, pattern += pattern;
      }
      return result;
   },

   /**
    * Update the display with the next samples
    *
    * @returns {undefined}
    */
   nextSamples: function(){
      if($(this).hasClass('more')){
         Azizi.moreIndex++;
         Azizi.displaySamples($(this).index(), Azizi.moreIndex);
      }
      else if($(this).hasClass('less')){
         Azizi.moreIndex--;
         Azizi.displaySamples($(this).index(), Azizi.moreIndex);
      }
      else{
         $('.iis').removeClass('iis_selected');
         $(this).addClass('iis_selected');
         Azizi.displaySamples($(this).index());
      }
   }
};
