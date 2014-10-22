//# sourceURL=views/fleex_info.js

(function(App) {
    "use strict";

    var FleexInfo = Backbone.Marionette.ItemView.extend({
        template: '#fleex-info-tpl',
        className: 'fleex-info',
        initialize: function() {
            console.log('Show fleex info');
        },
        onRender: function() {
            this.ui.levelContainer.tooltip({
                html: true
            });
        },
        /* Model events */
        modelEvents: {
            'change:name':'render',
            'change:level':'render'
        },
        ui: {
            name: '.name',
            level: '.level',
            logout: '.logout',
            levelContainer: '.level-container',
            showVocabList: '.show-vocab-list'
        },
        events: {
            'click @ui.logout':'logout',
            'click @ui.showVocabList':'showVocabList'
        },
        logout: function(){
            App.vent.trigger('logout');
        },
        showVocabList: function(){
            App.vent.trigger('vocab:list');
        }
    });

    App.View.FleexInfo = FleexInfo;
})(window.App);
