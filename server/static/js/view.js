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
    console.log('No Animation In');
  },

  animateOut: function(){
    console.log('No Animation Out');
  }
});

var HomeView = BaseView.extend({
  el: "#viewport",
  events: {
    "click .nav-button":  "navigateTo"
  },
  initialize: function() {
    //IMPORTANT LINE OF CODE 
    this.on("assign", this.animateIn);
    this.template = loadTemplate("/static/views/nav.html");
    var data = loadData("/static/panes.json");
    this.panes = data;
    this.render(); // never changes
  },
  route: function(part, remaining) {
    //console.log("HomeView routing to", part, remaining);
    
    if (!part) {
      navigate("home", true); // don't trigger nav inside route
    }

   
    if(this.panes[part]){
      this.currentpane = this.panes[part];
    } else {
      //404 routes home
      this.currentpane = {
        "id": 'home'
      };      
    }

    pageview = new PageView(this.currentpane);
    
    return {
      "#dashboard-wrapper": pageview
    };    
    

  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  },
  animateIn: function(click){
    
    if(!this.currentpane)
      return;

    var slider = $('.' + this.currentpane.id + '.icon-nav .slider');
    slider.animate({
      width: '100%'
    },{
      duration: 500, 
      queue: true
    });

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
    this.on("assign", this.animateIn);
    this.currentpane = data;
    this.template = loadTemplate("/static/views/pageview.html");

  },
  route: function(part) {
    var viewMap = {
      'home' : StatusView,
      'lights': LightView,
      'power': PowerView
    }
    
    if(this.currentpane.id == 'home'){
      placeHere = '#pagewrapper';
    }else{
      placeHere = '#pagecontent';
    }

    if (viewMap[this.currentpane.id]){
      viewToBeReturned = new viewMap[this.currentpane.id](this.currentpane);
    } else {
      return {};
    }

    var packetToBeReturned = {}

    packetToBeReturned[placeHere] = viewToBeReturned;

    console.log(packetToBeReturned);
    
    return packetToBeReturned;
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
    
  },
  animateIn: function(){
    this.$el.animate({
      opacity: 1
    },{
      queue: false,
      duration: 1000
    });
  }
});


var StatusView = BaseView.extend({
  el: 'div',
  initialize: function() {
    console.log('here')
    this.template = loadTemplate("/static/views/status.html");
  },
  route: function(part) {
    return{};
  },
  render: function(pane, subpane) {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  }
});

var LightView = BaseView.extend({
  el: 'div',
  initialize: function() {
    this.template = loadTemplate("/static/views/lightcontrol.html");
    this.floorplanpaths = loadData("/static/paths.json");
  },
  selectroom: function(thing){
    console.log(thing)
  },
  route: function(part) {
    return{};
    
  },
  render: function(pane, subpane) {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);

    var that = this;

    h = this.$('#floorplanholder').css('height');
    w = this.$('#floorplanholder').css('width');

    console.log( h, w)
    
    h = parseFloat(h.substring(0, h.length-2));
    w = parseFloat(w.substring(0, w.length-2));

    console.log(h,w)

    //above code didn't return the css formatted div height and width;
    //Which why I do the below code
    if(h ==0){
      h = 720;
    }

    if(w==1270){
      w = w * 0.9;
    }
  
    console.log(h,w)
   

    
    var floorplancanvas = new ScaleRaphael( "floorplanholder", 350, 300);

    var rooms = [];

    var raphrooms = floorplancanvas.set();

    _.each(this.floorplanpaths.rooms, function(room){
        var thing = rooms[room.id] = floorplancanvas.path(room.path).attr({
          "id": room.id, 
          "fill": "#3E3E3E", 
          "stroke": "#000000", 
          "stroke-width": 0, 
          "opacity": .75, 
          'stroke-opacity':'0'
        }); //creates the raphael objects then stores them to an array rooms
        rooms[room.id].id = room.id;    //setting the ids of the raphael objects
        raphrooms.push(thing)           //pushing the rooms to a raphael group object for easier manipulation
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
    raphrooms.mouseover(function (event) {
        if(this.id != that.selectedlight)
            this.attr({"opacity": 1});
    });
    raphrooms.mouseout(function (event) {
        if(this.id != that.selectedlight){
            this.attr({"opacity": .75});
        }
    });
    raphrooms.click(function (event) {
        that.selectroom(this.id)
    });  

    this.floorplancanvas = floorplancanvas;
    this.rooms = rooms;
    this.raphrooms = raphrooms;
    
      
    floorplancanvas.changeSize(w, h)
  }
});

var  PowerView = BaseView.extend({
  el: 'div',
  initialize: function() {
    this.template = loadTemplate("/static/views/power.html");
  },
  route: function(part) {
    return{};
  },
  render: function(pane, subpane) {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  }
});