/*
 * Main JS app
 */

// MODELS


// VIEWS
var homecontrol = Backbone.View.extend({
	el: '#controlwrapper',
    initialize: function() {
        this.template = loadTemplate("/static/views/homecontrol.html");

    },
	render: function () {
        this.$el = $(this.$el.selector);            //IS THIS BAD?
        
        data = {
            "power":{
                "production" : Math.random() * 15.5,
                "consumption" : Math.random() * 15.5
            }

        }

        var renderedTemplate = this.template( data );
        this.$el.html(renderedTemplate)

	}
});

var home = Backbone.View.extend({
    el: '#viewport',
    initialize: function() {
        this.template = loadTemplate("/static/views/home.html");      
        //this.dictionary = loadData("/static/dictionary.json");
        
        this.homeController = new homecontrol();
        //this.homeController.parentView = this;        //failed attempt to properly nest views
        //this.$el.append(this.homeController.$el);
        

        this.floorPlanController = new floorplan( );
        var that = this;
        this.floorPlanController.on('navigate', function(string) {
            that.trigger("navigate", string);
        })
        //this.floorPlanController.parentView = this;   //failed attempt to properly nest views
        //this.$el.append(this.floorPlanController.$el);
    },
    render: function ( id ) {
        var that = this;
        var renderedTemplate = this.template( this.dictionary );
        this.$el.html(renderedTemplate)

        this.floorPlanController.render(1.8, id);

    }
});

$(function() {
    var Router = Backbone.Router.extend({
    	routes: {
    		'': 'home',
            'light/:id': 'light'
    	}
    })

    window.lights = new LightCollection()
    window.lights.fetch();

    console.log(window.lights)
    var homePage = new home();

    var router = new Router();
    router.on('route:home', function (){
    	homePage.render();
        homePage.homeController.render();
        /*
        homePage.okay = setInterval(function(){
            homePage.homeController.render();
        },1000);
        */
    });

    router.on('route:light', function (id){
        homePage.render(id);
        homePage.floorPlanController.lightControllers[id].render();
        /*
        window.clearInterval(homePage.okay)
        */
    });

    homePage.on("navigate", function(string) {
      router.navigate( string, {trigger: true});
    });

    Backbone.history.start();
});
