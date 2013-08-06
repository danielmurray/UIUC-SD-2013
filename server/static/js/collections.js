// Collection definitions
var BaseCollection = CollectionWS.extend({
  model: BaseModel,
  name: 'voldemort',
  _order_by: 'id',
  _descending: 1,
  valueID: 'value',
  unit: '',
  logdata: [],
  min: 0,
  max: 0,
  avg: 0,
  integral: 0,
  duration: 0,
  precision: 3,
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
  abbreviateNumber: function(value){
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
    
    PrefixIndex = 0;

    for(var i=0; i < metricPrefixArray.length; i++){
      smallValue = value / (Math.pow(1000,i))
      if( smallValue < 1000 ){
        PrefixIndex = i;
        break;
      }
    }

    return [
      smallValue.toPrecision(this.precision),
      metricPrefixArray[PrefixIndex]
    ]

  },
  formatValue: function(value) {
    

    smallValue = this.abbreviateNumber(value)

    return smallValue[0] + ' ' + smallValue[1] + this.unit

  },
  fakeHistoryData: function(type, field, start, end, period, group, callback) {
    var arr = [];

    var now = end * 1000;
    var then = start * 1000;
    var size = period/4;

    step = (now-then)/size;
    arr[0] = [];
    arr[0][0] = then;
    arr[0][1] = Math.random() * size;

    for(var i=1; i<=size; i++){
      arr[i] = [];
      arr[i][0] = then + step *i;
      
      arr[i][1] = arr[i-1][1] + (Math.random()*5 - 2.5)
    }

    this.dataAnalytics(arr)
    callback(arr)
  },
  historyData: function(type, field, start, end, period, group, callback) {

  that = this

    $.ajax("/history", {
      data: {
        type: type,
        field: field,
        start: start,
        end: end,
        period: period,
        group: group
      },
      async:'true',
      dataType: "json",
      success: function(data) {
        that.dataAnalytics(data)
        that.trigger('change')
        callback(data);
      },
      error: function(err) {
        console.error(err);
        callback(undefined);
      }
    });
  },
  dataAnalytics: function(data){

    min = max = data[0][1];
    integral = weightedIntegral = 0;
    count = data.length;

    start = data[0][0];
    end = data[count-1][0];
    duration = end - start;
    timecollected = 0

    for(var i = 1; i < count; i++){

      datum = data[i];
      lastdatum = data[i-1];

      nowTimeStamp = datum[0];
      lastTimeStamp = lastdatum[0];      
      deltaTime = nowTimeStamp - lastTimeStamp;
      deltaHours = (nowTimeStamp - lastTimeStamp)/1000/60/60;
      timecollected += deltaTime

      value = datum[1];
      lastvalue = lastdatum[1];
      avgvalue = (value + lastvalue)/2;

      //Is it the smallest?
      if(value < min)
        min = value;

      //Is it the largest?
      if(value > max)
        max = value;

      integral += deltaTime * avgvalue;
      weightedIntegral += deltaHours * avgvalue;

      // console.log(prettyDate(nowTimeStamp), value)

    } 

    average = integral/duration;

    this.min = min;
    this.max = max;
    this.avg = average;
    this.integral = weightedIntegral;
    
  },
  dataStatus: function(){
    return{
      min: this.min,
      max: this.max,
      avg: this.avg,
      integral: this.integral
    }
  },
  generateCostModel: function(){
    costmodel = {};
    costmodel.name = 'Cost';
    costmodel.title = 'No Cost Function Generated';
    costmodel.color = [223,144,1];
    costmodel.value = '';
    costmodel.subvalues = []

    return costmodel
  },
  getSum: function(){
    //default sum is the average of all models
    data = this._homeData(this.valueID)
    return data.sum / data.count;
  },
  columns: function(){
    return [{
      name: "name",
      label: "Zone",
      cell: "string"
    }, {
      name: "val",
      label: "Value",
      cell: "string",
    }]
  },
  rawData: function(){

    var rawData = []
    
    for(var i=0; i < this.models.length; i++){
      var model = this.models[i]
      var object = {
        id: model.get('id'),
        val: Number(model.get('val')),
      }
      rawData.push(object)
    }

    return rawData
  }
})

var LightCollection = BaseCollection.extend({
  model: LightModel,
  name:'lights',
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
  },
  sliderArguments: function(){
    return {
      id: 'lights',
      height: 206,
      width: 302,
      sliderwidth: 50,
      sliderheight: 80,
      min: 0,
      max: 12,
      slider:{
        id: '',
        value: 3,
        unit: ''
      },
      slidervalues: [],
      barvalues:[{
        id: '',
        value: 3,
        unit: '',
        color: [170,184,26],
        status: ''
      }]
    }
  }
});

var HVACCollection = BaseCollection.extend({
  model: HVACModel,
  name:'hvac',
  url: '/hvac',
  valueID: 'tar_temp',
  unit: '°C',
  precision: 2,
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
  getAvgTemp: function() {
    var last = "loading";
    this.each(function(model) {
      last = model.get("avg_temp");
    });
    return last;
  },
  getSum: function(){
    data = this._homeData(this.valueID)
    return data.sum/data.count;
  },
  sliderArguments: function(){
    return {
      id: 'hvac',
      height: 235,
      width: 461,
      sliderwidth: 140,
      sliderheight: 115,
      min: 15,
      max: 32,
      slider:{
        id: 'set',
        value: 22,
        unit: '°C'
      },
      slidervalues: [{
        id: 'power',
        value: 798,
        unit: 'W'
      },{
        id: 'cost',
        value: 1.80,
        unit: '¥'
      }],
      barvalues:[{
        id: 'out',
        value: 27,
        formatvalue: this.formatValue(27),
        unit: '°C',
        color: [84,175,226],
        status: 'cooling'
      },{
        id: 'in',
        value: 23,
        formatvalue: this.formatValue(23),
        unit: '°C',
        color: [173,50,50],
        status: 'heating'
      }]
    }
  }
});

var TempCollection = BaseCollection.extend({
  model: SensorModel,
  name:'temp',
  url: '/temp',
  valueID: 'value',
  getHistoricalData: function(start,end,density,callback) {
    
    this.fakeHistoryData("temp", "val", start, end, density, "avg", callback);

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
  name:'windoor',
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
  },
  sliderArguments: function(){
    return {
      id: 'windoor',
      height: 206,
      width: 301,
      sliderwidth: 0,
      sliderheight: 115,
      min: 0,
      max: 8,
      slider:{
        id: ''
      },
      slidervalues: [],
      barvalues:[{
        id: '',
        value: 1,
        unit: 'Door Open',
        color: [223,144,1],
        status: ''
      }]
    }
  }
});

var PowerCollection = BaseCollection.extend({
  model: SensorModel,
  name:'power',
  url: '/power',
  valueID: 'power',
  unit: 'W',
  rate: 0.0008,
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
    
  },
  generateCostModel: function(range){
    
    production = window.PV.dataStatus().integral / 1000;
    consumption = this.integral / 1000;
    net = production - consumption
    cost = (net * this.rate).toFixed(2)

    if( cost > 0 ){
      title = 'Energy Sold';
      color = [85, 160, 85];
      value = '¥' + Math.abs(cost);
    }else{
      title = 'Energy Paid';
      color = [173, 50, 50];
      value = '¥' + Math.abs(cost);
    }
    
    costmodel = {};
    costmodel.name = 'Cost';
    costmodel.title = title;
    costmodel.color = color;
    costmodel.value = value;
    costmodel.subvalues = []

    p = {
      key: range + 'production',
      value: this.formatValue(production) + 'h'
    };
    c = {
      key: range + 'consumption',
      value: this.formatValue(consumption) + 'h'
    }
    n = {
      key: range + 'net',
      value: this.formatValue(net) + 'h'
    }
    costmodel.subvalues.push(p, c, n)

    return costmodel
  },
  columns: function(){
    that = this

    var powerformatter = Backgrid.CellFormatter = function () {};
    var energyformatter = Backgrid.CellFormatter = function () {};
    var energywsformatter = Backgrid.CellFormatter = function () {};

    _.extend(powerformatter.prototype, {
      fromRaw: function (rawData) {
        number = that.abbreviateNumber(rawData)
        return number[0] + ' ' + number[1] + 'W' ;
      }
    })

    _.extend(energyformatter.prototype, {
      fromRaw: function (rawData) {
        number = that.abbreviateNumber(rawData)
        return number[0] + ' ' + number[1] + 'Wh' ;
      }
    })

    _.extend(energywsformatter.prototype, {
      fromRaw: function (rawData) {
        number = that.abbreviateNumber(rawData)
        return number[0] + ' ' + number[1] + 'Ws' ;
      }
    })

    return [{
      name: "id",
      label: "ID",
      cell: "string"
    },{
      editable: false,
      name: "power",
      label: "Power",
      cell: "number",
      formatter: powerformatter
    },{
      editable: false,
      name: "energy",
      label: "Energy",
      cell: "number",
      formatter: energyformatter
    },{
      editable: false,
      name: "energyWs",
      label: "Watt Seconds",
      cell: "number",
      formatter: energywsformatter
    }]
  },
  rawData: function(){

    var rawData = []
    
    for(var i=0; i < this.models.length; i++){
      var model = this.models[i]
      var object = {
        id: model.get('id'),
        power: Number(model.get('power')),
        energy: Number(model.get('energy')),
        energyWs: Number(model.get('energyWs')),
      }
      rawData.push(object)
    }

    return rawData
  }
});

var PVCollection = BaseCollection.extend({
  model: PVModel,
  name:'pv',
  url: '/pv',
  valueID: 'power',
  unit: 'W',
  rate: 0.0008,
  getHistoricalData: function(start,end,density,callback) {
    
    this.historyData("pv", "power", start, end, density, "sum", callback);
  
  },
  getSum: function(){
    return this._homeData(this.valueID).sum;
  },
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone).sum

    return [
      value,
      this.unit
    ]
    
  },
  generateCostModel: function(range){
    
    production = this.integral / 1000;
    consumption = window.Power.dataStatus().integral / 1000;
    net = production - consumption
    cost = (net * this.rate).toFixed(2)

    if( cost > 0 ){
      title = 'Energy Sold';
      color = [85, 160, 85];
      value = '¥' + Math.abs(cost);
    }else{
      title = 'Energy Paid';
      color = [173, 50, 50];
      value = '¥' + Math.abs(cost);
    }
    
    costmodel = {};
    costmodel.name = 'Cost';
    costmodel.title = title;
    costmodel.color = color;
    costmodel.value = value;
    costmodel.subvalues = []

    p = {
      key: range + 'production',
      value: this.formatValue(production) + 'h'
    };
    c = {
      key: range + 'consumption',
      value: this.formatValue(consumption) + 'h'
    }
    n = {
      key: range + 'net',
      value: this.formatValue(net) + 'h'
    }
    costmodel.subvalues.push(p, c, n)

    return costmodel
  },
  columns: function(){
    that = this
    
    var powerformatter = Backgrid.CellFormatter = function () {};
    var tempformatter = Backgrid.CellFormatter = function () {};
    var voltageformatter = Backgrid.CellFormatter = function () {};

    _.extend(powerformatter.prototype, {
      fromRaw: function (rawData) {
        number = that.abbreviateNumber(rawData)
        return number[0] + ' ' + number[1] + 'W' ;
      }
    })

    _.extend(tempformatter.prototype, {
      fromRaw: function (rawData) {
        return rawData +  ' °C' ;
      }
    })

    _.extend(voltageformatter.prototype, {
      fromRaw: function (rawData) {
        return rawData + 'V' ;
      }
    })

    return [{
      name: "id",
      label: "ID",
      cell: "string"
    }, {
      editable: false,
      name: "power",
      label: "Power",
      cell: "number",
      formatter: powerformatter
    }, {
      editable: false,
      name: "temp",
      label: "Temp",
      cell: "number",
      formatter: tempformatter
    }, {
      editable: false,
      name: "voltage",
      label: "Voltage",
      cell: "number",
      formatter: voltageformatter
    }]
  },
  rawData: function(){

    var rawData = []
    
    for(var i=0; i < this.models.length; i++){
      var model = this.models[i]
      var object = {
        id: model.get('id'),
        power: Number(model.get('power')),
        temp: Number(model.get('temp')),
        voltage: Number(model.get('voltage'))
      }
      rawData.push(object)
    }

    return rawData
  },
  sliderArguments: function(){

    production = this.getSum();
    consumption = Power.getSum();

    max = 1.25 * Math.max(production, consumption,3000)

    return {
      id: 'power',
      height: 235,
      width: 461,
      sliderwidth: 0,
      sliderheight: 115,
      min: 0,
      max: max,
      slider:{
        id: '',
        value: Math.max(production, consumption),
      },
      slidervalues: [],
      barvalues:[{
        id: '+',
        value: production,
        formatvalue: this.formatValue(production),
        color: [85,160,85],
        status: 'producing'
      },{
        id: '-',
        value: consumption,
        formatvalue: this.formatValue(consumption),
        color: [173,50,50],
        status: 'consuming'
      }]
    }
  }
});

var FlowCollection = BaseCollection.extend({
  model: SensorModel,
  name:'water',
  url: '/flow',
  valueID: 'val',
  unit: 'L',
  getHistoricalData: function(start,end,density,callback) {
    
    this.fakeHistoryData("flow", "val", start, end, density, "sum", callback);

  },
  getSum: function(){
    return this._homeData(this.valueID).sum;
  },
  zoneData: function(zone){
    
    value = this._homeData(this.valueID, zone) 

    return [
      value,
      unit
    ]
    
  },
  sliderArguments: function(){
    return {
      id: 'water',
      height: 206,
      width: 301,
      sliderwidth: 0,
      sliderheight: 115,
      min: 0,
      max: 30,
      slider:{
        id: '',
        value: 15
      },
      slidervalues: [],
      barvalues:[{
        id: '',
        value: 15,
        formatvalue: this.formatValue(15),
        unit: 'L',
        color: [84,175,226],
        status: ''
      }]
    }
  }
});

var PyraCollection = BaseCollection.extend({
  model: SensorModel,
  name:'sun',
  url: '/pyra',
  getHistoricalData: function(start,end,density,callback) {
    
    this.fakeHistoryData("value", "val", start, end, density, "avg", callback);

  }
});

var HumidCollection = BaseCollection.extend({
  model: SensorModel,
  name:'humid',
  url: '/humid',
  getHistoricalData: function(start,end,density,callback) {
    
    this.fakeHistoryData("value", "val", start, end, density, "avg", callback);

  }
});

var Co2Collection = BaseCollection.extend({
  model: SensorModel,
  name:'co2',
  url: '/co2',
  getHistoricalData: function(start,end,density,callback) {
    
    this.fakeHistoryData("value", "val", start, end, density, "avg", callback);

  }
});

var OptimizerCollection = CollectionWS.extend({
  model: AlertModel,
  name:'optimizer',
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
