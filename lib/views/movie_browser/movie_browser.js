(function(App) {
    'use strict';

    var Temp = App.View.MovieBrowser.extend({});

    // Extend 'initialize' function
    App.View.MovieBrowser = Temp.extend({
        initialize: function(){
            Temp.prototype.initialize.apply(this, arguments);

            this.FleexInfo.show(new App.View.FleexInfo({
               model: App.fleexUser
           }));
        }
    });

    // Add 'FleexInfo' region
    App.View.MovieBrowser.addRegion('FleexInfo', '.fleex-info-region');
    
})(window.App);