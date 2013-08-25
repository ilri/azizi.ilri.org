var Azizi = {
   refreshEquipmentStatus: function(){
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
      Azizi.updatefridgeFreezerStatuses(data.fridgeFreezerStatuses);
      Azizi.updateequipmentsAndRoomsStatuses(data.equipmentsAndRoomsStatuses);
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
      var headers = '', values = '', cfg = Azizi.sysConfig, use_colour;

      if(data.fill_point  != 'warm') {
         headers += "<td>fill point</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.fill_point);
      }

      if(data.switch_state != 'open') {
         headers += "<td>LN supply</td><td>Shutoff valve</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.switch_state);
      }

      if(data.vent_valve != 'closed') {
         headers += "<td>Hot gas</td><td>vent valve</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.warnColor, data.vent_valve);
      }

      if(data.vent_alarm != 'ok') {
         headers += "<td>Hot gas</td><td>vent alarm</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.alertColour, data.vent_alarm);
      }

      if (data.door_state != 'closed') {
         headers += "<td></td><td>Door</td>";
         values += sprintf("<td bgcolor='%s'>%s</td>", cfg.warnColor, data.door_state);
      }

      var content = sprintf("\
         <h2 class='center'> Ancilliary LN<sub>2</sub> systems</h2>\n\
         <table cellpadding='4' cellspacing='1' style='vertical-align:top'>\n\
         <tr bgcolor='#AAAAAA'><td colspan = '2' align = 'center'>Bulk Tank</td>%s<td>Room</td><td colspan='2'></td></tr>\n\
         <tr bgcolor='#AAAAAA'><td>Contents</td><td>Pressure</td>%s<td> O<sub>2</sub></td><td>LN Plant</td><td>Last Report</td></tr>", headers, values);

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
      content += sprintf("<td bgcolor='%s'>%s</td></tr>\n", use_colour, data.smart_date);

      content += "</table>";

      $('.ancilliary').html(content);
   },

   /**
    * Updates the statuses for the fridges and freezers
    *
    * @param   object   data     An object with the statuses
    * @returns {undefined}
    */
   updatefridgeFreezerStatuses: function(data){
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
   updateequipmentsAndRoomsStatuses: function(data){
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
   }
};