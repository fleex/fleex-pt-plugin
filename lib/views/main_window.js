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
			App.vent.on('fleexer:ready', _.bind(this.fleexerReady, this));
			App.vent.on('fleexPlayer:close', _.bind(this.showViews, this));
			App.vent.on('fleexPlayer:close', _.bind(this.Player.close, this.Player));

			App.vent.on('stream:fleexLocal', _.bind(this.showFleexPlayer, this));
			App.vent.on('stream:stop', _.bind(this.resetStreamCache, this));
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

		resetStreamCache: function(){
			cachedStreamModel = null;
			cachedFleexUrl = null;
		},

		streamReady: function (streamModel) {
			if(App.Device.Collection.selected.get('id')=='fleex'){
				cachedStreamModel = streamModel;
				if(cachedFleexUrl){
					this.startFleexDevice();
				}
			} else {
				App.Device.Collection.startDevice(streamModel);
			}
		},

		fleexerReady: function (fleexUrl) {
			if(App.Device.Collection.selected.get('id')=='fleex'){
				cachedFleexUrl = fleexUrl;
				if(cachedStreamModel){
					this.startFleexDevice();
				}
			}
		},

		startFleexDevice: function(){
			cachedStreamModel.set('fleexUrl', cachedFleexUrl);
			App.Device.Collection.startDevice(cachedStreamModel);
			cachedStreamModel = null;
			cachedFleexUrl = null;
		},

		showFleexPlayer: function (streamModel) {
			if(streamModel.get('fleexUrl')){
				this.Player.show(new App.View.FleexPlayer({
					model: streamModel
				}));
				this.Content.$el.hide();
				if (this.MovieDetail.$el !== undefined) {
					this.MovieDetail.$el.hide();
				}
				cachedStreamModel = null;
				cachedFleexUrl = null;
			}
		},
	})

})(window.App);