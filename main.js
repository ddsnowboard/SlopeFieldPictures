var PI_REPLACEMENT = "p";
var MAXX = 10;
var MAXY = 10;
var MINX = -10;
var MINY = -10;
var height = -1;
var width = -1;


function getColor(x, y, angle) {
  var red = Math.abs(Math.sin(angle) * 255);
  var green = Math.abs(Math.cos(angle) * 255);
  var blue = Math.abs((x / MAXX)) * 135;
  var alpha = Math.abs((y / MAXY)) * 255;
  return [red, green, blue, alpha];
}

function drawPixel(canvas, MINX, MAXX, MINY, MAXY, eqn) {
  var AMOUNT_OF_COLOR_DATA = 4;
  var height = canvas.height();
  var width = canvas.width();
  var xRatio = (MAXX - MINX) / width;
  var yRatio = (MAXY - MINY) / height;
  var htmlCanvas = document.getElementById("field");
  var ctx = htmlCanvas.getContext('2d');
  var data = ctx.createImageData(htmlCanvas.width, htmlCanvas.height);
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      var currIndex = y * (width * 4) + (x * 4);
      var values = {
        x: (x - width / 2) * xRatio,
        y: (y - height / 2) * yRatio,
        e: Math.E,
      };
      values[PI_REPLACEMENT] = Math.PI;
      var currentColor = getColor(x * xRatio, y * yRatio, eqn.eval(values));
      for (var i = 0; i < AMOUNT_OF_COLOR_DATA; i++) {
        data.data[currIndex + i] = currentColor[i];
      }
    }
  }
  ctx.putImageData(data, 0, 0);
}

$(document).ready(function() {
  // These regexes are used to put in asterisks where they are necessary. I loop through them before I let
  // math.js process the equation input. They must have two parenthetical groups that should have an asterisk
  // put in between them if found, because that's what the for loop expects. They also must be added to REGEXES
  // unless you make other arrangements for handling them.
  var TWO_LETTERS = /([A-Za-z)])([(A-Za-z])/;
  var TWO_PARENS = /([)])([(])/;
  var LETTER_PAREN = /([A-Za-z0-9])([(])|([)])([0-9A-Za-z])/;
  var REGEXES = [TWO_LETTERS, TWO_PARENS, LETTER_PAREN];
  // This is the jquery/jcanvas wrapped canvas, which is used for everything except
  // setting the height and width because it's almost impossible to do with jquery
  // or jcanvas to my knowledge.
  var jcanvas = $("#field");
  var canvas = document.getElementById("field");
  canvas.height = $(window).height() * 0.7;
  canvas.width = $(window).width() * 0.8;
  height = canvas.height;
  width = canvas.width;
  // These draw default lines. They get erased as soon as you click draw, but they make it clear what's going
  // on at first glance, so I have them here.
  drawLine(jcanvas, 0, canvas.height / 2 - 10, canvas.width - 20, canvas.height / 2 - 10);
  drawLine(jcanvas, canvas.width / 2 - 10, 0, canvas.width / 2 - 10, canvas.height - 20);
  $("#draw").click(function() {
    jcanvas.clearCanvas();
    var eqn = $("#equation").val().replace("π", PI_REPLACEMENT);
    for (var r = 0; r < REGEXES.length; r++) {
      var regex = REGEXES[r];
      while (regex.test(eqn)) {
        eqn = eqn.replace(regex, "$1*$2");
      }
    }
    eqn = math.compile(eqn);
    drawPixel(jcanvas, MINX, MAXX, MINY, MAXY, eqn);
  });
  $(document).keydown(function(event) {
    if (event.which === 13) {
      $("#draw").click();
    }
  });
  $("#equation").keyup(function(event) {
    if ($(this).val().indexOf("pi") !== -1) {
      var caret = $(this).caret();
      $(this).val($(this).val().replace("pi", "π"));
      $(this).caret(caret - 1);
    }
  });
  $(".preset").click(function() {
    $("#equation").val($(this).html());
    $("#draw").click();
  });
  $("#draw").click();
});
