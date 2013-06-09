// Collection definitions
var BaseCollection = CollectionWS.extend({
  model: BaseModel,
  _order_by: 'id',
  _descending: 1,
  valueID: 'value',
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
  _zoneModels: function(zone,format) {
    //returns a json object of all models in a zone//
    zoneModels = {};

    _.each(this.models, function(model){
      if(model.get('zone') == zone){
        zoneModels[model.id] = model;
      }
    });

    return zoneModels;
  },
  _homeData: function(key, zone){
    var modelsOn = [];
    var modelSum = 0;

    _.each(this.models, function(model){
      if((zone === undefined || model.get('zone') == zone) && model.get( key ) > 0 ){
        modelsOn.push(model);
        modelSum += parseInt(model.get( key ));
      }
    });

    return {
      count : modelsOn.length,
      sum : modelSum
    }
  },
  jsonTree: function(){
    var that = this

    console.log(this)
    var root = {
      name: 'home',
      children:[]
    }

    var modelID = 0;

    _.each(this.models, function(model){
      node = {
        name: model.get('id'),
        id: modelID,
        children:[
          {
            name: model.get('id'), 
            id: modelID,
            value: model.get(that.valueID)  
          }
        ]
      }
      root.children.push(node)
      modelID++;
    });

    return root
  },
  formatValue: function(value, unit) {
    metricPrefixArray = [
      '', 
      'k', //kilo
      'M', //mega
      'G', //giga
      'T', //tera
      'P', //peta
      'E', //exa
      'Z', //zetta
      'Y'  //yotta
    ]
  },
  historyData: function(type, field, start, end, period, group, callback) {
    var arr = [];

    var now = start;
    var then = end;
    var size = period/4;

    step = (now-then)/size;
    arr[0] = [];
    arr[0][0] = then;
    arr[0][1] = Math.random() * size;

    for(var i=1; i<size; i++){
      arr[i] = [];
      arr[i][0] = then + step *i;
      
      arr[i][1] = arr[i-1][1] + (Math.random()*5 - 2.5)
    }

    callback(arr)

    // $.ajax("/history", {
    //   data: {
    //     type: type,
    //     field: field,
    //     start: start,
    //     end: end,
    //     period: period,
    //     group: group
    //   },
    //   async:'true',
    //   dataType: "json",
    //   success: function(data) {
    //     callback(data);
    //   },
    //   error: function(err) {
    //     console.error(err);
    //     callback(undefined);
    //   }
    // });
  }
})

var LightCollection = BaseCollection.extend({
  model: LightModel,
  url: '/light',
  valueID: 'value',
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone).count 
    unit = 'Lights<br/>On'

    return [
      value,
      unit
    ]

  },
  homeData:function(){
    return this._homeData(this.valueID).count;
  }
});

var HVACCollection = BaseCollection.extend({
  model: HVACModel,
  url: '/hvac',
  valueID: 'tar_temp',
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("hvac", "tar_temp", start, end, density, "sum", callback);

  },
  getSetTemp: function() {
    var last = "loading";
    this.each(function(model) {
      last = model.get("tar_temp");
    });
    return last;
  },
  getSum: function(){
    data = this._homeData(this.valueID)
    return data.sum/data.count;
  }
});

var TempCollection = BaseCollection.extend({
  model: SensorModel,
  url: '/temp',
  valueID: 'value',
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("temp", "val", start, end, density, "avg", callback);

  },
  avgTemp: function() {
    data = this._homeData(this.valueID)
    count = data.count
    sum = data.sum
    return sum/count
  },
  getSum: function(){
    return this.avgTemp();
  }
});

var WindoorCollection = BaseCollection.extend({
  model: SensorModel,
  url: '/windoor',
  valueID: 'value',
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone).count
    unit = 'Open<br />D+W'

    return [
      value,
      unit
    ]

  },
  homeData: function() {
    return this._homeData(this.valueID).count;
  }
});

var PowerCollection = BaseCollection.extend({
  model: SensorModel,
  url: '/power',
  valueID: 'power',
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("power", "power", start, end, density, "sum", callback);
  
  },
  getSum: function(){
    return this._homeData(this.valueID).sum;
  },
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone).sum
    unit = 'W'

    return [
      value,
      unit
    ]
    
  }
});

var PVCollection = BaseCollection.extend({
  model: PVModel,
  url: '/pv',
  valueID: 'power',
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("pv", "power", start, end, density, "sum", callback);
  
  },
  getSum: function(){
    return this._homeData(this.valueID).sum;
  },
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone).sum
    unit = 'W'

    return [
      value,
      unit
    ]
    
  }
});

var FlowCollection = BaseCollection.extend({
  model: SensorModel,
  url: '/flow',
  valueID: 'val',
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("flow", "val", start, end, density, "sum", callback);

  },
  getSum: function(){
    return this._homeData(this.valueID).sum;
  },
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone) 
    unit = 'L'

    return [
      value,
      unit
    ]
    
  }
});

var PyraCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/pyra'
});

var HumidCollection = CollectionWS.extend({
  model: SensorModel,
  url: '/humid'
});

var Co2Collection = BaseCollection.extend({
  model: SensorModel,
  url: '/co2'
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
