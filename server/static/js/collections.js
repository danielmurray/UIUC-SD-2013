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
  }
});

var HVACCollection = CollectionWS.extend({
  model: HVACModel,
  url: '/hvac'
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

var DevicesCollection = CollectionWS.extend({
  model: DevicesModel,
  url: '/devices',


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
  url: '/water'
});