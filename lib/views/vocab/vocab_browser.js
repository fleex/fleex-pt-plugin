(function(App) {
    "use strict";

    var VocabBrowser = Backbone.Marionette.Layout.extend({
        template: '#vocab-browser-tpl',
        className: 'vocab-browser',

        regions: {
            FilterBar: '.filter-bar-region',
            VocabList: '.vocab-list-region',
            FleexInfo: '.fleex-info-region'
        },

        onShow: function() {
            this.FilterBar.show(new App.View.FilterBarVocab({}));
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