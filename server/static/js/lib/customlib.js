function retrieveView(pane){
  
  var viewMap = {
    'home' : StatusView,
    'lights': LightView,
    'power': PowerView
  }
  console.log(pane)
  if (viewMap[pane.id]){
    viewToBeReturned = new viewMap[pane.id](pane);
  } else {
    viewToBeReturned = new PageView(pane);
  }

  return viewToBeReturned;
}


var cachedTemplates = {};
function loadTemplate(url) {

  if (cachedTemplates[url]) {
    return cachedTemplates[url];
  }

  var text;
 
  $.ajax({
   url: url,
   success: function(t) {
     //console.log(t);
     text = t;
   },
   error: function() {
       console.log('hello world')
   },
   async: false
  });
  var tpl = _.template(text);
  cachedTemplates[url] = tpl;
  return tpl;
}

function loadData(url) {
   var data;
   $.ajax({
       url: url,
       success: function(d) {
           //console.log(d);
           data = d;
       },
       error: function() {
           return false;
       },
       async: false,
       dataType: "text"
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

var loxoneToRgb = function(bigdisgustingnumber){
  var logicalrepresentation = [];

  logicalrepresentation.r = (bigdisgustingnumber %100) * 255;
  logicalrepresentation.g = (Math.floor(bigdisgustingnumber/1000) %100) * 255;
  logicalrepresentation.b = (Math.floor(bigdisgustingnumber/1000000) %100) * 255;

  return logicalrepresentation;

}

var rgbToLoxone = function(logicalrepresentation){


  var bigdisgustingnumber = 0;

  bigdisgustingnumber += Math.floor(logicalrepresentation.b/255*100)*1000000

  bigdisgustingnumber += Math.floor(logicalrepresentation.g/255*100)*1000

  bigdisgustingnumber += Math.floor(logicalrepresentation.r/255*100)

  return bigdisgustingnumber;

}

var randomArray = function(size,multipler){

  arr =[]

  for(var i; i<size; i++){
    arr[i] = Math.random()*multiplier
  }

  return ar;
}

var rgbaToString = function(color,opacity){
  
  var thing = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2]  + ',' + opacity + ')';

  return thing;
}
/*
var generation =  [60, 60, 50, 40, 35, 45, 50, 65, 70, 75]
var consumption = [50, 55, 50, 45, 45, 50, 50, 55, 55, 60]
var graphData = function(goodarray, badarray){
  var data = [];
  var green = [];
  var red = [];
  var erase = [];

  $.each(consumption, function(i, consumption){
      if(consumption < generation[i]){
          green[i] = generation[i] - consumption;
          red[i] = 0;
          erase[i] = consumption;
      } else {
          green[i] = 0;
          red[i] = consumption - generation[i];
          erase[i] = generation[i];
      }
      console.log(green[i], red[i], erase[i])
  });
}
    
var chart = new Highcharts.Chart({
    chart: {
        renderTo: 'container',
        type: 'area'
    },
    plotOptions: {
        area: {
            stacking: true,
            lineWidth: 0,
            shadow: false,
            marker: {
                enabled: false
            },
            enableMouseTracking: false,
            showInLegend: false        
        },
        line: {
            zIndex: 5
        }
    },
    series: [{
        type: 'line',
        color: '#555',
        data: generation
    },{
        type: 'line',
        color: '#55e',
        data: consumption
    },{
        color: '#5e5',
        data: green
    },{
        color: '#e55',
        data: red
    },{
        id: 'transparent',
        color: 'rgba(255,255,255,0)',
        data: erase
    }]
}, function(chart){
    chart.get('transparent').area.hide();
});
*/
