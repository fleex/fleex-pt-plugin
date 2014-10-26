//# sourceURL=views/vocab/vocab_browser.js

(function(App) {
    'use strict';

    var VocabBrowser = Backbone.Marionette.Layout.extend({
        template: '#browser-tpl',
        className: 'main-browser',

        regions: {
            FilterBar: '.filter-bar-region',
            VocabList: '.list-region',
            FleexInfo: '.fleex-info-region'
        },

        onShow: function() {
            this.bar = new App.View.FilterBar({
                model: this.filter
            });
            this.FilterBar.show(this.bar);
            this.VocabList.show(new App.View.VocabList({
                model: new App.Model.VocabList({})
            }));
            this.FleexInfo.show(new App.View.FleexInfo({
                model: App.fleexUser
            }));
        },
    });

    App.View.VocabBrowser = VocabBrowser;
})(window.App);
