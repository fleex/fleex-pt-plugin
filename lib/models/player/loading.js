(function (App) {
	'use strict';

	var Temp = App.View.Loading.extend({});

	App.View.Loading = Temp.extend({

		onProgressUpdate: function () {
			if(this.model.get('fleexed')){
				this.ui.seedStatus.css('visibility', 'hidden');
				this.ui.title.text('Preparing subtitles...');
			} else {
				Temp.prototype.onProgressUpdate.apply(this, arguments);
			}
		},
		
	});

})(window.App);
