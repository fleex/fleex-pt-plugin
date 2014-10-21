(function(App) {
    "use strict";

    var FleexUser = Backbone.Model.extend({
        reset: function(){
        	this.set("name", null);
            this.set("level", null);
            this.set("thumbnailUrl", null);
            this.set("nativeLanguageCode", null);
        }
    });

    App.Model.FleexUser = FleexUser;
})(window.App);