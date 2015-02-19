(function (App) {
	'use strict';

	var FleexLocal = App.Device.Generic.extend({
		defaults: {
			id: 'fleex',
			type: 'local',
			name: 'Popcorn Time fleex'
		},
		play: function (streamModel) {
			App.vent.trigger('stream:fleexLocal', streamModel);
		}
	});
	var fleexLocal = new FleexLocal();
	App.Device.Collection.add(fleexLocal);

})(window.App);
