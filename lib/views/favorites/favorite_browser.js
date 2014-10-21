(function(App) {
    'use strict';

    var Temp = App.View.FavoriteBrowser.extend({});

    // Extend 'initialize' function
    App.View.FavoriteBrowser = Temp.extend({
        initialize: function(){
            Temp.prototype.initialize.apply(this, arguments);

            this.FleexInfo.show(new App.View.FleexInfo({
               model: App.fleexUser
           }));
        }
    });

    // Add 'FleexInfo' region
    App.View.FavoriteBrowser.addRegion('FleexInfo', '.fleex-info-region');
    
})(window.App);