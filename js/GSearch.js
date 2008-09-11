/*global FieldScope Sys Type $get */
/*global GClientGeocoder GEvent GLatLng GMarker */
/*global GeocodeService */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// Google Geocoding class

FieldScope.GSearch = function(map, geocodeServiceUrls, appendResultCallback) {

  this.map = map;
  this.geocodeServiceUrls = geocodeServiceUrls;
  this.AppendResult = appendResultCallback;
  this.eventHandlers = new Sys.EventHandlerList();
  this.googleGeocoder = new GClientGeocoder();
  this.codersWorking = 0;
  this.overlays = [];

  this.MaybeFireFinishSearch = function() {
    if (this.codersWorking === 0) {
      var handler = this.eventHandlers.getHandler("onfinishsearch");
      if (handler) { handler.call(this, Sys.EventArgs.Empty); }
    }
  };

  this.OnFailureDelegate = Function.createDelegate(this, function(err) {
    console.error(err);
    this.codersWorking -= 1;
    this.MaybeFireFinishSearch();
  });

  this.AttachEvent = Function.createDelegate(this, function(evt, handler) {
    if ((evt === "onbeginsearch") || (evt === "onfinishsearch")) {
      this.eventHandlers.addHandler(evt, handler);
    } else {
      throw "Unsupported event: " + evt;
    }
  });

  this.DetachEvent = Function.createDelegate(this, function(evt, handler) {
    this.eventHandlers.removeHandler(evt, handler);
  });

  this.DoSearch = Function.createDelegate(this, function(text) {
    this.ClearSearchResults();
    var handler = this.eventHandlers.getHandler("onbeginsearch");
    if (handler) { handler.call(this, Sys.EventArgs.Empty); }
    this.googleGeocoder.setViewport(this.map.getBounds());
    this.codersWorking += this.geocodeServiceUrls.length + 1;
    this.googleGeocoder.getLocations(text, this.GoogleCallbackDelegate);
    for (var x = 0; x < this.geocodeServiceUrls.length; x += 1) {
      GeocodeService.Geocode(text, geocodeServiceUrls[x], this.ArcGISCallbackDelegate, this.OnFailureDelegate);
    }
  });

  this.MakePlacemark = function(x, y, address) {
    var point = new GLatLng(y, x);
    var marker = new GMarker(point);
    var anchor = document.createElement("a");
    anchor.setAttribute("href", 'javascript: void(0)');
    anchor.appendChild(document.createTextNode(address));
    var delegate = Function.createDelegate(this, function() {
      this.map.panTo(point);
      anchor.style.background = "#FFFF00";
      window.setTimeout(function() { anchor.style.background = ""; }, 750);
    });
    anchor.onclick = delegate;
    GEvent.addListener(marker, "click", delegate);
    return { Dom: anchor, Overlay: marker };
  };

  this.GoogleCallbackDelegate = Function.createDelegate(this, function(response) {
    if (response && (response.Status.code === 200) && (response.Placemark.length > 0)) {
      for (var x = 0; x < response.Placemark.length; x += 1) {
        var pm = this.MakePlacemark(response.Placemark[x].Point.coordinates[0],
                                    response.Placemark[x].Point.coordinates[1],
                                    response.Placemark[x].address);
        this.overlays.push(pm.Overlay);
        this.map.addOverlay(pm.Overlay);
        this.AppendResult(pm.Dom);
      }
    }
    this.codersWorking -= 1;
    this.MaybeFireFinishSearch();
  });

  this.ArcGISCallbackDelegate = Function.createDelegate(this, function(result) {
    if (result.Status === "M") {
      var pm = this.MakePlacemark(result.X, result.Y, result.Address);
      this.overlays.push(pm.Overlay);
      this.map.addOverlay(pm.Overlay);
      this.AppendResult(pm.Dom);
    }
    this.codersWorking -= 1;
    this.MaybeFireFinishSearch();
  });

  this.ClearSearchResults = Function.createDelegate(this, function() {
    for (var x = 0; x < this.overlays.length; x += 1) {
      this.map.removeOverlay(this.overlays[x]);
    }
    this.overlays = [];
    this.AppendResult(null);
  });
};

FieldScope.GSearch.registerClass("FieldScope.GSearch");

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
