/*
 * Main JS app
 */


// MODELS
var Light = ModelWS.extend({
  defaults: function() {
    return {
      on: false,
      location: "none",
      name: "unnamed"
    }
  }
});

// COLLECTIONS
var LightList = CollectionWS.extend({
  url: "/light",

  model: Light,

  // sort lights by name
  comparator: function(event) {
    return event.get("name");
  }
});

var Lights = new LightList();

// VIEWS
var BaseView = Backbone.View.extend({
  assign: function(view, selector) {
    view.setElement(this.$(selector)).render();
  }
});

var LightListView = BaseView.extend({
  tagName: "div",
  events: {
    "click" : "toggle"
  },
  initialize: function() {
    var tpl = $('#lightlistview-template').html();
    this.template = _.template(tpl);
  },
  render: function() {
    //var data = this.model.toJSON();
    this.$el.html(this.template());
    return this;
  },
  toggle: function(event) {
    this.model.set("on") = !this.model.get("on");
  }
});

$(function() {
  var Router = Backbone.Router.extend({
    routes: {
      "lights": "lightList",
      "*path": "default"
    }
  });

  var AppRouter = new Router();

  var AppView = BaseView.extend({
    el: $("#mainview"),
    events: {
      "click #lightViewButton": "showLightView"
    },
    initialize: function() {
      var tpl = $('#mainview-template').html();
      this.template = _.template(tpl);
    },
    showLightView: function(e) {
      e.preventDefault();
      AppRouter.navigate("/lights", {trigger: true});
    },
    render: function() {
      this.$el.html(this.template());
      if (this.subview) {
        this.assign(this.subview, "content");
      }
      return this;
    },
    display: function(subview) {
      this.subview = subview;
      this.render();
    }
  });
  var MainAppView = new AppView();

  // ROUTER (CONTROLLER)
  AppRouter.on("route:default", function(path) {
    MainAppView.display();
  });

  AppRouter.on("route:lightList", function() {
    var lightView = new LightListView({collection: Lights});
    MainAppView.display(lightView);
  });
  Backbone.history.start({pushState: false, hashChange: true});
});
