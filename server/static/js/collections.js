// Collection definitions

var LightCollection = CollectionWS.extend({
  model: LightModel,
  url: '/light',
  getLightsByZone: function(zone) {
    lightsToBeReturned = {};
    _.each(this.models, function(model){
      if(model.get('zone') == zone){
        lightsToBeReturned[model.id] = model;
      }
    });
    return lightsToBeReturned;
  },
  zoneData: function(zone){
    var lightson = [];

    _.each(this.models, function(model){
      if(model.get('zone') == zone && model.get('value') != 0 ){
        lightson.push(model);
      }
    });

    return [
      lightson.length,
      'Lights<br/>On'
    ]
  }
});

var BlindCollection = CollectionWS.extend({
  model: BlindModel,
  url: '/light',
  getLightsByZone: function(zone) {
    lightsToBeReturned = {};
    _.each(this.models, function(model){
      if(model.get('zone') == zone){
        lightsToBeReturned[model.id] = model;
      }
    });
    return lightsToBeReturned;
  },
  zoneData: function(zone){
    var blindopen = [];

    _.each(this.models, function(model){
      if(model.get('zone') == zone && model.get('value') != 0 ){
        blindopen.push(model);
      }
    });
   
    if(blindopen.length == 0){
      return [
        '',
        ''
      ]
    }else{
      return [
        blindopen.length,
        'Blinds<br/>Open'
      ]
    }
    
  }
});

var HVACCollection = CollectionWS.extend({
  model: HVACModel,
  url: '/hvac',
  _order_by: 'id',
  _descending: 1,
  comparator: function(device) {
    return this._descending * device.get(this._order_by);
  },
  _sortBy: function(orderOn,descending){
    
    if(descending)
      this._descending = -1;
    else
      this._descending = 1;

    this._order_by = orderOn;
    this.sort();
  },

  getHistoricalData: function(start,end,density) {
    
    return randomArray(start, end, density, 100);

  }
});

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
  url: '/windoor',
  zoneData: function(zone){
    var windooropen = [];

    _.each(this.models, function(model){
      if(model.get('zone') == zone && model.get('val') != 0 ){
        windooropen.push(model);
      }
    });

    return [
      windooropen.length,
      'Open<br />D+W'
    ]
  }
});

var Co2Collection = CollectionWS.extend({
  model: SensorModel,
  url: '/co2'
});


var PowerCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/power',
  comparator: function(device) {
    return this._descending * device.get(this._order_by);
  },
  _sortBy: function(orderOn,descending){
    
    if(descending)
      this._descending = -1;
    else
      this._descending = 1;

    this._order_by = orderOn;
    this.sort();
  },
  getHistoricalData: function(start,end,density) {
    console.log(start, end, density);
    return randomArray(start, end, density, 100);
  }
});


var PVCollection = CollectionWS.extend({
  model: PVModel,
  url: '/pv',
  _order_by: 'id',
  _descending: 1,
  comparator: function(device) {
    return this._descending * device.get(this._order_by);
  },
  _sortBy: function(orderOn,descending){
    
    if(descending)
      this._descending = -1;
    else
      this._descending = 1;

    this._order_by = orderOn;
    this.sort();
  },
  getHistoricalData: function(start,end,density) {
    
    return randomArray(start, end, density, 100);

  }
});

var WaterCollection = CollectionWS.extend({
  model: WaterModel,
  url: '/water',
  _order_by: 'id',
  _descending: 1,
  comparator: function(device) {
    return this._descending * device.get(this._order_by);
  },
  _sortBy: function(orderOn,descending){
    
    if(descending)
      this._descending = -1;
    else
      this._descending = 1;

    this._order_by = orderOn;
    this.sort();
  },

  getHistoricalData: function(start,end,density) {
    
    return randomArray(start, end, density, 100);

  }
});

var OptimizerCollection = CollectionWS.extend({
  model: AlertModel,
  url: '/optimizer',
  // initialize: function(collections){
  //    this.collections = collections;
  //     _.each(collections, function(collection){
  //         model.on("change", this.changeValue, this)
  //       });
  //   },
  // changeValue: function(model, val, options){
  //     // recalculate all alerts from this.collections
  //     this.add([new AlertModel({id: "high-power", message:"You're using a lot of power!"})], {merge: true});
  //   }
});
