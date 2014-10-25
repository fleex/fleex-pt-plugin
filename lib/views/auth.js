//# sourceURL=views/auth.js

(function(App) {
    "use strict";

    var AuthModal = Backbone.Marionette.ItemView.extend({
        template: '#auth-tpl',
        className: 'auth',
        initialize: function() {
            // The iframe in the view will tell us when
            // the user has successfully been authenticated
            var that = this;
            window.onmessage = function(e){
                if(e.data.action == 'auth:close'){
                    that.finalizeAuth(e.data.args);
                } else if(e.data.action == 'link:open'){
                    that.openLink(e.data.args);
                } else if(e.data.action == 'app:close'){
                    that.closeApp();
                }
            }
        },
        onRender: function() {
            var that = this;
            var url = this.model.get("logout") == true ?
                AdvSettings.get('fleexApiEndpoint') + 'Account/LogOff?returnUrl=%2fPopcorn%2fAuth' :
                AdvSettings.get('fleexApiEndpoint') + 'Popcorn/Auth';
            // Load iframe
            // NB: couldn't find a way to define the 'load' handler through
            //     Marionettte's standard 'trigger', or even 'events' hash
            this.ui.iframe.load(function(){
                that.model.set('loading', false);
            });
            this.ui.iframe.attr('src', url);
        },
        ui: {
            content: '#auth-content',
            iframe: '#auth-iframe'
        },
        /* Model events */
        modelEvents: {
            'change:loading': 'loadingToggled'
        },
        loadingToggled: function(){
            this.ui.content.toggleClass('auth-loading');
        },
        finalizeAuth: function(user) {
            App.vent.trigger('auth:close', []);
            App.fleexUser.set({
                "name": user.name,
                "level": user.level,
                "thumbnailUrl": user.thumbnailUrl,
                "nativeLanguageCode": user.nativeLanguageCode
            });
            console.log("Logged in fleex user", user);
        },
        openLink: function(url) {
            gui.Shell.openExternal(url);
        },
        closeApp: function() {
            gui.App.quit();
        }
    });

    App.View.AuthModal = AuthModal;
})(window.App);
