(function(App) {
    "use strict";

    var Auth = Backbone.Model.extend({
        defaults: {
            loading: true
        }
    });

    App.Model.Auth = Auth;
})(window.App);