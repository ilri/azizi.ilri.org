var Azizi = {
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
      if(this.value.length < 3){
         if(Azizi.isSearching !== undefined && Azizi.isSearching){
            $('.narrow_top').attr('id', 'top');
            $('#top').removeClass('narrow_top');
            $('#bottom_panel').html($('#info p').html());
            $('#results').fadeOut('slow', 'linear');
            $('#contents').fadeIn('slow', 'linear');
            $('#bottom_panel, #up_arrow').fadeOut('slow', 'linear');
            Azizi.isSearching = false;
            Azizi.stopUpdateStatus = false;
            this.value = '';
         }
      }
      else{
         //if we have a search term > 3 letters... start the search, but first prepare the UI
         if(Azizi.isSearching === undefined || Azizi.isSearching === false){
            $('#top').addClass('narrow_top');
            $('#top').removeAttr('id');
            $('#contents').fadeOut('slow', 'linear');
            $('#bottom_panel, #up_arrow').fadeIn('slow', 'linear');
            $('#results').fadeIn('slow', 'linear');
            Azizi.isSearching = true;
            Azizi.stopUpdateStatus = true;
         }
         $.ajax({
            type:"POST", url:'/azizi/mod_ajax.php?page=search&q='+this.value, dataType:'json', error: Azizi.communicationError, success: Azizi.updateSearchResults
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
      var content = '', others, access;
      var clearing = (data.data.length === 0) ? 'No Results...' : '';
      $('#results .left').html(clearing);
      $('#results .right').html('');
      $.each(data.data, function(i, t){
         others = '';
         if(t.animal_id !== null) others += sprintf("  <span>A: %s</span>", t.animal_id);
         if(t.collection_date !== null) others += sprintf("  <span>Col. Date: %s</span>", t.collection_date);
         if(t.Latitude !== null) others += sprintf("  <span>Lat: %s</span>", t.Latitude);
         if(t.Longitude !== null) others += sprintf("  <span>Lon: %s</span>", t.Longitude);
         access = (t.open_access === '1') ? 'open-access.png' : 'closed-access.png';
         content = sprintf("<div class='result_set'><div class='access'><img src='/azizi/images/%s'></div><div class='first_line'>\n\
            <a href='javascript:;' class='sample_%s'><span>%s:</span> <span>%s</span>, <span>%s,</span> %s</a>\n\
         </div>\n\
         <div class='second_line'>\n\
            <span>P: %s</span>%s\n\
         </div></div>",
            access, t.sample_id, t.sample_id, t.label, t.org_name, t.sample_type, t.project, others);
         $('#results .left').append(content);
      });
   },

   /**
    * Get the sample details and display them to the panel on the right hand side
    * @returns {undefined}
    */
   getSampleDetails: function(){
      $('.selected').removeClass('selected');
      $(this.parentNode.parentNode).addClass('selected');
      $.ajax({
         type:"POST", url:'/azizi/mod_ajax.php?page=sample_details&id='+this.className, dataType:'json',
         error: Azizi.communicationError,
         success: function(data){
            if(data.error){ return; }
            //update the right hand div with the data as received from the database
            $('#results .right').html(data.data.comments);
         }
      });
   }
};