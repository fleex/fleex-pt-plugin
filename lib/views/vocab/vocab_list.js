(function(App) {
    "use strict";

    var VocabList = Backbone.Marionette.ItemView.extend({
        template: '#vocab-list-tpl',
        className: 'vocab-list',
        initialize: function() {
            console.log('Show vocabulary list');

            // The iframe in the view will pass us some messages
            var that = this;
            window.onmessage = function(e){
                if(e.data.action == 'vocab:close'){
                    that.closeVocabList();
                }
            }
        },
        onRender: function() {
            var that = this;
            var url = AdvSettings.get('fleexApiEndpoint') + 'Popcorn/VocabularyList';
            // Load iframe
            // NB: couldn't find a way to define the 'load' handler through
            //     Marionettte's standard 'trigger', or even 'events' hash
            this.ui.iframe.load(function(){
                that.model.set('loading', false);
            });
            this.ui.iframe.attr('src', url);
        },
        ui: {
            content: '#vocab-list-content',
            iframe: '#vocab-list-iframe'
        },
        /* Model events */
        modelEvents: {
            'change:loading': 'loadingToggled'
        },
        loadingToggled: function(){
            this.ui.content.toggleClass('vocab-list-loading');
        },
        closeVocabList: function() {
            App.vent.trigger('vocab:close');
        }
    });

    App.View.VocabList = VocabList;
})(window.App);
