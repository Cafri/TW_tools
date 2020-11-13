function autoRefresh_div() {
  $("#premium_exchange_form").load(window.location.href + "#premium_exchange_form");
}
setInterval('autoRefresh_div()', 1000);
