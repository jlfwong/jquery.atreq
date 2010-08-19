// @require 'has_errors.js'
$(function() {
  console.log('sending GET /');
  $.get('test.html',function(data) {
    console.log(data['dneprop']['dne2']);
  });
});
