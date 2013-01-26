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
var LightListView = Backbone.View.extend({
  tagName: "div",
  events: {
    "click" : "toggle"
  },
  template: _.template($('lightlistview-template').html()),
  render: function() {
    var data = this.model.toJSON();
    this.$el.html(this.template(data));
    return this;
  },
  toggle: function(event) {
    this.model.set("on") = !this.model.get("on");
  }
});

// ROUTER (CONTROLLER)
var Router = Backbone.Router.extend({
  routes: {
    "*path": "default"
    "lights": "lightList"
  }
});

var AppRouter = new Router();
AppRouter.on("route:default", function(path)) {
  alert(path);
}

AppRouter.on("route:lightList", function() {

});

$(function() {
  Backbone.history.start();
});
