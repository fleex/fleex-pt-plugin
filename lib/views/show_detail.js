//# sourceURL=views/fleex_show_detail.js

(function(App) {
	'use strict';

	App.View.ShowDetail = App.View.ShowDetail.extend({
		startStreaming: function(e) {
			if (e.type) {
				e.preventDefault();
			}
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

			if (AdvSettings.get('playNextEpisodeAuto')) {
				_.each(this.model.get('episodes'), function (value) {
					var epaInfo = {
						id: parseInt(value.season) * 100 + parseInt(value.episode),
						backdrop: that.model.get('images').fanart,
						defaultSubtitle: Settings.subtitle_language,
						episode: value.episode,
						season: value.season,
						title: that.model.get('title') + ' - ' + i18n.__('Season') + ' ' + value.season + ', ' + i18n.__('Episode') + ' ' + value.episode + ' - ' + value.title,
						torrents: value.torrents,
						extract_subtitle: {
							type: 'tvshow',
							imdbid: that.model.get('imdb_id'),
							tvdbid: value.tvdb_id,
							season: value.season,
							episode: value.episode
						},
						tvdb_id: value.tvdb_id,
						imdb_id: that.model.get('imdb_id'),
						device: App.Device.Collection.selected,
						cover: that.model.get('images').poster,
						status: that.model.get('status'),
						type: 'episode'
					};
					episodes_data.push(epaInfo);
					episodes.push(parseInt(value.season) * 100 + parseInt(value.episode));
				});
				episodes.sort();
				episodes_data = _.sortBy(episodes_data, 'id');

				if (parseInt(season) * 100 + parseInt(episode) !== episodes[episodes.length - 1]) {
					auto_play = true;
				}

			} else {
				episodes_data = null;
			}

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
			win.info('Playing next episode automatically:', AdvSettings.get('playNextEpisodeAuto'));
			this.unbindKeyboardShortcuts();
			App.vent.trigger('stream:start', torrentStart);
		}

    });

})(window.App);
