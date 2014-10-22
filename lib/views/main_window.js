//# sourceURL=views/fleex_main_window.js

(function(App) {
	'use strict';

	var cachedStreamModel = null;
	var cachedFleexUrl = null;

	var Temp = App.View.MainWindow.extend({});

	App.View.MainWindow = Temp.extend({
		regions: _.extend({}, Temp.prototype.regions, { 
			Auth: '#auth-container'
		}),
		initialize: function(){ 
			Temp.prototype.initialize.apply(this, arguments);

			// Application variables
			App.fleexUser = new App.Model.FleexUser({});

			// Vocab list events
			App.vent.on('vocab:list', _.bind(this.showVocabList, this));
			App.vent.on('vocab:close', _.bind(this.showMovies, this));

			// Add event to show auth
			App.vent.on('auth:show', _.bind(this.showAuth, this));
			App.vent.on('logout', _.bind(this.logOut, this));
			App.vent.on('auth:close', _.bind(this.Auth.close, this.Auth));

			// Fleexer-related events
			App.vent.on('fleexer:ready', _.bind(this.fleexerReady, this))

			// For torrents, launch fleex player instead of PT's player
			App.vent.off('stream:local');
			App.vent.on('stream:local', _.bind(this.playVideo, this));
		},

		onShow: function(){
			Temp.prototype.onShow.apply(this, arguments);

			// We check if the user is logged in
			var model = new App.Model.Auth();
			this.showAuth(model);
		},

		showVocabList: function() {
			this.Settings.close();
			this.MovieDetail.close();

			this.Content.show(new App.View.VocabBrowser());
		},

		showAuth: function(authModel) {
			var modal = new App.View.AuthModal({
				model: authModel
			});
			this.Auth.show(modal);
		},

		logOut: function() {
			App.fleexUser.reset();
			var model = new App.Model.Auth({ logout: true });
			var modal = new App.View.AuthModal({
				model: model
			});
			this.Auth.show(modal);
			console.log('Logged out fleex user');
		},

		showSettings: function() {
			var model = new Backbone.Model({
				loading: true
			});
			this.Settings.show(new App.View.Settings({
				model: model
			}));
		},

		streamReady: function (streamModel) {
			debugger;
			cachedStreamModel = streamModel;
			this.playVideoIfReady();
		},

		fleexerReady: function (fleexUrl) {
			debugger;
			cachedFleexUrl = fleexUrl;
			this.playVideoIfReady();
		},

		playVideoIfReady: function(){
			if(cachedStreamModel && cachedFleexUrl){
				cachedStreamModel.set('fleexUrl', cachedFleexUrl);
			}
			if(cachedFleexUrl || cachedStreamModel.get('type')=='video/youtube'){
				App.Device.Collection.startDevice(cachedStreamModel);
				cachedStreamModel = null;
				cachedFleexUrl = null;
			}
		},

		playVideo: function(streamModel){
			if(streamModel.get('type')=='video/youtube'){
				this.showPlayer(streamModel);
			} else {
				this.showFleexPlayer(streamModel);
			}
		},

		showFleexPlayer: function (streamModel) {
			this.Player.show(new App.View.FleexPlayer({
				model: streamModel
			}));
			this.Content.$el.hide();
			if (this.MovieDetail.$el !== undefined) {
				this.MovieDetail.$el.hide();
			}
		},
	})

})(window.App);