//# sourceURL=views/fleex_show_detail.js

(function(App) {
	'use strict';

	App.View.ShowDetail = App.View.ShowDetail.extend({
		startStreaming: function(e) {
			e.preventDefault();
			var that = this;
			var title = that.model.get('title');
			var episode = $(e.currentTarget).attr('data-episode');
			var season = $(e.currentTarget).attr('data-season');
			var name = $(e.currentTarget).attr('data-title');
			var description = $('.episode-info-description').text();

			title += ' - ' + i18n.__('Season') + ' '+ season + ', ' + i18n.__('Episode') + ' '+ episode +' - '+ name;
			var epInfo = {
				type: 'tvshow',
				imdbid: that.model.get('imdb_id'),
				tvdbid: that.model.get('tvdb_id'),
				season: season,
				episode: episode
			};

			var episodes = [];
			var episodes_data = [];
			var selected_quality = $(e.currentTarget).attr('data-quality');
			var auto_play = false;

			var torrentStart = new Backbone.Model({
				torrent: $(e.currentTarget).attr('data-torrent'),
				backdrop: that.model.get('images').fanart,
				type: 'episode',
				tvdb_id: that.model.get('tvdb_id'),
				imdb_id: that.model.get('imdb_id'),
				show_title: that.model.get('title'),
				show_description: that.model.get('synopsis'),
				episode: episode,
				season: season,
				title: title,
				status: that.model.get('status'),
				name: name,
				description: description,
				extract_subtitle: epInfo,
				quality: selected_quality,
				defaultSubtitle: Settings.subtitle_language,
				device: App.Device.Collection.selected,
				cover: that.model.get('images').poster,
				episodes: episodes,
				auto_play: auto_play,
				auto_id: parseInt(season) * 100 + parseInt(episode),
				auto_play_data: episodes_data
			});
			
			this.unbindKeyboardShortcuts();
			App.vent.trigger('stream:start', torrentStart);
		}

    });

})(window.App);
