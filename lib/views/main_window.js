(function(App) {
    'use strict';

    var Temp = App.View.MainWindow.extend({});

    // Modify onShow function
    App.View.MainWindow = Temp.extend({
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

			// Launch fleex player instead of PT's player
			App.vent.off('stream:local');
			App.vent.on('stream:local', _.bind(this.showFleexPlayer, this));
		},

    	onShow: function(){
    		Temp.prototype.onShow.apply(this, arguments);

    		// We check if the user is logged in
			var model = new App.Model.Auth();
			that.showAuth(model);
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
            if(streamModel.get('fleexed')){
                App.Device.Collection.startDevice(streamModel);
            }
        },

        fleexerReady: function (streamModel) {
            if(streamModel.get('state') === 'ready'){
                App.Device.Collection.startDevice(streamModel);
            }
        },
    })

    // Add 'Auth' region
    App.View.MainWindow.addRegion('Auth', '#auth-container');

    
    
})(window.App);
