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
  }
});

var HomeView = BaseView.extend({
  el: "#viewport",
  initialize: function() {
    this.template = loadTemplate("/static/views/home.html");
    this.render(); // never changes
  },
  route: function(part, remaining) {
    console.log("HomeView routing to", part, remaining);
    var mainview, sideview;
    if (part == "control" || !part) {
      if (!part) {
        navigate("control", true); // don't trigger nav inside route
      }
      mainview = new FloorplanView();
      sideview = new LightControlView();
    }
    return {
      "#floorplan": mainview,
      "#controlwrapper": sideview
    };
  },
  render: function() {
    var renderedTemplate = this.template();
    this.$el.html(renderedTemplate);
  }
});

var FloorplanView = BaseView.extend({
  el: 'div',
  initialize: function() {
    this.template = loadTemplate("/static/views/floorplan.html");
    this.floorplanpaths = JSON.parse(loadData("/static/paths.json"));
    this.lightControllers = new Array();
    this.selectedroom = null;
  },
  route: function(part, remaining) {
    // no subviews, but zoom in to the selected room (if any)
    this.selectedroom = part;
    return {};
  },
  selectroom: function(id) {
    if (id != null) {
      navigate('control/' + id);
    }
  },
  fillroom: function(id) {
    if (this.selectedroom != null) {
      this.rooms[id].attr({
        fill: "rgb(179, 26, 56)",
        opacity: .75
      });
    }
  },
  render: function() {
    this.$el.html(this.template());
    var that = this;
    var floorplancanvas = new ScaleRaphael("floorplan_canvas", 350, 300);
    var rooms = [];
    var raphrooms = floorplancanvas.set();

    _.each(this.floorplanpaths.rooms, function(room) {
      var thing = rooms[room.id] = floorplancanvas.path(room.newpath).attr({
        "id": room.id,
        "fill": "#3E3E3E",
        "stroke": "#000000",
        "stroke-width": 0,
        "opacity": .5,
        'stroke-opacity': '0'
      }); //creates the raphael objects then stores them to an array rooms
      rooms[room.id].id = room.id; //setting the ids of the raphael objects
      raphrooms.push(thing); //pushing the rooms to a raphael group object for easier manipulation
    });

    var outerWalls = floorplancanvas.path(this.floorplanpaths.outerwalls).attr({
      fill: '#000',
      'fill-opacity': '1',
      'stroke': '#d9d9d9',
      'stroke-width': '0',
      'stroke-opacity': '0.4'
    });
    var innerWalls = floorplancanvas.path(this.floorplanpaths.innerwalls).attr({
      fill: '#000',
      'fill-opacity': '0',
      'stroke': '#000',
      'stroke-width': '2',
      'stroke-opacity': '1'
    });


    raphrooms.mouseover(function(event) {
      if (this.id != that.selectedroom) this.attr({
        "opacity": 1
      });
    });
    raphrooms.mouseout(function(event) {
      if (this.id != that.selectedroom) {
        this.attr({
          "opacity": .5
        });
      }
    });
    raphrooms.click(function(event) {
      that.selectroom(this.id);
    });

    //Scales raphael drawing by multiplyer specified, size        
    floorplancanvas.scaleAll(1.8);

    this.floorplancanvas = floorplancanvas;
    this.rooms = rooms;
    this.raphrooms = raphrooms;

    if (this.selectedroom) {
      this.rooms[this.selectedroom].attr({
        "opacity": 1
      });
    }
  }
});

// TODO: this needs to be at a house-level, then room-level, then device level
var HomeControlView = Backbone.View.extend({
  el: 'div',
  initialize: function() {
    this.template = loadTemplate("/static/views/homecontrol.html");
  },
  render: function() {
    data = {
      "power": {
        "production": Math.random() * 15.5,
        "consumption": Math.random() * 15.5
      }
    }
    var renderedTemplate = this.template(data);
    this.$el.html(renderedTemplate);
  }
});

var LightControlView = BaseView.extend({
  el: 'div',
  initialize: function(lights) {
    this.template = loadTemplate("/static/views/lightcontrol.html");
    this.dragging = false;
  },

  route: function(part, remaining) {
    if (part) {
      this.model = window.Lights.get(part);
      if (this.model) {
        this.listenTo(this.model, 'change', this.render);
      } else {
        console.log("Light model not found", part);
      }
    }
    return {}; // no subviews (yet)
  },

  updateslider: function() {
    var that = this;

    this.$("#lightdimmer").slider({
      orientation: "vertical",
      range: "min",
      min: 0,
      max: this.model.get('id') == 'livingroom' ? 1000000000 : 100,
      value: this.model.get('current'),
      start: function(event, ui) {
        that.dragging = true;
      },
      stop: function(event, ui) {
        that.dragging = false;
      },
      slide: function(event, ui) {
        console.log(ui.value);
        that.model.save({
          current: ui.value
        });
      }
    });

    this.$("#toggleon").click(function() {
      var lastvalue = that.model.get('last');
      console.log(lastvalue);
      that.model.save({
        last: null
      });
      if (lastvalue != null) that.model.save({
        current: lastvalue
      });
    });

    this.$("#toggleoff").click(function() {
      var currentvalue = that.model.get('current');
      that.model.save({
        last: currentvalue
      });
      that.model.save({
        current: 0
      });
    });
  },
  render: function() {
    if (!this.model) {
      this.$el.text("No light selected");
      return;
    }
    if (this.dragging) {
      return;
    }
    console.log("Rendering light control", this.model);
    var lightTemplate = this.template(this.model);
    this.$el.html(lightTemplate);
    this.updateslider();
  }
});
