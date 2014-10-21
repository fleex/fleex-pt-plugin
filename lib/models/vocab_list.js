(function(App) {
    "use strict";

    var VocabList = Backbone.Model.extend({
        defaults: {
            loading: true
        }
    });

    App.Model.VocabList = VocabList;
})(window.App);