/*
 * Geolocation Manager
 * */
(function($, window, document, undefined){
	'use strict';

	var GeoManager = function(){
		this.__construct();
	};

	var proto = GeoManager.prototype;

	//--------Methods--------//
	proto.__construct = function() {
	};


	proto.find = function(callback, scope) {
        var time = 20000;
        this.timeout = setTimeout($.proxy(function (){
            findMethods.error.call(this, {code: 3});
        }, this), time);

		navigator.geolocation.getCurrentPosition($.proxy(findMethods.success, this), $.proxy(findMethods.error, this), {timeout: time});
		this.findScope    = scope;
		this.findCallback = callback;
	};

	var findMethods = {
		success: function(position) {
            clearTimeout(this.timeout);
            this.findCallback.call(this.findScope, {status:'success', code:200, position:{lat:position.coords.latitude, lng:position.coords.longitude}});
		},
		error: function(error) {
            clearTimeout(this.timeout);
            SETTINGS.GEO_DATA = null;
			var code = null;
			switch(error.code) {
				case 1: // refused access
					code = 101;
					console.log("refused access");
					break;
				case 2: // cannot access location
					code = 102;
					console.log("cannot access location");
					break;
				case 3: // timeout
					code = 103;
					console.log("timeout");
					break;
				case 4:
					code = 104;
					console.log("An unknown error occurred.");
					break;
			}
			this.findCallback.call(this.findScope, {status:'error', code:code, position:{lat:null, lng:null}});
		}
	};

	window.GeoManager = new GeoManager();
}(jQuery, window, document));