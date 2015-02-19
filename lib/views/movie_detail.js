//# sourceURL=views/fleex_movie_detail.js

(function(App) {
	'use strict';

	App.View.MovieDetail = App.View.MovieDetail.extend({
		startStreaming: function() {
			var imdbid = parseInt((this.model.get('imdbid') || '').replace('tt', '')) || 0;
			var torrentStart = new Backbone.Model({
				imdb_id: this.model.get('imdb_id'),
				torrent: this.model.get('torrents')[this.model.get('quality')].magnet,
				backdrop: this.model.get('backdrop'),
				subtitle: this.model.get('subtitle'),
				defaultSubtitle: this.subtitle_selected,
				title: this.model.get('title'),
				name: this.model.get('title'),
				description: this.model.get('synopsis'),
				type: 'movie',
				quality: this.model.get('quality'),
				device: App.Device.Collection.selected,
				cover: this.model.get('image'),
				imdbid: imdbid
			});
			App.vent.trigger('stream:start', torrentStart);
		},

	});
})(window.App);
