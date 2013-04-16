// Models

var LightModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      zone: "home",
      type: 'analog',
      value: 0 // between 0 and 100
    }
  }
});

var HVACModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
    }
  }
});

var SensorModel = ModelWS.extend({
  defaults: function(){
    return{
      id:null,
    }
  }
});

