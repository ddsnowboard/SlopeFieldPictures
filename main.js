var PI_REPLACEMENT = "p";
var MAXX = 10;
var MAXY = 10;
var MINX = -10;
var MINY = -10;

// These are just default values
var height = -1;
var width = -1;
var canvas = 0;

function getColor(x, y, angle) {
  var red = (Math.abs(Math.sin(angle)) * 255);
  var blue = (Math.abs(Math.cos(angle)) * 255);
  var green = (Math.abs(Math.atan(angle)) * 255);
  var alpha = (Math.abs(Math.tan(angle)) * 255);
  //var green = 220 +(Math.abs(Math.cos(angle)) * 100);
  //var blue = 100 +(Math.abs((x / MAXX)) * 150);
  //var alpha = 255;//var alpha = Math.abs((y / MAXY)) * 255;
  return [red, green, blue, alpha];
}

function drawPixel(MINX, MAXX, MINY, MAXY, eqn) {
  var AMOUNT_OF_COLOR_DATA = 4;
  // Ticks per pixel. Multiply this by the amount of pixels elapsed on the given
  // direction and you'll get the amount of ticks elapsed in that distance.
  var xRatio = (MAXX - MINX) / width;
  var yRatio = (MAXY - MINY) / height;
  var ctx = canvas.getContext('2d');
  var data = ctx.createImageData(width, height);
  for (var x = 0; x < width; x++) {
    for (var y = 0; y < height; y++) {
      // The imagedata data is just a one dimensional array, with each color for
      // each pixel in order; it goes red, green, blue, alpha for pixel 1, red,
      // green, blue, alpha for pixel 2, etc. It's a little silly. I would have
      // liked a 2 dimensional array or something like that, but so it goes.
      // Anyway, this gets the index of the red component for the given pixel
      // and then I can add some number to get the next ones.
      var currIndex = y * (width * 4) + (x * 4);
      var values = {
        x: (x - width / 2) * xRatio,
        y: (y - height / 2) * yRatio,
        e: Math.E,
      };
      // JavaScript 101: If you use dot notation or JSON notation for an
      // object, the name is a symbol in itself. If you use bracket notation,
      // it's a string, so I can name this attribute with a constant and its
      // name will be the string behind the constant, not "PI_REPLACEMENT"
      // itself.
      values[PI_REPLACEMENT] = Math.PI;
      var currentColor = getColor(x * xRatio, y * yRatio, eqn.eval(values));
      // This for-loop puts the color from getColor() into the image data.
      for (var i = 0; i < AMOUNT_OF_COLOR_DATA; i++) {
        data.data[currIndex + i] = currentColor[i];
      }
    }
  }
  ctx.putImageData(data, 0, 0);
}

$(document).ready(function() {// These four lines pick up the variables declared at the very top. If
  // I was interested in breaking the rules and giving JSHint a heart attack,
  // I could just never declare them with `var` and instead just talk about them
  // out of the blue. Little known fact, that. Hopefully.
  canvas = document.getElementById("field");
  canvas.height = $(window).height() * 0.7;
  canvas.width = $(window).width() * 0.8;
  height = canvas.height;
  width = canvas.width;
  // These regexes are used to put in asterisks where they are necessary. I loop
  // through them before I let math.js process the equation input. Each of these
  // regexes must have two parenthetical groups that need an asterisk put in
  // between them if they both exist, because that's what the for loop expects.
  // They also must be added to REGEXES. Or you could just do something
  // completely new, although it's worth noting that special cases aren't
  // special enough to break the rules.
  var TWO_PARENS = /([)])([(])/;
  var LETTER_PAREN = /([0-9xy])([(])|([)])([0-9xy])/;
  var TWO_LETTERS = /([xy])([xy])/;
  var REGEXES = [TWO_LETTERS, TWO_PARENS, LETTER_PAREN];
  // This is the jquery/jcanvas wrapped canvas, which is used for everything except
  // setting the height and width because it's almost impossible to do with jquery
  // or jcanvas to my knowledge.
  var jcanvas = $("#field");
  $("#draw").click(function() {
    jcanvas.clearCanvas();
    // Math.js doesn't like unicode, so I have to replace π with something else.
    // It's a constant declare at the top.
    var eqn = $("#equation").val().replace("π", PI_REPLACEMENT);
    // Do regex input checking on the equation.
    for (var r = 0; r < REGEXES.length; r++) {
      var regex = REGEXES[r];
      while (regex.test(eqn)) {
        eqn = eqn.replace(regex, "$1*$2");
      }
    }
    eqn = math.compile(eqn);
    drawPixel(MINX, MAXX, MINY, MAXY, eqn);
  });

  // Map enter key to the "draw" button.
  $(document).keydown(function(event) {
    if (event.which === 13) {
      $("#draw").click();
    }
  });

  // This replaces "pi" with π whenever it sees it. It happens when you lift
  // off the key, specifically.
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
