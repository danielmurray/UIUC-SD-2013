// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {
  },

  assign: function(view, selector) {
    //console.log(view,selector)
    view.setElement(this.$(selector));
  },

  route: function(part, remaining) {
    return {};
  },

  dispose: function() {
    this.remove();
    this.off();
    if (this.model) {
      this.model.off(null, null, this);
    }
  },

  animateIn: function(){
    //console.log('No Animation In');
  },

  animateOut: function(){
    //console.log('No Animation Out');
  }
});

var HomeView = BaseView.extend({
  el: "#viewport",
  events: {
    "click .nav-button":  "navigateTo"
  },
  initialize: function() {
    //IMPORTANT LINE OF CODE 
    var that = this;

    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/nav.html");
    var data = loadData("/static/panes.json");
    this.panes = JSON.parse(data);
    this.currpane = 'home'
    
  },
  route: function(part, remaining) {
    
    if (!part) {
      navigate("home", true); // don't trigger nav inside route
    }
  
    //id to view map
    var viewMap = {
      'home' : StatusView,
      'lights': LightingView,
      'hvac': HvacView,
      'windoor': WindoorView,
      'power': PowerView,
      'water': WaterView,
      'opt': OptView
    }

    //establish pane data to be passed to view

    if(this.panes[part]){
      this.currentpane = this.panes[part];
    } else {
      //404 routes home
      this.currentpane = {
        "id": 'home',
        "name": "etHome", 
        "color": [
          41,
          41,
          41
        ]
      };      
    }

    //find view in id-view map

    if (viewMap[this.currentpane.id]){
      viewToBeReturned = new viewMap[this.currentpane.id](this.currentpane);
    } else {
      viewToBeReturned = new PageView(this.currentpane)
    }

  
    return {
      "#dashboard-wrapper": viewToBeReturned
    };    
    

  },
  render: function() {
    var renderedTemplate = this.template({panes: this.panes, currpane: this.currentpane});
    this.$el.html(renderedTemplate);
  },
  animateIn: function(click){
    
    if(!this.currentpane)
      return;
    /*
    var slider = $('.' + this.currentpane.id + '.icon-nav .slider');
    slider.animate({
      width: '100%'
    },{
      duration: 500, 
      queue: true
    });
  */
  },
  navigateTo: function(click){
    
    that = click.currentTarget;

    //How do I improve this This information is written in HTML
    var next = $(that).context.classList[2];

    if(this.currentpane == next)
      return;

    navigate(next, false); 
  }
});

var PageView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    //console.log(data);
    //console.log(this);
    this.on("assign", this.animateIn);
    this.currentpane = data;
    this.template = loadTemplate("/static/views/pageview.html");
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1
    },{
      queue: false,
      duration: 200
    });
  },
  route: function(part) {
    //console.log(part)
    return{};
  },
  render: function() {
    console.log(this)
    var renderedTemplate = this.template({currentpane: this.currentpane});
    this.$el.html(renderedTemplate);
  }
});

var StatusView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    //console.log(data)
    this.on("assign", this.animateIn);
    this.statustemplate = loadTemplate("/static/views/status.html");
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    //console.log(part)
    return{};
  },
  render: function() {
    var renderedTemplate = this.statustemplate();
    this.$el.html(renderedTemplate);
  }
});

var LightingView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.lighttemplate = loadTemplate("/static/views/lightspage.html");

    this.collection = window.Lights;
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {

    floorplanview = new FloorPlanView({collection: this.collection});
    floorplanview.on('zoneselect', function(zone){
      navigate("lights/"+ zone , false)
    });

    var viewsToBeReturned = {
      "#floorplanwrapper" : floorplanview
    };

    if(part){
      data = {}
      data['id'] = part;
      data.lights = this.collection.getLightsByZone(part);

      lightcontrolview = new LightControlView(data);
      
      viewsToBeReturned['#overlaywrapper'] = lightcontrolview;
    }

    return viewsToBeReturned;


  },
  render: function() {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.lighttemplate();
    
    this.$('#pagecontent').html(renderedTemplate);

    }
});

var WindoorView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.windoortemplate = loadTemplate("/static/views/windoor.html");
    this.collection = window.Blinds;
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {

    floorplanview = new FloorPlanView({collection: this.collection});
    floorplanview.on('zoneselect', function(zone){
      navigate("windoor/"+ zone , false)
    });

    return{
      "#floorplanwrapper" : floorplanview
    };

    /*
    if(!part || part == 'home'){
      floorplanview = new FloorPlanView(this.collection);
      return{
        "#floorplanwrapper" : floorplanview
      };
    }else{
      floorplanview = new FloorPlanView(this.collection);

      data = {}
      data['id'] = part;
      data.lights = this.collection.getLightsByZone(part);

      //TO DO add detail view
      //lightcontrolview = new LightControlView(data);
      return{
        "#floorplanwrapper" : floorplanview
        //,"#overlaywrapper" : lightcontrolview
      };
    }
    */
  },
  render: function() {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.windoortemplate();
    
    this.$('#pagecontent').html(renderedTemplate);

    }
});

var LightControlView = BaseView.extend({
  el: 'div',
  initialize: function(zone) {
    //console.log(zone)
    this.data = zone
    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/lightcontrol.html");
  },
  animateIn: function(){
    this.$('.modal').height('0');

    this.$('.modal').animate({
      height: '67%'
    },{
      queue: true,
      duration: 200
    });
  },
  exit: function(){
    $('#shadow').css('display', 'none');
    navigate('lights', false);
  },
  updateValue: function(value){
    _.each(this.lights, function(light){
      light.model.updateValue(value);
    });
  },
  route: function(part) {
    var that = this;

    //pointers for this view
    this.lights = {};

    //views to be returned
    lightstoberendered = {};

    var sum = 0;
    var count = 0;

    _.each(this.data.lights, function(light) {

      lightview = new LightView(light);
      lightstoberendered['#'+light.id] = lightview;
      that.lights[light.id] = {};
      that.lights[light.id].id = light.id;
      that.lights[light.id].view = lightview;
      that.lights[light.id].type = light.get('type') 
      that.lights[light.id].model = light;
      that.lights[light.id].attached = true;

      switch(that.lights[light.id].type){
        case 'rgb':
          value = light.getcolor().l*100;
          break;
        case 'digital':
          value = light.get('value')*100;
          break;
        default:
          value = light.get('value');
      }

      value = parseInt(value);
      sum += value;

      count++;
    });

    this.lastvalue = this.data['value'] = sum/count;
    this.height = (100-(count-1)*2)/count;

    return lightstoberendered;    
  },
  render: function() {
    var that = this;

    var renderedTemplate = this.template({ id: this.id, lights: this.lights, height: this.height });
    this.$el.html(renderedTemplate);
    this.renderZoneDimmer();
    $('#shadow').css('display', 'block')

    $('#shadow').click(function(e){  
      if( e.target !== this ) 
        return;
      else
        that.exit();
    });

  },
  renderZoneDimmer: function() {
    var that = this;

    this.$("#zonedimmer").slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: this.data['value'],
        start: function(event, ui) {
          that.dragging = true;
        },
        stop: function(event, ui) {
          that.dragging = false;
        },
        slide: function(event, ui) {
          that.updateValue(ui.value)
          this.lastvalue = ui.value;
        }
      });

      this.$("#zoneon").click(function() {
        that.updateValue(that.lastvalue)
      });

      this.$("#zoneoff").click(function() {
        that.updateValue(0);
      });
  }
});

var LightView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.model = data;

    this.id = this.model.id;
    this.type = this.model.get('type');

    this.lighttemplate = loadTemplate("/static/views/light.html");
    console.log('did we get here')
  },
  animateIn: function(){

  },
  route: function(part) {
    this.listenTo(this.model, 'change', this.render);
    return{};
  },
  render: function(pane, subpane) {
    switch(this.type){
    case 'rgb':
      this.value = this.model.getcolor().l*100;
      this.color = true;
      this.colorhex = '#' + this.model.get('value');
      this.colorhue = this.model.getcolor().h;
      break;
    case 'digital':
      this.value = this.model.get('value')*100;
      this.color = false;
      break;
    default:
      this.value = parseInt(this.model.get('value'));
      this.color = false;
    }

    if(this.value){
      this.status = 'on'
    }else{
      this.status = 'off'
    }

    var renderedTemplate = this.lighttemplate({model: this.model, colorhex: this.colorhex});
    this.$el.html(renderedTemplate);
    this.renderLightDimmer();

  },
  renderLightDimmer: function() {
    var that = this;

    this.$('.lightname').click(function(){
      var value = that.model.get('value');

      if(value){
        that.model.lastvalue = value;
        that.model.updateValue(0);
      }else{
        that.model.updateValue(that.model.lastvalue)
      }

    });

    this.$('.sliderholder').slider({
      range: "min",
      min: 0,
      max: 100,
      value: that.value,
      start: function(event, ui) {
        that.dragging = true;
      },
      stop: function(event, ui) {
        that.dragging = false;
      },
      slide: function(event, ui) {
        
        that.model.updateValue(ui.value)
      }

    });

    if(this.color){
      this.$('.hslslider').slider({
        range: "min",
        min: 0,
        max: 360,
        value: this.colorhue,
        start: function(event, ui) {
          that.dragging = true;
        },
        stop: function(event, ui) {
          that.dragging = false;
        },
        slide: function(event, ui) {
          
          that.colorhex = that.model.updateColor(ui.value);
        }
      });
    }
  }
});

var PowerView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.powertemplate = loadTemplate("/static/views/power.html");
    
    this.collection = [];

    this.collection[0] = window.PV;
    //this.collection[0]._sortBy('value',true);

    this.collection[1] = window.Power;
    //this.collection[1]._sortBy('power',true);
    

  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {

    graph = new GraphView({
      type:'area',
      series:[
        {
          name:'Production',
          color: [85,160,85],
          collection: this.collection[0]
        },
        {
          name:'Consumption',
          color: [173,50,50],
          collection: this.collection[1]
        }
      ],
      range: 'day',
      unit: "w"
    });

    consumptiondatabox = new DataBox({
      id: 'Consumption',
      databoxcontent: 'table',
      subviews: {
        table: {
          id: 'table',
          view: TableView,
          args: {collection: this.collection[1], name: "id", value: "power", unit: "w"}
        },
        graphic: {
          id: 'graphic',
          view: FloorPlanView,
          args: {collection: this.collection[1]}
        },
        history: {
          id: 'history',
          view: GraphView,
          args: {
            type:'line',
            series:[
              {
                name:'Consumption',
                color: [173,50,50],
                collection: this.collection[1]
              }
            ],
            range: 'day',
            unit: "w"
          }
        }
      }
    });   
    
    generationtdatabox = new DataBox({
      id: 'Generation',
      databoxcontent: 'table',
      subviews: {
        table: {
          id: 'table',
          view: TableView,
          args: {collection: this.collection[0], name: "id", value: "value", unit: "w"}
        },
        graphic: {
          id: 'graphic',
          view: PVGraphicView,
          args: {

          }
        },
        history: {
          id: 'history',
          view: GraphView,
          args: {
            type:'line',
            series:[
              {
                name:'Generation',
                color:[85,160,85],
                collection: this.collection[0]
              }
            ],
            range: 'day',
            unit: "w"
          }
        }
      }
    });  

    return{
      '#graphwrapper': graph
      ,'#consumptionwrapper': consumptiondatabox
      ,'#generationwrapper': generationtdatabox
    }
  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.powertemplate();
    this.$('#pagecontent').html(renderedTemplate);
  }
});

var WaterView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.watertemplate = loadTemplate("/static/views/water.html");
    
    this.collection = [];

    this.collection[0] = window.Water;
    this.collection[0]._sortBy('value',true);
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    graph = new GraphView({
      type:'line',
      series:[
        {
          name:'Consumption',
          color: [84,175,226],
          collection: this.collection[0]
        }
      ],
      range: 'day',
      unit: "gal"
    });

    consumptiondatabox = new DataBox({
      id: 'Consumption',
      databoxcontent: 'table',
      subviews: {
        table: {
          id: 'table',
          view: TableView,
          args: {collection: this.collection[0], name: "id", value: "value", unit: "gal/min"}
        },
        graphic: {
          id: 'graphic',
          view: FloorPlanView,
          args: {collection: this.collection[0]}
        }
      }
    });   

    return{
      '#graphwrapper': graph
      ,'#consumptionwrapper': consumptiondatabox
      //,'#greywaterwrapper': generationtdatabox
    }

  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.watertemplate();
    this.$('#pagecontent').html(renderedTemplate);
  }
});

var HvacView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.watertemplate = loadTemplate("/static/views/hvac.html");
    that = this
    this.collection = [];

    this.collection[0] = window.HVAC;
    this.collection[0]._sortBy('value',true);
    
    if( this.collection[0].models.length >0 ){
      this.model = this.collection[0].models[0]
    }else{
      console.log('No HVAC Models Found')
    }

  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    graph = new GraphView({
      type:'line',
      series:[
        {
          name:'Consumption',
          color: [173,50,50],
          collection: this.collection[0]
        }
      ],
      range: 'day',
      unit: "w"
    });

    thermostat = new Thermostat({model: this.model});

    return{
      '#graphwrapper': graph
      ,'#thermostatwrapper': thermostat
      //,'#weekviewwrapper': generationtdatabox
    }

  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.watertemplate();
    this.$('#pagecontent').html(renderedTemplate);
    
    $('.thermostatknob').knob();
  }
});

var OptView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);    
    this.opttemplate = loadTemplate("/static/views/optimizer.html");
    console.log("Opt View Initialized");

    //BRYANT BUT YOU OPTIMIZER COLLECTION RIGHT IN HERE
    this.collection = window.Devices;
    this.collection._sortBy('value',true);
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    
    console.log(this.collection)

    table = new TableViewWindoor({collection:this.collection});

    return{
      '#optimizertabledebug': table
      //,'#weekviewwrapper': generationtdatabox
    }

  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.opttemplate();
    this.$('#pagecontent').html(renderedTemplate);
    
  }
});

var DataBox = BaseView.extend({
  el: 'div',
  events: {
    "click .contentselection":  "changecontent"
  },
  initialize: function(data) {
    
    this.template = loadTemplate("/static/views/databox.html");
    this.databox = data;

    this.contentdivselector = '#databoxcontentwrapper';
    this.currcontentview = this.databox.databoxcontent; //View to be rendered to the databox
    this.views = this.databox.subviews;
    
  },
  changecontent: function(click){
    //acquiring selected view id
    var newcontentview = click.target.id.split("/")[0];
    
    this.currcontentview = newcontentview;
    
    this.rendercontentview();
  },
  route: function(part) {
    return {};
  },
  render: function() {
    var renderedTemplate = this.template({subviews: this.views, currentcontent: this.currcontentview} );
    this.$el.html(renderedTemplate);
    this.rendercontentview()
  },
  rendercontentview: function() {
    //prepare content view
    var obj = this.views[this.currcontentview]
    var currview = new obj.view(obj.args);
    currview.setElement(this.$(this.contentdivselector));

    //render and animate
    router.displayPart(0,currview,[])

  }
});

var GraphView = BaseView.extend({
  el: 'div',
  initialize: function(graphdata) {

    this.type = graphdata.type;
    this.timeperiod = graphdata.range;
    this.inputdata = graphdata.series;
    this.unit = graphdata.unit;

    this.organizeHistoricalData();

    this.template = loadTemplate("/static/views/graph.html");

  },
  organizeHistoricalData: function(){    
    that = this;
    
    this.series = [];

    $.each(this.inputdata, function(i, inputdata){
      that.series[i] = {
        name: inputdata.name,
        type: 'area',
        color: rgbaToString(that.inputdata[i].color,1),
        data: that.getHistoricalData(inputdata.collection)
      }
    });

    if(this.type == 'area' && this.series.length >= 2){

      this.series[0].type = this.series[1].type = 'line'

      this.line1 = this.series[0].data;
      this.line2 = this.series[1].data;
      
      this.area1 = {
        type: 'area',
        color: rgbaToString(this.inputdata[0].color,0.1),
        data:[]
      };

      this.area2 = {
        type: 'area',
        color: rgbaToString(this.inputdata[0].color,0.1),
        data:[]
      };

      this.erase = {
          id: 'transparent',
          color: 'rgba(255,255,255,0)',
          data: []
      };

      $.each(this.series[0].data, function(i){

        that.area1.data[i] = [];
        that.area2.data[i] = [];
        that.erase.data[i] = [];

        //assign x-value
        that.area1.data[i][0] = that.area2.data[i][0] = that.erase.data[i][0] = that.line1[i][0];


        //determine y-value
        if(that.line2[i][1] <0){
          that.line2[i][1] = 0;
        }
        
        if(that.line1[i][1] <0){
          that.line1[i][1] = 0;
        }

        if(that.line2[i][1] < that.line1[i][1]){
            that.area1.data[i][1] = that.line1[i][1] - that.line2[i][1];
            that.area2.data[i][1] = 0;
            that.erase.data[i][1] = that.line2[i][1];
        } else {
            that.area1.data[i][1] = 0;
            that.area2.data[i][1] = that.line2[i][1] - that.line1[i][1];
            that.erase.data[i][1] = that.line1[i][1];
        }
      });

      this.series.push(this.area1,this.area2,this.erase);
    }
  },
  getHistoricalData:function(collection){

    var now = new Date();
    var now = Math.round((new Date()).getTime()) - now.getTimezoneOffset()*60*1000;
    
    switch(this.timeperiod){
      case 'day':
        var then = now - 24*60*60*1000;
        break;
      case 'week':
        var then = now - 7*24*60*60*1000;
        break;
      case 'month':
        var then = now - 30*24*60*60*1000;
        break;
      default:
        var then = now - 365*24*60*60*1000;
    }

    //console.log(collection.getHistoricalData(now,then,100))
    return collection.getHistoricalData(now,then,100);

  },
  route: function(part) {
    return{};
  },
  render: function(pane, subpane) {
    var that = this;

    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);

    setTimeout(function(){
      that.renderChart()
    }, 400);

    $('.histdata').click(function(){
      that.timeperiod = this.id;

      $('.histdata').removeClass('selected');
      $(this).addClass('selected')

      that.organizeHistoricalData();

      that.renderChart();

    });
  },
  renderChart: function(){
    var that = this;
    //sometimes the template doesn't render in time 
    //for this chart to render correctly
    var container = this.$('#graphholder');

    this.$el.chart = new Highcharts.Chart({
      chart: {
          renderTo: container[0],
          type: that.type,
          color: 'rgba(245, 245, 245, 0.2)',
          backgroundColor:'rgba(255, 255, 255, 0)',
          marginRight: 0,
          marginLeft: 0,
          marginTop: 0,
          marginBottom: 0
      },
      plotOptions: {
          area: {
            fillOpacity: 0.4,
            marker: {
              symbol: 'circle',
              radius: 0,
              enabled:false,
              fillOpacity: 0
            },
            stacking: true,
            lineWidth: '3px',
            shadow: false,
            showInLegend: true        
          },
          line: {
            zIndex: 5
          },
          series: {
            marker: {
                enabled: false
            }
          }
      },
      title: {
        text: '',
        style: {
            font: '12px neou'
         }
      },
      tooltip: {
        enabled:false
        /*
        formatter: function() {
          var date = new Date(this.x);
          
          var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

          var year = date.getFullYear();
          var month = months[date.getMonth()];
          var day = date.getDate();
          var hour = date.getHours();
          var min = date.getMinutes();
          var sec = date.getSeconds();
          console.log(this.points)
          var s = month+' '+day+' '+hour+':'+min + '<br />'+
          'Production: ' + this.points[0].y.toFixed(0)+ 'kW<br />'+
          'Consumption: ' + this.points[1].y.toFixed(0) + 'kW'
          
          return s;
        },
        */
      },
      xAxis: {
        oppposite: true,
        showFirstLabel: true,
        lineWidth:0,
        type: 'datetime',
        tickPixelInterval: 150,
        showLastLabel: true,
        dateTimeLabelFormats: {
          second: '%H:%M',
          minute: '%H:%M',
          hour: '%l%p',
          day: '%a',
          week: '%b %e',
          month: '%b \'%y',
          year: '%Y'  
        },
        labels: {
            style: {
              fontFamily: "Lato-thin",
              fontSize: "20px",
              color: 'rgba(245, 245, 245, 0.4)',
              fontWeight: 'bold'
            },
            y: -5
        }
      },
      yAxis: {
        opposite: true,
        showFirstLabel: false,
        allowDecimals: false,
        title: {
            text: '',
            style: {
                color: '#FFF',
                font: '8px neou'
            }
        },
        labels: {
          formatter: function(){
            return this.value + that.unit;
          },
          style: {
              fontFamily: "Lato-thin",
              fontSize: "20px",
              color: 'rgba(245, 245, 245, 0.4)',
              fontWeight: 'bold'
            },
          x:-65
        },
        gridLineWidth: 1,
        gridLineColor: 'rgba(245, 245, 245, 0.4)',
        gridLineDashStyle: 'dash',
        plotLines: [{
                value: 0,
                width: 1
        }]
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      credits: {
        enabled: false
      },
      series: that.series,
    }, function(chart){
      if(chart.get('transparent'))
        chart.get('transparent').area.hide();
    });
    
  }
});

var TableView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.value = data.value;
    this.unit = data.unit;
    this.template = loadTemplate("/static/views/table.html");
    this.name = data.name;
    this.collection = data.collection;
  },
  route: function(part) {
    var that = this;

    //pointers for this view
    this.tableEntries = {};

    //views to be returned
    tableEntriesToRendered = {};

    console.log(this.collection)
    var that = this;
    _.each(this.collection, function(model) {

      tableentry = new TableViewEntry(model, that.name, that.value, that.unit);
      tableEntriesToRendered['#'+model.id] = tableentry;
      that.tableEntries[model.id] = {};
      that.tableEntries[model.id].id = model.id;
      that.tableEntries[model.id].view = tableentry;
      that.tableEntries[model.id].model = model;

    });

    return tableEntriesToRendered;
  },
  render: function() {
    var renderedTemplate = this.template({collection: this.collection});
    this.$el.html(renderedTemplate);
  }
});

var TableViewWindoor = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.template = loadTemplate("/static/views/table.html");
    
    this.collection = data.collection;
  },
  route: function(part) {
    var that = this;

    //pointers for this view
    this.tableEntries = {};

    //views to be returned
    tableEntriesToRendered = {};

    console.log(this.collection)

    _.each(this.collection.models, function(model) {

      tableentry = new TableViewEntryOpt(model);
      tableEntriesToRendered['#'+model.id] = tableentry;
      that.tableEntries[model.id] = {};
      that.tableEntries[model.id].id = model.id;
      that.tableEntries[model.id].view = tableentry;
      that.tableEntries[model.id].model = model;

    });

    return tableEntriesToRendered;
  },
  render: function() {
    var renderedTemplate = this.template({collection: this.collection});
    this.$el.html(renderedTemplate);
  }
});

var TableViewEntryOpt = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.template = loadTemplate("/static/views/optviewtable.html");
    this.model = data;
    // this.model.on("all",this.render);
  },
  route: function(part) {
    return {};
  },
  render: function() {
    var renderedTemplate = this.template({model:this.model});
    this.$el.html(renderedTemplate);
  }
});

var TableViewEntry = BaseView.extend({
  el: 'div',
  initialize: function(data, name, value, unit) {
    this.value = value;
    this.unit = unit;
    this.name = name;
    this.template = loadTemplate("/static/views/tableentry.html");
    this.model = data;
  },
  route: function(part) {
    return {};
  },
  render: function() {
    var renderedTemplate = this.template({model:this.model, name: this.name, value: this.value, unit: this.unit});
    this.$el.html(renderedTemplate);
  }
});

var FloorPlanView = BaseView.extend({
  el: 'div',
  initialize: function(data) {

    this.template = loadTemplate("/static/views/floorplan.html");
    this.collection = data.collection;

    var paths = loadData("/static/paths.json");
    this.floorplanpaths = JSON.parse(paths);
  },
  selectzone: function(zone){
    this.trigger('zoneselect', zone);
  },
  route: function(part) {

    var floorplandataoverlayview = new FloorPlanDataOverlay({
      collection: this.collection,
      paths: this.floorplanpaths
    });

    return {
      '#floorplandataoverlay' : floorplandataoverlayview
    };
  },
  render: function() {
    var that = this;

    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  
    setTimeout(function(){
      that.renderFloorplan()
    }, 200);
  },
  renderFloorplan : function(){
    var that  = this;

    this.$('#floorplanholder').height('95%');

    console.log(this.$el.height())
    h = this.$('#floorplanholder').height();
    w = this.$('#floorplanholder').width();

    console.log(h,w)
    var floorplancanvas = new ScaleRaphael( "floorplanholder", 350, 300);

    var zones = [];

    var raphzones = floorplancanvas.set();

    _.each(this.floorplanpaths.zones, function(zone){
        var thing = zones[zone.id] = floorplancanvas.path(zone.path).attr({
          "id": zone.id, 
          "fill": "rgb(0,15,30)", 
          "stroke": "#000000", 
          "stroke-width": 0, 
          "opacity": .75, 
          'stroke-opacity':'0',
          'text': 'hello world!'
        }); //creates the raphael objects then stores them to an array zones
        zones[zone.id].id = zone.id;    //setting the ids of the raphael objects
        raphzones.push(thing)           //pushing the zones to a raphael group object for easier manipulation
    })


    var outerWalls = floorplancanvas.path(this.floorplanpaths.outerwalls).attr({
      'fill':'#000',
      'fill-opacity':'0', 
      'stroke':'#000',
      'stroke-width':'3',
      'stroke-opacity':'1'
    });
    
    var innerWalls = floorplancanvas.path(this.floorplanpaths.innerwalls).attr({
      'fill':'#000',
      'fill-opacity':'0', 
      'stroke':'#000',
      'stroke-width':'2',
      'stroke-opacity':'1'
    });


    //BINDINGS
    raphzones.mouseover(function (event) {
        if(this.id != that.selectedlight)
            this.attr({"opacity": 1});
    });
    raphzones.mouseout(function (event) {
        if(this.id != that.selectedlight){
            this.attr({"opacity": .75});
        }
    });
    raphzones.click(function (event) {
        that.selectzone(this.id)
    });  

    this.floorplancanvas = floorplancanvas;
    this.zones = zones;
    this.raphzones = raphzones;
    
      
    floorplancanvas.changeSize(w, h, false, true);
  }
});

var FloorPlanDataOverlay = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.template = loadTemplate("/static/views/floorplandataoverlay.html");
    this.collection = data.collection;
    this.floorplanpaths = data.paths;

  },
  route: function(part) {
    return {};
  },
  render: function() {
    var that = this;

    setTimeout(function(){
      that.$el.height($('#floorplanholder').height());
      that.$el.width($('#floorplanholder').width());
      that.$el.width($('#floorplanholder').width());
      var marginLeft = $('#floorplanholder').css('margin-left');
      that.$el.css("margin-left", marginLeft);

      var renderedTemplate = that.template({floorplanpaths: that.floorplanpaths, collection: that.collection});
      that.$el.html(renderedTemplate);
    }, 300);

  }
});

var Thermostat = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.template = loadTemplate("/static/views/thermostat.html");
    this.model = data.model;
    console.log(this.model.get('tar_temp'))
  },
  route: function(part) {
    this.listenTo(this.model, 'change', this.render);
    return {};
  },
  render: function() {
    that = this
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);  

    $('.thermostatknob').knob({
        'min':0
        ,'max':40
        ,'angleOffset': 225
        ,'angleArc': 270
        , 'width': 280
        , 'height': 380
        , 'fgColor': 'rgba(173,50,50,0.8)'
        , 'bgColor': 'rgba(84,175,226,0.8)'
        , 'inputColor' : 'rgba(245,245,245,0.8)'
        ,'release' : function (v) { 
          console.log(that.model)
          that.model.save({
            tar_temp: v
          });
        }
      })

    $('.thermostatknob').val(this.model.get('tar_temp')).trigger('change');
  }
});

var PVGraphicView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    //this.template = loadTemplate("/static/views/databox.html");
    this.model = null;
  },
  route: function(part) {
    return {};
  },
  render: function() {
    //var renderedTemplate = this.template();
    //this.$el.html(renderedTemplate);
  }
});