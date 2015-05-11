// Constants for drawTick() `dir` parameter.
var VERTICAL = 1;
var HORIZONTAL = 0;

var PI_REPLACEMENT = "p";
var TICK_LENGTH = 20;

// This constant is the amount of total ticks on each axis. It can be increased by two at times, if
// the endpoints aren't naturally drawn. See above.
var RESOLUTION = 20;

function getColor(x, y, angle) { // This works, but the colors always come out black. I should fix that.
  var width = $("#field").width();
  var height = $("#field").height();
  // var red = (x/width)*255;
  // var green = (y/height)*255;
  // var blue = (angle/90)*255;
  var red = 255;
  var green = 0;
  var blue = 0;
  console.log("rgb(" + red.toString() + "," + green.toString() + "," + blue.toString() + ")");
  return "rgb(" + red.toString() + "," + green.toString() + "," + blue.toString() + ")";


}

function drawLine(canvas, x1, y1, x2, y2) {
  var STROKE_WIDTH = 2;
  var STROKE_STYLE = "black";
  canvas.drawLine({
    strokeStyle: STROKE_STYLE,
    strokeWidth: STROKE_WIDTH,
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2
  });
}

function drawTick(canvas, x, y, len, dir) {
  var STROKE_WIDTH = 2;
  var STROKE_STYLE = "black";
  if (dir === VERTICAL) {
    canvas.drawLine({
      strokeStyle: STROKE_STYLE,
      strokeWidth: STROKE_WIDTH,
      x1: x,
      y1: y + 0.5 * len,
      x2: x,
      y2: y - 0.5 * len
    });
  } else if (dir === HORIZONTAL) {
    canvas.drawLine({
      strokeStyle: STROKE_STYLE,
      strokeWidth: STROKE_WIDTH,
      x1: x + 0.5 * len,
      y1: y,
      x2: x - 0.5 * len,
      y2: y
    });
  }
}

function drawText(canvas, x, y, text) {
  // var STROKE_WIDTH = 2;
  // var STROKE_STYLE = "black";
  // var FILL_STYLE = "black";
  // var FONT_SIZE = 8;
  // var FONT_FAMILY = "Verdana, Geneva, sans-serif";
  // canvas.drawText({
  //   fillStyle: FILL_STYLE,
  //   strokeStyle: STROKE_STYLE,
  //   strokeWidth: STROKE_WIDTH,
  //   fontFamily: FONT_FAMILY,
  //   fontSize: FONT_SIZE,
  //   text: text,
  //   x: x,
  //   y: y
  // });
}

function drawGrid(canvas, minX, maxX, minY, maxY, resolution, eqn) {
  // I put a 20 pixel buffer on these just so I don't bump into the edge all the time.
  var height = canvas.height() - 20;
  var width = canvas.width() - 20;
  // This is the origin point, measured in on-screen pixels. If you put something at this point
  // with javascript, it will go to the cross in the axes.
  var origin = {
    // This is negative because of the weirdness coming from x starting at the negative side
    // as opposed to y starting from the positive side.
    x: -1 * (minX / (maxX - minX)) * width,
    y: (maxY / (maxY - minY)) * height
  };
  // These are the coordinates of tick marks (and later slopes) on the graph *in terms of on-screen pixels.*
  var fieldCoords = {
    x: [],
    y: []
  };
  // These map to fieldCoords, but they are in terms of the graph itself.
  var graphCoords = {
    x: [],
    y: []
  };

  // This is how far away from the line the text should be.
  var TEXT_OFFSET = 20;
  // This is to give me a little breathing room for anything I draw right on the edge of the screen.
  var EDGE_OFFSET = 5;

  // This is the amount of ticks that have to be before the origin point. It finds the proportion of the
  // graph that is before the origin, and multiplies it by the amount of ticks to get the amount of ticks
  // that have to be before the origin point.
  var offsetX = Math.floor(((minX / (maxX - minX)) * resolution));

  // tickY and tickX prevent issues from arising due to the origin being off screen because only one side of an axis is being shown.
  var tickY;
  if (origin.y < 0) {
    tickY = EDGE_OFFSET;
  } else if (origin.y > height) {
    tickY = height;
  } else {
    tickY = origin.y;
  }

  // This draws each tick mark and puts the coordinates into their appropriate array (cf. fieldCoords
  // and graphCoords).
  for (var i = 0; i <= resolution; i++) {
    var currx = origin.x + ((i + offsetX) * (width / resolution));
    fieldCoords.x.push(currx);
    // This strangeness rounds to two decimal places to take care of issues arising from floating
    // point inaccuracy. I wouldn't care, but these are getting printed, and I hate when that kind of
    // stuff comes up to the user.
    graphCoords.x.push(+((currx - origin.x) * ((maxX - minX) / width)).toFixed(2));
    drawTick(canvas, currx, tickY, TICK_LENGTH, VERTICAL);
  }
  var tickX;
  if (origin.x < 0) {
    tickX = EDGE_OFFSET;
  } else if (origin.x > width) {
    tickX = width;
  } else {
    tickX = origin.x;
  }
  var offsetY = Math.floor(((maxY / (minY - maxY)) * resolution));
  // This draws the tick marks and populates the y part of the coordinate lists.
  for (var i = 0; i <= resolution; i++) {
    var curry = origin.y + ((i + offsetY) * (height / resolution));
    fieldCoords.y.push(curry);
    graphCoords.y.push(+((curry - origin.y) * ((minY - maxY) / height)).toFixed(2));
    drawTick(canvas, tickX, curry, TICK_LENGTH, HORIZONTAL);
  }

  // This draws the axes, adjusting for if they are off-screen.
  if (origin.x > 0 && origin.x < width) {
    drawLine(canvas, origin.x, 0, origin.x, height);
  } else if (origin.x < 0) {
    drawLine(canvas, EDGE_OFFSET, 0, EDGE_OFFSET, height);
  } else if (origin.x > width) {
    drawLine(canvas, width, 0, width, height);
  }
  if (origin.y > 0 && origin.y < height) {
    drawLine(canvas, 0, origin.y, width, origin.y);
  } else if (origin.y < 0) {
    drawLine(canvas, 0, EDGE_OFFSET, width, EDGE_OFFSET);
  } else if (origin.y > height) {
    drawLine(canvas, 0, height, width, height);
  }

  // cf. above.
  // Some of the signs and orders are switched because the y coordinates on the HTML canvas start
  // at the top, at the highest y value on the graph, while the opposite is true of x.
  var textY;
  if (origin.y < 0) {
    textY = EDGE_OFFSET + TEXT_OFFSET;
  } else if (origin.y > height) {
    textY = height - TEXT_OFFSET;
  } else {
    textY = origin.y - TEXT_OFFSET;
  }
  var textX;
  if (origin.x < 0) {
    textX = EDGE_OFFSET + TEXT_OFFSET;
  } else if (origin.x > width) {
    textX = width - TEXT_OFFSET;
  } else {
    textX = origin.x + TEXT_OFFSET;
  }

  // REFACTOR THIS TO WORK WITH THE NEW FEATURES THAT DETECT IF THE AXIS IS OFF-SCREEN.
  if (textX === origin.x && textY === origin.y) {
    // These four if statements check if it will plot the endpoints automatically, and if not, they do it, so that
    // you can have good confirmation that the x and y values you put in were reflected. Sometimes, in order to get a
    // tick mark at the origin at all times, there is not one at the edge, and this fixes that.
    if (graphCoords.x[0] !== minX) {
      drawLine(canvas, 0, origin.y - TICK_LENGTH / 2, 0, origin.y + TICK_LENGTH / 2);
      drawText(canvas, 0, origin.y - TEXT_OFFSET, minX);
    }
    if (graphCoords.x[graphCoords.x.length - 1] !== maxX) {
      drawText(canvas, width, origin.y - TEXT_OFFSET, maxX);
      drawLine(canvas, width, origin.y - TICK_LENGTH / 2, width, origin.y + TICK_LENGTH / 2);
    }
    if (graphCoords.y[0] !== maxY) {
      drawText(canvas, origin.x + TEXT_OFFSET, 0, maxY);
      drawLine(canvas, origin.x - TICK_LENGTH / 2, 0, origin.x + TICK_LENGTH / 2, 0);
    }
    if (graphCoords.y[graphCoords
        .length - 1] !== minY) {
      drawText(canvas, origin.x + TEXT_OFFSET, height, minY);
      drawLine(canvas, origin.x - TICK_LENGTH / 2, height, origin.x + TICK_LENGTH / 2, height);
    }
  }
  // This draws the rest of the text.
  for (var x = 0; x < fieldCoords.x.length; x++) {
    drawText(canvas, fieldCoords.x[x], textY, graphCoords.x[x]);
  }

  for (var y = 0; y < fieldCoords.y.length; y++) {
    if (graphCoords.y[y] !== 0) {
      drawText(canvas, textX, fieldCoords.y[y], graphCoords.y[y]);
    }
  }

  // I have different constants for the slope lines because I wanted to bug Jay by making them green and I didn't know
  // if the numbers I had would be too big or small.
  var SLOPE_STROKE_STYLE = "#0f0";
  var SLOPE_STROKE_WIDTH = 2;
  // These nested for loops draw the slopes. There are two `drawVector()`s to draw both halves. I need to have
  // it be the right length, but also be centered at the right spot, so it draws the first half, and then the
  // other half from the same point.
  for (var i = 0; i < fieldCoords.x.length; i++) {
    var x = graphCoords.x[i];
    var xCoord = fieldCoords.x[i];
    for (var j = 0; j < fieldCoords.y.length; j++) {
      var y = graphCoords.y[j];
      var values = {
        e: Math.E,
        x: x,
        y: y
      };

      var yCoord = fieldCoords.y[j];
      var angle = 90 - (Math.atan(eqn.eval(values)) * (180 / Math.PI));
      var color = getColor(xCoord, yCoord, angle);
      // Javascript, I hate you.
      values[PI_REPLACEMENT] = Math.PI;

      canvas.drawVector({
        strokeWidth: SLOPE_STROKE_WIDTH,
        strokeStyle: color,
        x: xCoord,
        y: yCoord,
        a1: angle,
        l1: TICK_LENGTH / 2
      });
      canvas.drawVector({
        strokeWidth: SLOPE_STROKE_WIDTH,
        strokeStyle: color,
        x: xCoord,
        y: yCoord,
        a1: angle,
        l1: -1 * TICK_LENGTH / 2
      });
    }
  }
}
$(document).ready(function() {
  // These regexes are used to put in asterisks where they are necessary. I loop through them before I let
  // mathjs process the equation input. They must have two parenthetical groups that should have an asterisk
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
  canvas.height = $(window).height() * 0.8;
  canvas.width = $(window).width() * 0.5;
  // These draw default lines. They get erased as soon as you click draw, but they make it clear what's going
  // on at first glance, so I have them here.
  drawLine(jcanvas, 0, canvas.height / 2 - 10, canvas.width - 20, canvas.height / 2 - 10);
  drawLine(jcanvas, canvas.width / 2 - 10, 0, canvas.width / 2 - 10, canvas.height - 20);
  $("#draw").click(function() {
    var maxX = parseInt($("#maxx").val());
    var maxY = parseInt($("#maxy").val());
    var minX = parseInt($("#minx").val());
    var minY = parseInt($("#miny").val());
    // Input checking...
    if (minX >= maxX) {
      alert("The minimum X must be less than the maximum X");
      return;
    } else if (minY >= maxY) {
      alert("The minimum Y must be less than the maximum Y");
      return;
    }
    jcanvas.clearCanvas();
    var eqn = $("#equation").val().replace("π", PI_REPLACEMENT);
    for (var r = 0; r < REGEXES.length; r++) {
      var regex = REGEXES[r];
      while (regex.test(eqn)) {
        eqn = eqn.replace(regex, "$1*$2");
      }
    }
    eqn = math.compile(eqn);
    drawGrid(jcanvas, minX, maxX, minY, maxY, RESOLUTION, eqn);
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
});
