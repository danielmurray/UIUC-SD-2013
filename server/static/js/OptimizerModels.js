//Test Model with calculations implemented.
var PVTestModel = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      value: null,
      unit: 'kW'
    }
  },

  initialize: function(){
  _.bindAll(this, 'calculate');
  this.bind('change', this.setCalculations, this);
  this.setCalculations();
  },
  
  setCalculations: function(){
  this.set({ calculations: this.calculate() }, { silent: true });
  },

  calculate: function(){
    //return sum of values
    return this.reduce(function(memo,value){return memo + value.get("value")});
  }
  
});