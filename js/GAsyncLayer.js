/*global FieldScope GAsyncDataProvider Sys Type */
/*global GLatLng GLatLngBounds GEvent */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// GAsyncDataState class

FieldScope.GAsyncDataState = function (map) {
    this.mapBounds = map.getBounds();
    var size = this.mapBounds.toSpan();
    var sw = this.mapBounds.getSouthWest();
    var ne = this.mapBounds.getNorthEast();
    this.dataBounds = new GLatLngBounds(new GLatLng(sw.lat() - (size.lat() / 2.0),
                                                    sw.lng() - (size.lng() / 2.0)),
                                        new GLatLng(ne.lat() + (size.lat() / 2.0),
                                                    ne.lng() + (size.lng() / 2.0)));
    this.zoom = map.getZoom();
    this.time = new Date();
  };

FieldScope.GAsyncDataState.registerClass('FieldScope.GAsyncDataState');

// ----------------------------------------------------------------------------
// GAsyncDataProvider class

FieldScope.GAsyncDataProvider = function () {
    this.AddOverlays = function (bounds, size, OnSuccess, OnFailure) { };
    this.TriggersRefresh = function (oldState, newState) { };
  };

FieldScope.GAsyncDataProvider.registerInterface('FieldScope.GAsyncDataProvider');

// ----------------------------------------------------------------------------
// GAsyncLayer class

FieldScope.GAsyncLayer = function (inMap, inProvider) {

    this.map = inMap;
    this.provider = inProvider;
    this.overlays = [];
    this.visible = true;
    this.currentState = null;
    this.eventHandlers = new Sys.EventHandlerList();
    
    this.IsVisible = function () { 
        return this.visible;
      };
    
    this.SetVisible = function (newVisible) {
        if (newVisible !== this.visible) {
          this.visible = newVisible;
          if (newVisible) {
            if (this.overlays.length > 0) {
              for (var x = 0; x < this.overlays.length; x += 1) {
                this.map.addOverlay(this.overlays[x]);
              }
            } else {
              this.ReloadLayer();
            }
          } else {
            for (var y = 0; y < this.overlays.length; y += 1) {
              this.map.removeOverlay(this.overlays[y]);
            }
          }
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
    
    this.OnAddOverlaysSucceededDelegate = Function.createDelegate(this, function (newOverlays) {
        // remove overlays again, in case some overlays got added 
        // asynchronously after our asynchronous process started.
        if (this.overlays) {
          for (var x = 0; x < this.overlays.length; x += 1) {
            this.map.removeOverlay(this.overlays[x]);
          }
        }
        // save the new overlays
        if (newOverlays) {
          this.overlays = newOverlays;
        }
        // fire finishloading event
        var handler = this.eventHandlers.getHandler("onfinishloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
      });
    
    this.OnAddOverlaysFailedDelegate = Function.createDelegate(this, function (error) {
        // fire finishloading event
        var handler = this.eventHandlers.getHandler("onfinishloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        // display the error
        console.error(error);
      });
    
    this.AddOverlaysDelegate = Function.createDelegate(this, function () {
        // clear existing overlays
        if (this.visible) {
          for (var x = 0; x < this.overlays.length; x += 1) {
            this.map.removeOverlay(this.overlays[x]);
          }
        }
        this.overlays = [];
        if (this.currentState && this.currentState.dataBounds) {
          this.provider.AddOverlays(this.currentState.dataBounds, 
                                    this.map.getSize(), 
                                    this.OnAddOverlaysSucceededDelegate, 
                                    this.OnAddOverlaysFailedDelegate);
        }
      });
    
    this.RefreshDataDelegate = Function.createDelegate(this, function () {
        if (this.visible) {
          var newState = new FieldScope.GAsyncDataState(this.map);
          if ((!this.currentState) || this.provider.TriggersRefresh(this.currentState, newState)) {
            this.currentState = newState;
            // fire beginloading event
            var handler = this.eventHandlers.getHandler("onbeginloading");
            if (handler) { handler.call(this, Sys.EventArgs.Empty); }
            // Call data provider. Why do this with setTimeout? 
            // It seems to keep IE6 from deadlocking
            window.setTimeout(this.AddOverlaysDelegate, 0);
          }
        } else {
          this.overlays = [];
          this.currentState = null;
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

// ----------------------------------------------------------------------------
// DataEntryProvider class

FieldScope.DataEntryProvider = function () {
    this.GenerateForm = function (marker) { };
    this.ActivateForm = function (map) { };
    this.MarkerIcon = null;
  };

FieldScope.DataEntryProvider.registerInterface('FieldScope.DataEntryProvider');

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }