// Collection definitions

var LightCollection = CollectionWS.extend({
  model: LightModel,
  url: '/light'
});

var HVACCollection = CollectionWS.extend({
  model: HVACModel,
  url: '/hvac'
});

    // "/temp":tempController,
    // "/pyra": pyraController,
    // "/humid": humidController,
    // "/CO2":co2Controller,
    // "/flow":flowController,
    // "/windoor":windoorController,

var TempCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/temp'
});

var PyraCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/pyra'
});

var HumidCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/humid'
});
var FlowCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/flow'
});

var WindoorCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/windoor'
});

var Co2Collection = CollectionWS.extend({
  model: SensorModel,
  url: '/co2'
});


var PowerCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/power'
});

