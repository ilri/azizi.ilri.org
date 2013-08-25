(function($) {

  $(document).ready(function() {
    $("#plot_days").change(function() {
      LoadGraphs($("#plot_days").val());
    });
  });

})(jQuery);