//MODEL
var Light = ModelWS.extend({
  defaults: function() {
    return {
      id: null,
      room: "home",
      current: 0 // between 0 and 100
    }
  },
  initialize: function() {
  }
});

//COLLECTION
var LightCollection = CollectionWS.extend({
	model: Light,
    url: '/light'
});

//VIEW
var lightcontrol = Backbone.View.extend({
    el: '#controlwrapper',
    initialize: function( light ) {
    	this.model = light;

        console.log(this.model)
    	this.listenTo(this.model, 'change', this.render);

        this.template = loadTemplate("/static/views/lightcontrol.html");
        this.dragging = false;

    },
    updateslider: function(){
    	var that = this;

    	$( "#lightdimmer" ).slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: this.model.get('id') == 'livingroom' ? 1000000000 : 100 ,
            value: this.model.get('current'),
            start: function (event, ui){
                that.dragging = true;
            },
            stop: function (event, ui){
                that.dragging = false;
            },
            slide: function( event, ui ) {
                console.log(ui.value)
                that.model.save({ current: ui.value});
            }
	    });

	    $( "#toggleon" ).click(function() {
	    	var lastvalue = that.model.get('last')
	    	console.log(lastvalue)
	    	that.model.save({ last: null});
	    	if(lastvalue != null)
	    		that.model.save({ current: lastvalue});
	    });

	    $( "#toggleoff" ).click(function() {
	    	var currentvalue = that.model.get('current')
	    	that.model.save({ last: currentvalue});
	        that.model.save({ current: 0});
	    });
    },
    render: function () {
        if (this.dragging) {
            return;
        }

        this.$el = $(this.$el.selector);            //IS THIS BAD?

        var lightTemplate = this.template( this.model );

        this.$el.html(lightTemplate);

        this.updateslider();

        this.parentView.fillroom(this.model.get("id"));
    }
});


var floorplan = Backbone.View.extend({
    el: '#floorplan',
    initialize: function() {
		var that = this;

		this.floorplanpaths = loadData("/static/paths.json");
		
        //this.collection = window.bullshit;
        this.collection = window.lights;

		this.lightControllers = new Array();

        console.log(this.collection)
		_.each(this.collection.models, function(item){
			
			that.lightControllers[item.id] = new lightcontrol(item);
			that.lightControllers[item.id].parentView = that;

        });

		this.selectedroom = null;
    },
    selectroom: function(id){

        if(id != null){
            

            if (!this.lightControllers[id]) {
                console.log("This room has no data");
                return;
            }

            this.selectedroom = id;
            this.rooms[this.selectedroom].attr({"opacity": 1});
            //console.log(id)
            this.trigger("navigate", 'light/'+id);
        }else{

        }
    },
    fillroom: function(id){
        if(this.selectedroom != null){
            this.rooms[id].attr({fill: "rgb(179, 26, 56)", opacity: .75});
        }
    },
    render: function (size , id) {

    	var that = this;

    	var floorplancanvas = new ScaleRaphael( "floorplan", 350, 300);

        var rooms = [];
        var raphrooms = floorplancanvas.set();


        _.each(this.floorplanpaths.rooms, function(room){
            var thing = rooms[room.id] = floorplancanvas.path(room.newpath).attr({"id": room.id, "fill": "#3E3E3E", "stroke": "#000000", "stroke-width": 0, "opacity": .5, 'stroke-opacity':'0'}); //creates the raphael objects then stores them to an array rooms
            rooms[room.id].id = room.id;    //setting the ids of the raphael objects
            raphrooms.push(thing)           //pushing the rooms to a raphael group object for easier manipulation
        })
        
        var outerWalls = floorplancanvas.path(this.floorplanpaths.outerwalls).attr({fill:'#000','fill-opacity':'1', 'stroke':'#d9d9d9','stroke-width':'0','stroke-opacity':'0.4'});
        var innerWalls = floorplancanvas.path(this.floorplanpaths.innerwalls).attr({fill:'#000','fill-opacity':'0', 'stroke':'#000','stroke-width':'2','stroke-opacity':'1'});


        raphrooms.mouseover(function (event) {
            if(this.id != that.selectedroom)
                this.attr({"opacity": 1});
        });
        raphrooms.mouseout(function (event) {
            if(this.id != that.selectedroom){
                this.attr({"opacity": .5});
            }
        });
        raphrooms.click(function (event) {
            that.selectroom(this.id)
        });

        //Scales raphael drawing by multiplyer specified, size        
        floorplancanvas.scaleAll(size)

        this.floorplancanvas = floorplancanvas;
        this.rooms = rooms;
        this.raphrooms = raphrooms;

        this.selectedroom = id;
        this.fillroom(id);
    }
});












