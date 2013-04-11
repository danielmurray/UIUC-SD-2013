// Client-side only, not ModelWS
var OptmizerCollection = CollectionWS.extend({
  model: AlertModel,
  initialize: function(collections){
     this.collections = collections;
      _.each(collections, function(collection){
          model.on("change", this.changeValue, this)
        });
    },
  changeValue: function(model, val, options){
      // recalculate all alerts from this.collections
      this.add([new AlertModel({id: "high-power", message:"You're using a lot of power!"})], {merge: true});
    }
});