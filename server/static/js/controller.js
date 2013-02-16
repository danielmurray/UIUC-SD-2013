// Main controller/router

$(function() {
  var Home = new HomeView();
  var Router = Backbone.Router.extend({
    routes: {
      '*path': 'displayUrl'
    },
    rootView: Home,
    currentPath: [], // holds the /split/path/pieces/here
    currentViews: [], // each index holds a list of all views for that path part
    displayPart: function(level, currentView, remainingPath) {
      remainingPath = remainingPath.slice();
      console.log("Displaying", level, currentView, remainingPath);
      var part = remainingPath.shift();
      var subviews = currentView.route(part, remainingPath); // returns a dict
      currentView.render(); // re-render parent view before attaching children
      var allCreatedViews = this.currentViews[level];
      for (var name in subviews) {
        var subview = subviews[name];
        allCreatedViews.push(subview);
        currentView.assign(subview, name);
        this.displayPart(level+1, subview, remainingPath);
      }
    },
    displayUrl: function(path) {
      console.log("Displaying", path, this);
      // split the path by "/"s, then recursively create the new views
      var pathParts = path.split("/");
      // find the path difference
      // []
      // ["control", "lights"] diffIdx = 0
      // ["control", "heat"] diffIdx = 1
      // ["history", "lights"] diffIdx = 0
      var diffIdx;
      for (diffIdx = 0; diffIdx < Math.min(this.currentPath.length, pathParts.length); diffIdx++) {
        if (this.currentPath[diffIdx] != pathParts[diffIdx]) {
          break;
        }
      }

      // tear down old views
      for (var teardownIdx = this.currentPath.length-1; teardownIdx >= diffIdx; teardownIdx--) {
        console.log("Destroying view level", teardownIdx, this.currentPath[teardownIdx]);
        for (var viewIdx in this.currentViews[teardownIdx]) {
          var view = this.currentViews[teardownIdx][viewIdx];
          view.dispose();
        }
      }

      // set up new views
      this.currentViews = this.currentViews.slice(0, diffIdx);
      for (var i = diffIdx; i < pathParts.length; i++) {
        this.currentViews[i] = [];
      }

      if (diffIdx == 0) {
        // no parts are the same
        this.displayPart(0, this.rootView, pathParts);
      } else {
        for (var viewIdx in this.currentViews[diffIdx-1]) {
          var view = this.currentViews[diffIdx-1][viewIdx];
          this.displayPart(diffIdx, view, pathParts.slice(diffIdx, pathParts.length));
        }
      }
      console.log("Path parts", pathParts);
      this.currentPath = pathParts;
    }
  });

  window.router = new Router();

  window.navigate = function(str, noTrigger) {
    console.log("Navigating to", str);
    router.navigate(str, {
      trigger: !noTrigger
    });
    router.currentPath = str.split("/");
  };

  // Only fetch non-debug collections
  var collections = [window.Lights];
  for (var col in collections) {
    if (collections[col].size() == 0) {
      collections[col].fetch();
    }
  }

  Backbone.history.start();
  console.log("Router", router);
});