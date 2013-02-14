function loadTemplate(url) {
   var text;
   
   $.ajax({
       url: url,
       success: function(t) {
           //console.log(t);
           text = t;
       },
       async: false
    });
  return _.template(text);
}

function loadData(url) {
   var data;
   $.ajax({
       url: url,
       success: function(d) {
           //console.log(d);
           data = d;
       },
       async: false
    });
  return data;
}

var componentToHex = function(c) {
   var hex = c.toString(16);
   return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function(r, g, b) {
   return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var hexToRgb = function(hex) {
   var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
   hex = hex.replace(shorthandRegex, function(m, r, g, b) {
       return r + r + g + g + b + b;
   });

   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
       r: parseInt(result[1], 16),
       g: parseInt(result[2], 16),
       b: parseInt(result[3], 16)
   } : null;
}