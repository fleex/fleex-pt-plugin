//# sourceURL=views/favorites/fleex_favorite_browser.js

(function(App) {
    'use strict';

    var Temp = App.View.FavoriteBrowser.extend({});

    App.View.FavoriteBrowser = Temp.extend({
        regions: _.extend({}, Temp.prototype.regions, { 
            FleexInfo: '.fleex-info-region'
        }),
        onShow: function(){
            Temp.prototype.onShow.apply(this, arguments);

            this.FleexInfo.show(new App.View.FleexInfo({
               model: App.fleexUser
           }));
        }
    });
    
})(window.App);