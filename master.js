// This is just personal boilerplate code for making buttons work. 

$(document).ready(function() {
  $(".button").mousedown(function() {
    $(this).addClass("down");
  });
  $(".button").mouseup(function() {
    $(this).removeClass('down');
  });
  $(".button").hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });
});
