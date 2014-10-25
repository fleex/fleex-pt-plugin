//# sourceURL=models/player/fleex_laoading.js

(function (App) {
	'use strict';

	var Temp = App.View.Loading.extend({});

	App.View.Loading = Temp.extend({
		onShow: function(){
            Temp.prototype.onShow.apply(this, arguments);
            $('.fleex-info').hide();
        },

        onClose: function(){
            Temp.prototype.onClose.apply(this, arguments);
            $('.fleex-info').show();
        },

		onStateUpdate: function () {
			Temp.prototype.onStateUpdate.apply(this, arguments);
			var state = this.model.get('state');
			// When we're ready:
			// - at best the video starts so the state text disappears anyway
			// - at worse we're actually still waiting for the fleexer
			//   --> show text saying we're still waiting for subtitles
			if(state==='ready'){
				this.ui.stateTextDownload.text(i18n.__('waitingForSubtitles'));
			}
		}
	});

})(window.App);
