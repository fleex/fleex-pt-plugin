(function(App) {
    "use strict";

    var FleexPlayer = Backbone.Marionette.ItemView.extend({
        template: '#fleex-player-tpl',
        className: 'fleex-player',

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            iframe: 'iframe',
            header: '.player-header-background'
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .vjs-fullscreen-control': 'toggleFullscreen',
            'mouseenter @ui.header': function(){ this.sendEventToIframe('popcornHeaderRegion:mouseEntered'); },
            'mouseleave @ui.header': function(){ this.sendEventToIframe('popcornHeaderRegion:mouseLeft'); },
        },        

        initialize: function() {
            this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
            this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);

            // Listen to key down events sent by the window and redirect them to our iframe
            var that = this;
            $(window).on('keydown', function(e){
                // We send a 'fake' copy of the event, as events can't be cloned natively
                that.sendEventToIframe('parentFrame:keydown', { keyCode: e.keyCode });
            })
        },

        updateDownloadSpeed: function() {
            this.ui.downloadSpeed.text(this.model.get('downloadSpeed') + '/s');
        },

        updateUploadSpeed: function() {
            this.ui.uploadSpeed.text(this.model.get('uploadSpeed') + '/s');
        },

        sendEventToIframe: function(eventName, args){
            try {
                this.ui.iframe.get(0).contentWindow.postMessage({
                    type: 'event',
                    eventName: eventName,
                    args: args
                }, '*');
            }
            catch(err) {
                // Do nothing
            }
        },

        closePlayer: function() {
            console.log('Close player');
            App.vent.trigger('fleexPlayer:close');  
        },

        onShow: function() {
            // Test to make sure we have title
            console.log("Watching: " + this.model.get("title"));
			//$(".filter-bar").show(); 
            var _this = this;

            $('.player-header-background').canDragWindow();
            $('#video_player').canDragWindow();
            
            // Double Click to toggle Fullscreen
            $('#video_player').dblclick(function(event){
              _this.toggleFullscreen();
            });

            // React to events sent by the iframe
            window.onmessage = function(e){
                if(e.data.action == 'header:show'){
                    _this.showHeader();
                } else if(e.data.action == 'header:hide'){
                    _this.hideHeader();
                } else if(e.data.action == 'fullscreen:leave'){
                    _this.leaveFullscreen();
                } else if(e.data.action == 'fullscreen:enter'){
                    _this.enterFullscreen();
                } else if(e.data.request == 'isFullscreen'){
                    var res = require('nw.gui').Window.get().isFullscreen;
                    _this.ui.iframe.get(0).contentWindow.postMessage({
                        type: "response",
                        response: res,
                        guid: e.data.guid
                    }, '*');
                }
            }
        },

        showHeader: function(){
            this.ui.header.show();
        },

        hideHeader: function(){
            this.ui.header.hide();
        },

        toggleFullscreen: function() {

            this.nativeWindow = require('nw.gui').Window.get();

            if(this.nativeWindow.isFullscreen) {
                this.leaveFullscreen();
            } else {
                this.enterFullscreen();
            }
        },

        leaveFullscreen: function() {
            this.nativeWindow = require('nw.gui').Window.get();

            if(this.nativeWindow.isFullscreen) {
                this.nativeWindow.leaveFullscreen();
                this.sendEventToIframe("popcorn:leftFullscreen");
            }
        },

        enterFullscreen: function() {
            this.nativeWindow = require('nw.gui').Window.get();

            if(!this.nativeWindow.isFullscreen) {
                this.nativeWindow.enterFullscreen();
                this.sendEventToIframe("popcorn:enteredFullscreen");
            }
        },

        onClose: function() {
            App.vent.trigger('stream:stop');            
        }

    });
    App.View.FleexPlayer = FleexPlayer;
})(window.App);
