//# sourceURL=views/fleex_settings.js

(function (App) {
	'use strict';

	var Temp = App.View.Settings.extend({});

	App.View.Settings = Temp.extend({
		ui: _.extend({}, Temp.ui, { 
			iframe: 'iframe'
		}),

		initialize: function() {
			var that = this;
			window.onmessage = function(e){
				if(e.data.action === 'fleexUser:updateNativeLanguageCode'){
					that.updateNativeLanguageCode(e.data.args);
				}
			};
		},

       	updateNativeLanguageCode: function(nativeLanguageCode){
			console.log('Updated fleex native language code to ' + nativeLanguageCode);
			App.fleexUser.set('nativeLanguageCode', nativeLanguageCode);
       	},

       onShow: function(){
            Temp.prototype.onShow.apply(this, arguments);

			// Load iframe
			// NB: couldn't find a way to define the 'load' handler through
			// Marionettte's standard 'trigger', or even 'events' hash
			var that = this;
			this.ui.iframe.load(function(){
				that.model.set('loading', false);
			});
            $('.fleex-info').hide();
        },

        onClose: function(){
            Temp.prototype.onClose.apply(this, arguments);
            $('.fleex-info').show();
        },

		/* Model events */
		modelEvents: {
			'change:loading': 'loadingToggled'
		},
		loadingToggled: function(){
			this.ui.iframe.toggleClass('native-language-loading');
		},


	});

})(window.App);
