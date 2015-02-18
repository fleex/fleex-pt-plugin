//# sourceURL=views/fleex_settings.js

(function (App) {
	'use strict';

	var Temp = App.View.About.extend({});

	App.View.About = Temp.extend({
		onShow: function(){
            Temp.prototype.onShow.apply(this, arguments);
            $('.fleex-info').hide();
        },

        onClose: function(){
            Temp.prototype.onClose.apply(this, arguments);
            $('.fleex-info').show();
        }

	});

})(window.App);
