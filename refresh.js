function autoRefresh_div() {
  var currentLocation = window.location;
  $("#premium_exchange_form").load(currentLocation + ' #premium_exchange_form);
  alert('refresh');
}
setInterval('autoRefresh_div()', 1000);
