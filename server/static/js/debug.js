//singleton initiations
var tabs = {
	init:function(){
		$('div.tab').on('click',function(){
			var context = this;
			tabs.tab_clicked(context);
		});
	},
	tab_clicked:function(context){
		id = $(context).attr("id");
		tabs.selectedId = id;//set the id to be selected appropriately
		//remove all the selected class
		$(".tab").removeClass("selected");
		$(".main-sub-view").removeClass("selected");
		//add selected to relevant tab and subvoew
		$(".tab#"+id).addClass("selected");
		$(".main-sub-view#"+id).addClass("selected");
		//re-render just selected tab
		views[id].render();
	},
	//variable to keep track of the tab that is active right not
	selectedId:"lights"
}
tabs.init();

var lightsView = {
	init: function(){
		//bind all the events
		this.bindEvents();
		console.log("Lights View Initialized");
	},
	bindEvents: function(){
		Lights.on("all",lightsView.render);
	},
	render:function(){
		if(tabs.selectedId !== 'lights') return false;
		$('.main-sub-view#lights').html("");
		_.each(Lights.toJSON(),function(value){
			var log_key = lightsView.objToString(value);
			var el= $('<div>'+log_key+'</div><br/>');
			$('.main-sub-view#lights').append(el);
			console.log(log_key,value);
		});
		console.log("Lights Rendered");
	},
	objToString: function(light_obj){
		var ret_str = light_obj.id+" "+light_obj.zone+" "+light_obj.value;
		return ret_str;
	}
}
var sensorsView = {
	init: function(){
		//bind all the events
		sensorsView.bindEvents();
		console.log("Sensors View Initialized");
	},
	bindEvents: function(){
		Temp.on("all", sensorsView.render);
		Pyra.on("all", sensorsView.render);
		Humid.on("all", sensorsView.render);
		CO2.on("all", sensorsView.render);
		Flow.on("all", sensorsView.render);
		Windoor.on("all", sensorsView.render);
	},
	render: function(){
		if(tabs.selectedId !== 'sensors') return false;
		$('.main-sub-view#sensors').html(""); //clear the tab view
		var sensor_list = [Temp, Pyra, Humid, CO2, Flow, Windoor];
		_.each(sensor_list, sensorsView.renderSubSensor);
		console.log("Sensors Rendered");
	},
	renderSubSensor: function(subSensorColl){
		$('.main-sub-view#sensors').append("<div>--------------------</div><br/>");
		_.each(subSensorColl.toJSON(), function(model){
			var log_key = model.mac_address+" "+model.type+" "+model.val;
			var el= $('<div>'+log_key+'</div><br/>');
			$('.main-sub-view#sensors').append(el);
		});
	}
}

var powerView = {
	init: function(){
		//bind all the events
		powerView.bindEvents();
		console.log("Power View Initialized");
	},
	bindEvents: function(){
		Power.on("all", sensorsView.render);
	},
	render: function(){
		if(tabs.selectedId !== 'power') return false;
		$('.main-sub-view#power').html(""); //clear the tab view
		var power_list = [Power];
		_.each(power_list, sensorsView.renderSubSensor);
		console.log("Power Rendered");
	},
	renderSubSensor: function(subPowerColl){
		$('.main-sub-view#power').append("<div>--------------------</div><br/>");
		_.each(subPowerColl.toJSON(), function(model){
			var log_key = model.id+" "+model.power;
			var el= $('<div>'+log_key+'</div><br/>');
			$('.main-sub-view#sensors').append(el);
		});
	}
}


var hvacView = {
	init: function(){
		//bind all the events
		hvacView.bindEvents();
		console.log("HVAC View Initialized");
	},
	bindEvents: function(){
		HVAC.on("all", hvacView.render);
	},
	render: function(){
		if(tabs.selectedId !== 'hvac') return false;
		$('.main-sub-view#hvac').html("");
		_.each(HVAC.toJSON(),function(value){
			var log_key = hvacView.objToString(value);
			var el= $('<div>'+log_key+'</div><br/>');
			$('.main-sub-view#hvac').append(el);
			console.log(log_key,value);
		});
		console.log("HVAC Rendered");
	},
	objToString: function(obj){
		var ret_str = "Avg Temp:"+obj.avg_temp.val+" State:"+obj.hvac_state.val+" Tar Temp:"+obj.tar_temp.val;
		return ret_str;
	}
}
var othersView = {
	init: function(){
		console.log("Others View Initialized");
	},
	render: function(){
		if(tabs.selectedId !== 'others') return false;
		console.log("Others Rendered");
	}
}

//variable that holds on to all the views
var views = {
	lights:lightsView,
	sensors:sensorsView,
	hvac:hvacView,
	power: powerView,
	others:othersView,
	init: function(){
		views.lights.init();
		views.sensors.init();
		views.hvac.init();
		views.power.init();
		views.others.init();
	}
}
views.init(); //initialize all the views
// Only fetch non-debug collections
var initWS = function(){
	var collections = [window.Lights, HVAC, Temp, Pyra, Humid, CO2, Flow, Windoor];
	var waitingOn = collections.length;
	var start = function() {
	  waitingOn = waitingOn - 1;
	  if (waitingOn == 0) {
	    Backbone.history.start();
	  }
	}

	for (var col in collections) {
	if (collections[col].size() == 0) {
	  collections[col].fetch({
	    success: start
	  });
	}
	}
}
initWS();