/*global FieldScope GAsyncDataProvider Sys Type */
/*global GLatLng GLatLngBounds GEvent */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// GAsyncDataProvider class

FieldScope.GAsyncDataProvider = function () {
    this.GetOverlays = function (bounds, size, OnSuccess, OnFailure) { };
    this.IsClustered = false;
  };

FieldScope.GAsyncDataProvider.registerInterface('FieldScope.GAsyncDataProvider');

// ----------------------------------------------------------------------------
// GAsyncLayer class

FieldScope.GAsyncLayer = function (inMap, inProvider) {

    this.map = inMap;
    this.provider = inProvider;
    this.overlays = [];
    this.visible = true;
    this.currentbounds = null;
    this.currentzoom = 0;
    this.eventHandlers = new Sys.EventHandlerList();
    
    this.IsVisible = function () { 
        return this.visible;
      };
    
    this.SetVisible = function (newVisible) {
        if (newVisible !== this.visible) {
          if (newVisible) {
            if (this.overlays.length > 0) {
              for (var x = 0; x < this.overlays.length; x += 1) {
                this.map.addOverlay(this.overlays[x]);
              }
            } else {
              this.LoadLayer();
            }
          } else {
            for (var y = 0; y < this.overlays.length; y += 1) {
              this.map.removeOverlay(this.overlays[y]);
            }
          }
          this.visible = newVisible;
        }
      };
    
    this.AttachEvent = function (evt, handler) {
        if ((evt === "onbeginloading") || (evt === "onfinishloading")) {
          this.eventHandlers.addHandler(evt, handler);
        } else {
          throw "Unsupported event: " + evt;
        }
      };
    
    this.DetachEvent = function (evt, handler) {
        this.eventHandlers.removeHandler(evt, handler);
      };
    
    this.OnGetDataSucceededDelegate = Function.createDelegate(this, function (newOverlays) {
        if (newOverlays !== null) {
          // clear existing overlays
          if (this.visible) {
            for (var x = 0; x < this.overlays.length; x += 1) {
              this.map.removeOverlay(this.overlays[x]);
            }
          }
          this.overlays = newOverlays;
          //add new shapes
          if (this.visible) {
            for (var y = 0; y < this.overlays.length; y += 1) {
              this.map.addOverlay(this.overlays[y]);
            }
          } 
        }
        // fire finishloading event
        var handler = this.eventHandlers.getHandler("onfinishloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
      });
    
    this.OnGetDataFailedDelegate = Function.createDelegate(this, function (error) {
        // fire finishloading event
        var handler = this.eventHandlers.getHandler("onfinishloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        // remove outdated overlays
        for (var x = 0; x < this.overlays.length; x += 1) {
          this.map.removeOverlay(this.overlays[x]);
        }
        // display the error
        var stackTrace = error.get_stackTrace();
        var message = error.get_message();
        var statusCode = error.get_statusCode();
        var exceptionType = error.get_exceptionType();
        var timedout = error.get_timedOut();
        var RsltElem = 
            "Stack Trace: " +  stackTrace + "<br/>" +
            "Service Error: " + message + "<br/>" +
            "Status Code: " + statusCode + "<br/>" +
            "Exception Type: " + exceptionType + "<br/>" +
            "Timedout: " + timedout;
        alert(RsltElem);
      });
    
    this.RefreshDataDelegate = Function.createDelegate(this, function () {
        if (this.visible) {
          var bounds = this.map.getBounds();
          var zoom = this.map.getZoom();
          if ((this.currentbounds === null) || 
              (!this.currentbounds.containsBounds(bounds)) ||
              (this.provider.IsClustered && (zoom !== this.currentzoom))) {
            var size = bounds.toSpan();
            var sw = bounds.getSouthWest();
            var ne = bounds.getNorthEast();
            this.currentbounds = new GLatLngBounds(new GLatLng(sw.lat() - (size.lat() / 2.0),
                                                               sw.lng() - (size.lng() / 2.0)),
                                                   new GLatLng(ne.lat() + (size.lat() / 2.0),
                                                               ne.lng() + (size.lng() / 2.0)));
            this.currentzoom = zoom;
            // fire beginloading event
            var handler = this.eventHandlers.getHandler("onbeginloading");
            if (handler) { handler.call(this, Sys.EventArgs.Empty); }
            // call data provider
            this.provider.GetOverlays(this.currentbounds, 
                                      this.map.getSize(), 
                                      this.OnGetDataSucceededDelegate, 
                                      this.OnGetDataFailedDelegate);
          }
        } else {
          this.overlays = [];
          this.currentbounds = null;
        }
      });
    
    GEvent.addListener(this.map, "moveend", this.RefreshDataDelegate);
    GEvent.addListener(this.map, "zoomend", this.RefreshDataDelegate);
    
    this.LoadLayer = function () {
        // get the data for the initial view
        this.RefreshDataDelegate();
      };
    
    this.ReloadLayer = function () {
        // get the data for the initial view
        this.currentbounds = null;
        this.RefreshDataDelegate();
      };
  };

FieldScope.GAsyncLayer.registerClass('FieldScope.GAsyncLayer');

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }