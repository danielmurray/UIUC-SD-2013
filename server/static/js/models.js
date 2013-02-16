// Models

var LightModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      room: "home",
      current: 0 // between 0 and 100
    }
  }
});
