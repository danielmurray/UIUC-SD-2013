// Views, all inherit BaseView
var BaseView = Backbone.View.extend({
  initialize: function() {
  },

  assign: function(view, selector) {
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
        "name": "eth0", 
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
    
    var that = click.currentTarget;

    //How do I improve this This information is written in HTML
    var next = $(that).context.classList[2];

    if(this.currentpane.id != next){
      navigate(next, false); 
    }
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
    var that = this;
    _.each(Collections, function(c, i) {
      c.on("all", that.render, that);
    });
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
      data.lights = this.collection._zoneModels(part);

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
    this.collection = window.Windoor;
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

    this.collection[1] = window.Power;
    

  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {

    var that = this;

    if (!part) {
      navigate("power/today", false); // don't trigger nav inside route
    }

    consumptiondatabox = new DataBox({
      id: 'Consumption',
      color: [173,50,50],
      databoxcontent: 'graphic',
      collection: this.collection[1],
      subviews: {
        graphic: {
          id: 'graphic',
          view: TreeMapView,
          args: {
            color: [173,50,50],
            collection: this.collection[1]
          }
        },
        table: {
          id: 'table',
          view: TableView,
          args: {
            collection: this.collection[1], 
            name: "id", 
            value: "power", 
            unit: "w"
          }
        }
      }
    });   
    
    generationtdatabox = new DataBox({
      id: 'Generation',
      color: [85,160,85],
      databoxcontent: 'table',
      collection: this.collection[0],
      subviews: {
        graphic: {
          id: 'graphic',
          view: TreeMapView,
          args: {
            color: [85,160,85],
            collection: this.collection[0]
          }
        },
        table: {
          id: 'table',
          view: TableView,
          args: {
            collection: this.collection[0], 
            name: "id", 
            value: "power", 
            unit: "w"
          }
        }
      }
    });

    taskbar = new PageTaskBar({
      color: [85,160,85],
      collections:[
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
      range: part
    });

    taskbar.on('timeselect', function(time){
      that.selecttime(time);
    });

    return{
      '#consumptionwrapper': consumptiondatabox
      ,'#generationwrapper': generationtdatabox
      ,'#taskbarwrapper': taskbar
    }
  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.powertemplate();
    this.$('#pagecontent').html(renderedTemplate);
  },
  selecttime: function(timeperiod) {
    navigate('power/'+ timeperiod, false);
  }
});

var WaterView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);
    this.watertemplate = loadTemplate("/static/views/water.html");
    
    this.collection = [];

    this.collection[0] = window.Flow;
    this.collection[0]._sortBy('val',true);
  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    
    var that = this;
    
    if (!part) {
      navigate("water/today", false); // don't trigger nav inside route
    }

    consumptiondatabox = new DataBox({
      id: 'Waterconsumption',
      color: [84,175,226],
      databoxcontent: 'table',
      collection: this.collection[0],
      subviews: {
        table: {
          id: 'table',
          view: TableView,
          args: {collection: this.collection[0], name: "name", value: "val", unit: "gal/min"}
        },
        graphic: {
          id: 'graphic',
          view: FloorPlanView,
          args: {collection: this.collection[0]}
        }
      }
    });

    taskbar = new PageTaskBar({
      color: [84,175,226],
      collections:[
        {
          name:'Water',
          color: [84,175,226],
          collection: this.collection[0]
        }
      ],
      range: part
    }); 

    taskbar.on('timeselect', function(time){
      that.selecttime(time);
    });

    return{
      '#consumptionwrapper': consumptiondatabox
      ,'#taskbarwrapper': taskbar
      //,'#greywaterwrapper': generationtdatabox
    }

  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.watertemplate();
    this.$('#pagecontent').html(renderedTemplate);
  },
  selecttime: function(timeperiod) {
    navigate('water/'+ timeperiod, false);
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
    
    this.collection[1] = window.Temp;

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

    var that = this;
    
    if (!part) {
      navigate("hvac/today", false); // don't trigger nav inside route
    }
    
    tempdatabox = new DataBox({
      id: 'Temperature',
      color: [173, 50, 50],
      databoxcontent: 'table',
      collection: this.collection[1],
      subviews: {
        table: {
          id: 'table',
          view: TableView,
          args: {collection: this.collection[1], name: "name", value: "val", unit: "C"}
        }
      }
    });

    taskbar = new PageTaskBar({
      color: [173, 50, 50],
      collections:[
        {
          name:'Temperature',
          color: [173, 50, 50],
          collection: this.collection[1]
        }
      ],
      range: part
    }); 

    taskbar.on('timeselect', function(time){
      that.selecttime(time);
    });

    thermostat = new Thermostat({
      model: this.model
    });

    console.log(that)
    return {
      '#thermostatwrapper': thermostat
      ,'#weekviewwrapper': tempdatabox
      ,'#taskbarwrapper': taskbar
    }

  },
  render: function(pane, subpane) {
    PageView.prototype.render.apply(this);
    var renderedTemplate = this.watertemplate();
    this.$('#pagecontent').html(renderedTemplate);
    
    $('.thermostatknob').knob();
  },
  selecttime: function(timeperiod) {
    navigate('hvac/'+ timeperiod, false);
  }
});

var OptView = PageView.extend({
  el: 'div',
  initialize: function(data) {
    PageView.prototype.initialize.apply(this, [data]);    
    this.opttemplate = loadTemplate("/static/views/optimizer.html");
    console.log("Opt View Initialized");

    //BRYANT BUT YOU OPTIMIZER COLLECTION RIGHT IN HERE
    this.collection = window.Windoor;
    //this.collection._sortBy('value',true);

  },
  animateIn: function(){
    PageView.prototype.animateIn.apply(this);
  },
  route: function(part) {
    
    table = new TableViewOpt({collection: this.collection, name: "zone", value: "name", unit: "open"});

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

var PageTaskBar = BaseView.extend({
  el: 'div',
  events: {
    "click #dateselect":  "showdates",
    "click #dateselect li": "changerange"
  },
  initialize: function(data) {
    this.template = loadTemplate("/static/views/pagetaskbar.html");
    this.range = data.range;
    this.color = data.color;
    this.collections = data.collections
    this.dataselect = [
      'today',
      'last24',
      'thisweek',
      'last7',
      'thismonth',
      'last28'
    ]
  },
  route: function(part, remaining) {

    taskbarstatus = new TaskBarStatus({
      collections: this.collections,
      range: this.range
    });

    graph = new NUGraphView({
      type:'area',
      range: this.range,
      series: this.collections,
      unit: 'W'
    });

    return {
      '#statuswrapper': taskbarstatus
      ,'#graphwrapper': graph
    }
  },
  render: function() {
    var renderedTemplate = this.template({ range: this.range, dates: this.dataselect, color: this.color});
    this.$el.html(renderedTemplate);
  },
  showdates: function(click){
    $(click.currentTarget).toggleClass('active');
  },
  changerange: function(click){
    this.trigger('timeselect', click.currentTarget.id)
  }
});

var TaskBarStatus = BaseView.extend({
  el: 'div',
  events: {
    "click .seriesdatalist li":  "accordianselect"
  },
  initialize: function(data) {
    this.template = loadTemplate("/static/views/taskbarstatus.html");
    this.collections = data.collections;
    this.range = data.range

    var height = 172;
    var width = 282;
    this.taskbarcollapsed = (2*height/3)/(this.collections.length + 1);
    this.taskbaropen = height - this.collections.length * this.taskbarcollapsed
    this.accordionselection = this.collections.length;
  },
  route: function(part) {
    for( var i=0; i<this.collections.length; i++){
      collection = this.collections[i]
      this.listenTo(collection.collection, 'change', this.render);
    }

    return {}
  },
  render: function() {
    var statusArray = this.statusdata();
    var renderedTemplate = this.template({ 
      statusArray: statusArray, 
      taskbarcollapsed: this.taskbarcollapsed,
      taskbaropen: this.taskbaropen,  
      accordianselection: this.accordionselection 
    });
    this.$el.html(renderedTemplate);
  },
  accordianselect: function(click){
    $('.seriesdatalist li').removeClass('selected')
    $('.seriesdatalist li .icon').text('+')
    
    //selected li index
    this.accordionselection = $('.seriesdatalist li').index(click.currentTarget)
    
    $(click.currentTarget).addClass('selected')
    $(click.currentTarget).find('.icon').text('-')

  },
  statusdata:function(){
    statusarray = [];
    range = this.range + '\'s '

    for(var i =0; i < this.collections.length; i++){
      var collection = this.collections[i];
      statusmodel = {};
      statusmodel.name = collection.name;
      statusmodel.color = collection.color;
      statusmodel.value = collection.collection.getSum();
      statusmodel.subvalues = []
      min = statusmodel.value * Math.random()
      max = statusmodel.value * (Math.random()+1)
      avg = (max + min)/2
      minimum = {
        key: range + 'minimum',
        value: min
      };
      maximum = {
        key: range + 'maximum',
        value: max 
      }
      average = {
        key: range + 'average',
        value: avg
      }
      statusmodel.subvalues.push(minimum, maximum, average)
      statusarray.push(statusmodel)
    }

    costmodel = {};
    costmodel.name = 'Cost';
    costmodel.color = [223,144,1];
    costmodel.value = Math.floor(Math.random() * 100);
    costmodel.subvalues = []
    minimum = {
      key: range + 'production',
      value: costmodel.value * Math.random()
    };
    maximum = {
      key: range + 'consumption',
      value: costmodel.value * (Math.random()+1)
    }
    average = {
      key: range + 'net',
      value: costmodel.value * (Math.random()+1)
    }
    costmodel.subvalues.push(minimum, maximum, average)
    statusarray.push(costmodel)

    return statusarray
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
    this.collection = this.databox.collection
    this.contentdivselector = '#databoxcontentwrapper';
    this.currcontentview = this.databox.databoxcontent; //View to be rendered to the databox
    this.views = this.databox.subviews;   
    this.listenTo(this.collection, 'change', this.updatecontentview);

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
    var renderedTemplate = this.template({subviews: this.views, currentcontent: this.currcontentview, databox: this.databox} );
    this.$el.html(renderedTemplate);
    this.rendercontentview()
  },
  rendercontentview: function() {

    //prepare content view
    var obj = this.views[this.currcontentview]
    this.currview = new obj.view(obj.args);
    this.currview.setElement(this.$(this.contentdivselector));

    //render and animate
    router.displayPart(0,this.currview,[])

  },
  updatecontentview: function() {
    //render and animate
    router.displayPart(0,this.currview,[])

  }
});

var NUGraphView = BaseView.extend({
  el:'div',
  initialize: function(graphdata){
    this.timeperiod = graphdata.range;
    this.inputdata = graphdata.series;
    this.unit = graphdata.unit;
    this.series = undefined;
    this.template = loadTemplate("/static/views/graph.html");
  },
  route: function(part) {
    return{};
  },
  render: function() {
    var that = this;

    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);

    this.fetchHistoricalData(function() {
      that.renderChart(that.series);
    });
  },
  fetchHistoricalData: function(callback){    
    var that = this;
    
    this.series = [];
    var len = this.inputdata.length;
    var allGraphs = function() {
      len = len - 1;
      if (!len) {
        callback();
      }
    };

    $.each(this.inputdata, function(i, inputdata){
      var clos = (function(j, d) {
        return function (data) {
          that.series[j] = {
            name: inputdata.name,
            type: 'area',
            color: d.color,
            data: data
          };
          if (data) {
            allGraphs();
          }
        }
      })(i, inputdata);
      that.getHistoricalData(inputdata.collection, clos);
    });
  },
  getHistoricalData:function(collection, callback){
    startEndUTC = stringToUTC(this.timeperiod)
    start = startEndUTC.start;
    end = startEndUTC.end;
    collection.getHistoricalData(start,end, 100, callback);
  },
  renderChart: function(series){

    $('#graphholder').empty()

    var areaData = this.formatGraphData(series)

    var margin = {top: 50, right: 6, bottom: 0, left: 0},
    w = 681 - margin.left - margin.right,
    h = 183 - margin.top - margin.bottom;

    minDate = series[0].data[0][0]
    maxDate = series[0].data[series[0].data.length-1][0]

    console.log(minDate, maxDate)

    var x = d3.time.scale().domain([minDate, maxDate]).range([0, w]);
    var y = d3.scale.linear().domain([0, d3.max(series, function(s) { 

      return d3.max(s.data, function(d){ return d[1]; } )

    })]).range([h, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("top")
      .ticks(7)
      .tickSize(0)
      .tickFormat(this.timeFormat());

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("right")
      .ticks(5)
      .tickSize(0)
      .tickFormat(function(d){
        if(d != 0){
          return d
        }
      });


    var line = d3.svg.area()
      // .interpolate("basis") 
        // assign the X function to plot our line as we wish
      .x(function(d, i) {
        // return the X coordinate where we want to plot this datapoint
        return x(d[0]); //x(i);
      })
      .y(function(d) { 
        // return the Y coordinate where we want to plot this datapoint
        return y(d[1]); 
      });

    //when collection 0 is greater than collection 1
    var area0 = d3.svg.area()
      .x(function(d, i) {
        // return the X coordinate where we want to plot this datapoint
        return x(d.date); //x(i);
      })
      .y0(function(d){
        if(d.data1 < d.data0){
          return y(d.data1); 
        }else{
          return y(d.data0)
        } 
      })
      .y1(function(d) { 
        // return the Y coordinate where we want to plot this datapoint
        return y(d.data0); 
      });

    //when collection1 is greater than colleciton0
    var area1 = d3.svg.area()
      .x(function(d, i) {
        // return the X coordinate where we want to plot this datapoint
        return x(d.date); //x(i);
      })
      .y0(function(d){
        if(d.data0 < d.data1){
          return y(d.data0); 
        }else{
          return y(d.data1)
        }
      })
      .y1(function(d) { 
        // return the Y coordinate where we want to plot this datapoint
        return y(d.data1); 
      });

    var graph = d3.select("#graphholder").append("svg:svg")
      .attr("width", w + margin.right + margin.left)
      .attr("height", h + margin.top + margin.bottom)
      .append("svg:g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xx = function(e) { return x(e[0]*1000); };
    var yy = function(e) { return y(e[1]); };

    // Draw Y-axis grid lines
    // graph.selectAll("line.y")
    //   .data(y.ticks(5))
    //   .enter().append("line")
    //   .attr("class", "y")
    //   .attr("x1", 0)
    //   .attr("x2", w)
    //   .attr("y1", y)
    //   .attr("y2", y)
    //   .style("stroke", "rgba(245,245,245,0.2)")
    //   .style("stroke-dasharray", "10,20");

    

    //rendering areas
    if(series.length == 1){

    }else if (series.length == 2) {

      graph.datum(areaData);

      graph.append("path")
        .attr("d", area0)
        .attr("class", "area below")
        .attr("fill", rgbaToString(series[0].color,0.95));

      graph.append("path")
        .attr("d", area1)
        .attr("class", "area below")
        .attr("fill", rgbaToString(series[1].color,0.95));

    }

    for(var i=0; i<series.length; i++){
      serie = series[i]

      graph.datum(serie.data)
      
      graph.append("svg:path")
        .attr("d", line)
        .attr("class", "graphline")
        .attr("stroke", rgbaToString(serie.color,1))
        .attr("fill", rgbaToString(serie.color,1));

      // graph.selectAll("circle"+i)
      //   .data(serie.data)
      //   .enter()
      //   .append("circle")
      //   .attr("fill", serie.color)
      //   .attr("r", 5)
      //   .attr("cx", xx)
      //   .attr("cy", yy)

    }

    graph.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0, ' + h + ')')
      .call(xAxis);

    // graph.append("g")
    //   .attr("class", "y-axis")
    //   .call(yAxis)
    //   .selectAll('text')
    //   .attr("y", "-10");


  },
  timeFormat: function(){
    var formats = [
      [function(d) { return Date.create(d).format('{MON}') }, function() { return true; }],
      [function(d) { return Date.create(d).format('{M}/{d}') }, function(d) { return d.getMonth(); }],
      [function(d) { return Date.create(d).format('{M}/{d}') }, function(d) { return d.getDate() != 1; }],
      [function(d) { return Date.create(d).format('{DOW}') }, function(d) { return d.getDay() && d.getDate() != 1; }],
      [function(d) { return Date.create(d).format('{12hr}{tt}') }, function(d) { return d.getHours() && d.getDate(); }],
      [function(d) { return Date.create(d).relative() }, function(d) { return d.getMinutes(); }],
      [function(d) { return Date.create(d).relative() }, function(d) { return d.getSeconds(); }],
      [function(d) { return Date.create(d).relative() }, function(d) { return d.getMilliseconds(); }]
    ];

    return function(date) {
      var i = formats.length - 1;
      var f = formats[i];
      while (!f[1](date)){
        f = formats[--i];
      }
      console.log(date)
      return f[0](date)
    };
  },
  formatGraphData: function(series){
    data = []
    //for each data point create a chart data object "d"
    for(var i = 0; i < series[0].data.length; i++){
      d = {}
      d.date = series[0].data[i][0]
      for(var j = 0; j < series.length; j++){
        datum = series[j].data[i]
        key = "data"+j
        d[key] = datum[1]
      }
      data.push(d)
    }
    return data
  }
});

var GraphView = BaseView.extend({
  el: 'div',
  initialize: function(graphdata) {
    this.type = graphdata.type;
    this.timeperiod = graphdata.range;
    this.inputdata = graphdata.series;
    this.unit = graphdata.unit;
    this.series = undefined;
    this.template = loadTemplate("/static/views/graph.html");

  },
  route: function(part) {
    return{};
  },
  render: function() {
    var that = this;

    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);

    this.fetchHistoricalData(function() {
      console.log("Got all data", that.series);
      that.organizeHistoricalData();
      that.renderChart();
    });

  },
  fetchHistoricalData: function(callback){    
    var that = this;
    
    this.series = [];
    var len = this.inputdata.length;
    var allGraphs = function() {
      len = len - 1;
      if (!len) {
        callback();
      }
    };

    $.each(this.inputdata, function(i, inputdata){
      var clos = (function(j, d) {
        return function (data) {
          that.series[j] = {
            name: inputdata.name,
            type: 'area',
            color: rgbaToString(d.color,1),
            data: data
          };
          if (data) {
            allGraphs();
          }
        }
      })(i, inputdata);
      that.getHistoricalData(inputdata.collection, clos);
    });
  },
  organizeHistoricalData: function() {

    if(this.type == 'area' && this.series.length >= 2){
      this.series[0].type = this.series[1].type = 'line';
      return; // the fancy graphs aren't rendering properly
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
  getHistoricalData:function(collection, callback){
    var now = Math.round((new Date()).getTime()/1000);
    
    switch(this.timeperiod){
      case 'day':
        var then = now - 24*60*60;
        break;
      case 'week':
        var then = now - 7*24*60*60;
        break;
      case 'month':
        var then = now - 30*24*60*60;
        break;
      default:
        var then = now - 365*24*60*60;
    }
    collection.getHistoricalData(then,now, 100, callback);
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
    // console.log(container[0].clientTop);
  }
});

var TreeMapView = BaseView.extend({
  el: 'div',
  initialize: function(data) {
    this.template = loadTemplate("/static/views/treemap.html");
    this.color = data.color;
    this.collection = data.collection;
    this.jsonTree = this.collection.jsonTree();
    this.currentNode = 'home';
  },
  route: function(part) {
    return {};
  },
  render: function() {
    if(this.currentNode == 'home'){
      var renderedTemplate = this.template();
      this.$el.html(renderedTemplate);
      this.renderTreeMap()
    }
    
  },
  renderTreeMap: function(){

    var view = this;
    var root = this.jsonTree

    var margin = {top: 30, right: 0, bottom: 0, left: 0},
    width = 482,
    height = 385 - margin.top - margin.bottom,
    totalArea = width * height,
    formatNumber = d3.format(",d"),
    transitioning;

    var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);
 
    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);
     
    var treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d.children; })
        .sort(function(a, b) { 
          return a.value - b.value + 1; 
        })
        .value(function(d) { return d.value; })
        .ratio(.25)
        .round(false);
     
    var svg = d3.select(this.el).select('#treemap').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");
     
    var grandparent = svg.append("g")
        .attr("class", "grandparent");
     
    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);
     
    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");
     
    
    var nodes = [];
   
    initialize(root);
    accumulate(root);
    layout(root);
    display(root);
   
    function initialize(root) {
      root.x = root.y = 0;
      root.dx = width;
      root.dy = height;
      root.depth = 0;
    }
   
    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    function accumulate(d) {
      nodes.push(d);
      return d.children
          ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
          : d.value;
    }
   
    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
      if (d.children) {
        treemap.nodes({children: d.children});
        d.children.forEach(function(c) {
          c.x = d.x + c.x * d.dx;
          c.y = d.y + c.y * d.dy;
          c.dx *= d.dx;
          c.dy *= d.dy;
          c.parent = d;
          layout(c);
        });
      }
    }
   
    function display(d) {
      var palette = [
        [85, 160, 85],
        [223, 144, 1],
        [84, 175, 226],
        [150, 111, 150],
        [170, 184, 26],
        [173, 50, 50]
      ]

      grandparent
        .datum(d.parent)
        .on("click", transition)
        .select("text")
        .text(name(d));
   
      var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");
   
      var g = g1.selectAll("g")
        .data(d.children)
        .enter().append("g");
   
      g.filter(function(d) { return d.children; })
        .classed("children", true)
        .on("click", transition);


      svgwrapper = g.selectAll(".child")
        .data(function(d) { return d.children || [d]; })
        .enter()
        .append('svg')
        .call(wrapper)

      svgwrapper.append("rect")
        .attr("class", "child")
        .call(rect)
        .style("fill", function(d) {
          var paletteindex = d.id%(palette.length)
          var randomPalette = palette[paletteindex];
          if( !d.children){
            color =  rgbaToString( randomPalette, 1 )
          }else{
            color = null
          }
          return color
        });
   
      svgbox = svgwrapper.append("rect")
          .attr("class", "parent")
          .call(rect)
   
      svgbody = svgwrapper.append('foreignObject').call(rect)
        .append("xhtml:body")
        .attr("class", "bodywrapper")
        .call(body)

      svgdiv = svgbody.append("div")
        .attr("class", "divholder")
        .append("div")
        .attr("class", "divwrapper");

      svgtext = svgdiv.append("div")
        .call(text);

      svgpercentage = svgtext.append('span')
        .text(function(d){
          area = d.dx * d.dy
          percentage = Math.floor(area/totalArea*100) + '%'
          return percentage; 
        })
        .attr('class', 'nodepercentage')

      svgname = svgtext.append('span')
        .text(function(d){
          return d.name; 
        })
        .attr('class', 'nodename')

      function transition(d) {
        if (transitioning || !d) return;
        transitioning = true;
   
        view.currentNode = d.name

        var g2 = display(d),
            t1 = g1.transition().duration(750),
            t2 = g2.transition().duration(750);
   
        // Update the domain only after entering new elements.
        x.domain([d.x, d.x + d.dx]);
        y.domain([d.y, d.y + d.dy]);
   
        // Enable anti-aliasing during the transition.
        svg.style("shape-rendering", null);
   
        // Draw child nodes on top of parent nodes.
        svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });
   
        // Fade-in entering text.
        g2.selectAll("text").style("fill-opacity", 0);
   
        // Transition to the new view.
        t1.selectAll("text").call(text).style("fill-opacity", 0);
        t2.selectAll("text").call(text).style("fill-opacity", 1);
        t1.selectAll("rect").call(rect);
        t2.selectAll("rect").call(rect);
        t1.selectAll("svg").call(wrapper);
        t2.selectAll("svg").call(wrapper);

        // Remove the old node when the transition is finished.
        t1.remove().each("end", function() {
          svg.style("shape-rendering", "crispEdges");
          transitioning = false;
        });
      }
   
      return g;
    }
   
   function wrapper(wrapper) {
      wrapper.attr("x", function(d) { return x(d.x); })
          .attr("y", function(d) { return y(d.y); })
          .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
          .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
    }

    function text(text) {

      text.attr("class", function(d){
            if(d.dx < d.dy){
              return "nodetext rotated"
            }else{
              return "nodetext"
            }
          }).style("font-size", function(d){
            if(d.dx < d.dy){
              return (d.dy/3 - 5) + 'px';              
            }else{
              return (d.dy/2 - 5) + 'px';
            }
          })
    }
   
    function rect(rect) {
      rect.attr("width", function(d) { return '100%'; })
          .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
    }

    function body(body) {
      body.style("height", function(d) { return y(d.y + d.dy) - y(d.y) +'px'; })
    }

    function name(d) {
      return d.parent
          ? name(d.parent) + "/" + d.name
          : d.name;
    }
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
    this.sortBy = this.value
    this.collection._sortBy(this.sortBy, true);

  },
  route: function(part) {

    var that = this;

    //pointers for this view
    this.tableEntries = {};

    //views to be returned
    tableEntriesToRendered = {};

    var that = this;
    _.each(this.collection.models, function(model,i) {

      tableentry = new TableViewEntry(model, that.name, that.value, that.unit);
      tableEntriesToRendered['#tableEntry'+i] = tableentry;
      that.tableEntries[model.id] = {};
      that.tableEntries[model.id].id = model.id;
      that.tableEntries[model.id].view = tableentry;
      that.tableEntries[model.id].model = model;
    });

    return tableEntriesToRendered;
  },
  render: function() {
    this.collection._sortBy(this.sortBy, true);
    var renderedTemplate = this.template({collection: this.collection});
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

var TableViewOpt = BaseView.extend({
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

    var that = this;
    _.each(this.collection.models, function(model,i) {

      tableentry = new TableViewEntryOpt(model, that.name, that.value, that.unit);
      tableEntriesToRendered['#tableEntry'+i] = tableentry;
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
  initialize: function(data, name, value, unit) {
    this.value = value;
    this.unit = unit;
    this.name = name;
    this.template = loadTemplate("/static/views/optviewtable.html");
    this.model = data;
  },
  route: function(part) {
    this.listenTo(this.model, 'change', this.render);
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
  acquireRaphaelZone: function(zoneID){
    for (var i = 0; i < this.raphzones.items.length; i++) {
      if(zoneID == this.raphzones[i].id)
        return this.raphzones[i]
    }
  },
  highlightzone: function(zone){
    raphzone = this.acquireRaphaelZone(zone)
    raphzone.attr({opacity:1})

  },
  unhighlightzone: function(zone){
    raphzone = this.acquireRaphaelZone(zone)
    raphzone.attr({opacity:0.8})
  },
  route: function(part) {
    that = this

    var floorplandataoverlayview = new FloorPlanDataOverlay({
      collection: this.collection,
      paths: this.floorplanpaths
    });

    floorplandataoverlayview.on('zoneselect', function(zone){
      that.selectzone(zone)
    });

    floorplandataoverlayview.on('zonehighlight', function(zone){
      that.highlightzone(zone)
    });

    floorplandataoverlayview.on('zoneunhighlight', function(zone){
      that.unhighlightzone(zone)
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

    h = this.$('#floorplanholder').height();
    w = this.$('#floorplanholder').width();

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
        that.highlightzone(this.id)
    });
    raphzones.mouseout(function (event) {
        that.unhighlightzone(this.id)
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
  events: {
    "click .zonecontainer":  "selectzone",
    "mouseover .zonecontainer":  "highlightzone",
    "mouseout .zonecontainer":  "unhighlightzone"
  },
  selectzone: function(click){
    zone = click.currentTarget.id
    this.trigger('zoneselect', zone);
  },
  highlightzone: function(click){
    zone = click.currentTarget.id
    this.trigger('zonehighlight', zone);
  },
  unhighlightzone: function(click){
    zone = click.currentTarget.id
    this.trigger('zoneunhighlight', zone);
  },
  route: function(part) {
    this.listenTo(this.collection, 'change', this.render);
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