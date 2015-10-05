/**
 * FindMe from the MeLibs (https://github.com/QuatreCentQuatre/findMe/)
 * Library that let you easily to subscribe, unsubscribe, emit events
 *
 * Licence :
 *  - GLP v2
 *
 * Version :
 *  - 1.0.0
 *
 * Dependencies :
 *  - jQuery (https://jquery.com/)
 *
 * Public Methods :
 *  - setOptions
 *  - getOptions
 *
 * Private Methods :
 *  - deg2rad
 *  - rad2deg
 *
 * Updates Needed :
 *  -
 *
 */
(function($, window, document, undefined) {
	"use strict";

	/* Private Variables */
	var instanceID      = 1;
	var instanceName    = "FindMe";
	var defaults        = {
		debug: false
	};
	var overwriteKeys   = [
		'debug'
	];

	/* Private Methods */
	var privatesMethods = {
        deg2rad: function(angle) {
            return angle * .017453292519943295;
        },
        rad2deg: function(angle) {
            return angle * 57.29577951308232;
        }
    };

	/* Builder Method */
	var FindMe = function() {
		this.__construct();
	};
	var proto = FindMe.prototype;

	/* Private Variables */
	proto.__id          = null;
	proto.__name        = null;
	proto.__debugName   = null;

	/* Publics Variables */
	proto.debug         = null;
	proto.options       = null;

	/**
	 *
	 * __construct
	 * the first method that will be executed.
	 *
	 * @param   options  all the options that you need
	 * @return  object    null || scope
	 * @access  private
	 *
	 */
	proto.__construct = function(options) {
		this.__id        = instanceID;
		this.__name      = instanceName;
		this.__debugName = this.__name + ":: ";

		this.setOptions(options);

		if (!this.__validateDependencies()) {return null;}
		if (!this.__validateArguments()) {return null;}

		instanceID ++;
		this.__initialize();

		return this;
	};

	/**
	 *
	 * __initialize
	 * set the basics
	 *
	 * @return  object scope
	 * @access  private
	 *
	 */
	proto.__initialize = function() {
		return this;
	};

	/**
	 *
	 * __validateDependencies
	 * Will check if you got all the dependencies needed to use that plugins
	 *
	 * @return  boolean
	 * @access  private
	 *
	 */
	proto.__validateDependencies = function() {
		var isValid = true;

		if (!window.jQuery) {
			isValid = false;
			if (this.debug) {console.warn(this.__debugName + "required jQuery (https://jquery.com/)");}
		}

		return isValid;
	};

	/**
	 *
	 * __validateArguments
	 * Will check if you got all the required options needed to use that plugins
	 *
	 * @return  boolean
	 * @access  private
	 *
	 */
	proto.__validateArguments = function() {
		var isValid = true;

		return isValid;
	};

	/**
	 *
	 * setOptions
	 * will merge options to the plugin defaultKeys and the rest will be set as additionnal options
	 *
	 * @param   options
	 * @return  object scope
	 * @access  public
	 *
	 */
	proto.setOptions = function(options) {
		var scope    = this;
		var settings = (this.options) ? $.extend({}, this.options, options) : $.extend({}, defaults, options);

		$.each(settings, function(index, value) {
			if ($.inArray(index, overwriteKeys) != -1) {
				scope[index] = value;
				delete settings[index];
			}
		});

		this.options = settings;

		return this;
	};

	/**
	 *
	 * getOptions
	 * return the additional options that left
	 *
	 * @return  object options
	 * @access  public
	 *
	 */
	proto.getOptions = function() {
		return this.options;
	};

    /**
     *
     * getGeo
     * return your geolocation
     *
     * @return  object
     * @access  public
     *
     */
	proto.getGeo = function(callback, scope) {
		var time = 20000;
		this.timeout = setTimeout($.proxy(function (){
            getGeoMethods.error.call(this, {code: 3});
		}, this), time);

		navigator.geolocation.getCurrentPosition($.proxy(getGeoMethods.success, this), $.proxy(getGeoMethods.error, this), {timeout: time});
		this.findScope    = scope;
		this.findCallback = callback;
	};

	var getGeoMethods = {
		success: function(position) {
			clearTimeout(this.timeout);
			this.findCallback.call(this.findScope, {status:'success', code:200, position:{lat:position.coords.latitude, lng:position.coords.longitude}});
		},
		error: function(error) {
			clearTimeout(this.timeout);
			SETTINGS.GEO_DATA = null;
			var code = null;
			console.log(error.code);
			switch(error.code) {
				case error.PERMISSION_DENIED: // refused access
					code = 101;
					console.log("refused access");
					break;
				case error.POSITION_UNAVAILABLE: // cannot access location
					code = 102;
					console.log("cannot access location");
					if (typeof findMethods.callExternalService === "function") {
						findMethods.callExternalService.call(this);
					}
					return;
					break;
				case error.TIMEOUT: // timeout
					code = 103;
					console.log("timeout");
					break;
				case error.UNKNOWN_ERROR:
					code = 104;
					console.log("An unknown error occurred.");
					break;
			}
			this.findCallback.call(this.findScope, {status:'error', code:code, position:{lat:null, lng:null}});
		},
		callExternalService: function() {
			if (window.phpLocation) {
				this.findCallback.call(this.findScope, {status:'success', code:200, position:{lat:Number(window.phpLocation.lat), lng:Number(window.phpLocation.lng)}});
			} else {
				this.findCallback.call(this.findScope, {status:'error', code:code, position:{lat:null, lng:null}});
			}

		}
	};

    /**
     *
     * getClosestItems
     * can check if type exist or if a more precise event is subcribed
     *
     * @return  array
     * @access  public
     *
     */
	proto.getClosestItems = function(fromPoint, toList, limit, maxDistanceKM) {
		if (!maxDistanceKM) {
			maxDistanceKM = 99999999;
		}
		var sortedList = [];
		$.each(toList, $.proxy(function(index, item) {
			item.distance   = this.getEarthDistanceBetween2Points(fromPoint.geo, item.geo);
			item.kilometers = this.getUnitDistanceBetween2Points(fromPoint.geo, item.geo);
			sortedList.push(item);
		}, this));

		sortedList = _.sortBy(sortedList, 'distance');

		var closestList = [];
		for (var i=0; i<limit; i++) {
			sortedList[i].nearIndex = (i + 1);
			if (sortedList[i].kilometers <= maxDistanceKM) {
				closestList.push(sortedList[i]);
			}
		}

		return closestList;
	};

    /**
     *
     * getEarthDistanceBetween2Points
     * return the distance between these 2 points in meter
     *
     * @return  number
     * @access  public
     *
     */
	proto.getEarthDistanceBetween2Points = function(pos1, pos2) {
		var earthR      = 6378137; // Earth’s mean radius in meter
		var distanceLat = rad(pos2.lat - pos1.lat);
		var distanceLng = rad(pos2.lng - pos1.lng);

		var a = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) + Math.cos(rad(pos1.lat)) * Math.cos(rad(pos1.lat)) * Math.sin(distanceLng / 2) * Math.sin(distanceLng / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return earthR * c;
	};

	var rad = function(x) {
		return x * Math.PI / 180;
	};

    /**
     *
     * getUnitDistanceBetween2Points
     * return the distance in Kilometers and can change unit to : (M : miles)
     *
     * @return  number
     * @access  public
     *
     */
	proto.getUnitDistanceBetween2Points = function(pos1, pos2, $unit) {
        $unit = $unit.toUpperCase();
		var $theta = pos1.lng - pos2.lng;
		var $dist  =
            Math.sin(privatesMethods.deg2rad(pos1.lat)) *
            Math.sin(privatesMethods.deg2rad(pos2.lat)) +
            Math.cos(privatesMethods.deg2rad(pos1.lat)) *
            Math.cos(privatesMethods.deg2rad(pos2.lat)) *
            Math.cos(privatesMethods.deg2rad($theta));
		$dist = Math.acos($dist);
		$dist = privatesMethods.rad2deg($dist);

		var $result = $dist * 60 * 1.1515;

		if ($unit == "M") {
            $result = ($result * 0.8684);
		} else {
            $result = ($result * 1.609344).toFixed(2);
        }

        return $result;
	};

	proto.toString = function() {
		return "[" + this.__name + "]";
	};

	/* Create Me reference if does'nt exist */
	if (!window.Me) {window.Me = {};}

	/* Initiate to make a Singleton */
	Me.dispatch = new FindMe();
}(jQuery, window, document));