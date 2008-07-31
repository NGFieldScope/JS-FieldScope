/*global FieldScope GEvent GInfoWindowTab Sys Type */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// MouseMode class

FieldScope.MouseMode = function () {
    
    this.Activate = function (map) { };
    this.Deactivate = function (map) { };
    this.GetName = function () { };
    this.GetId = function () { };
    this.GetIconCssClass = function () { };
    
  };

FieldScope.MouseMode.registerInterface('FieldScope.MouseMode');

// ----------------------------------------------------------------------------
// NavigateMouseMode class

FieldScope.NavigateMouseMode = function () {
    
    this.Activate = function (map) {
        map.enableDragging();
      };
    this.Deactivate = function () { 
      };
    this.GetName = function () { 
        return "Navigate Map";
      };
    this.GetId = function () { 
        return "FieldScope.Tool[navigate]";
      };
    this.GetIconCssClass = function () { 
         return "handIcon";
      };
    
  };

FieldScope.NavigateMouseMode.registerClass('FieldScope.NavigateMouseMode', null, FieldScope.MouseMode);

// ----------------------------------------------------------------------------
// InfoMouseMode class

FieldScope.InfoMouseMode = function (layers) {
    
    this.map = null;
    this.layers = layers;
    this.eventListeners = [];
    this.tabs = [];
    this.enablePopup = true;
    
    this.OnCloseDelegate = Function.createDelegate(this, function () {
         this.tabs = [];
      });
    
    this.IdentifyCallbackDelegate = Function.createDelegate(this, function (loc, layer, html) {
        this.tabs.push(new GInfoWindowTab(layer, html));
        if (this.tabs.length === 1) {
          this.map.openInfoWindowTabsHtml(loc, this.tabs, { onCloseFn : this.OnCloseDelegate });
        } else {
          this.map.updateInfoWindow(this.tabs);
        }
      });
    
    this.OnClickDelegate = Function.createDelegate(this, function (overlay, loc, overlayLoc) {
        this.map.getContainer().style.cursor = 'wait';
        loc = loc || overlayLoc;
        if (loc &&
            this.enablePopup &&
            ((!overlay) || (!overlay.getLatLng))) {
          for (var x = 0; x < this.layers.length; x += 1) {
            if (this.layers[x].IsVisible() && this.layers[x].Identify) {
              this.layers[x].Identify(loc, this.IdentifyCallbackDelegate);
            }
          }
        }
        this.map.getContainer().style.cursor = 'help';
      });
    
    this.EnablePopupDelegate = Function.createDelegate(this, function () {
        this.enablePopup = true;
      });
    
    this.DisableDraggingDelegate = Function.createDelegate(this, function () {
        this.map.disableDragging();
        // Re-enabling popups with setTimeout fixes bug in Firefox that caused
        // clicking the popup close box would cause another popup to open
        window.setTimeout(this.EnablePopupDelegate, 0);
      });
    
    this.EnableDraggingDelegate = Function.createDelegate(this, function () {
        this.map.enableDragging();
        this.enablePopup = false;
      });
    
    this.Activate = function (map) {
        map.disableDragging();
        map.getContainer().style.cursor = 'help';
        this.map = map;
        this.eventListeners.push(GEvent.addListener(map, "click", this.OnClickDelegate));
        this.eventListeners.push(GEvent.addListener(map, "infowindowopen", this.EnableDraggingDelegate));
        this.eventListeners.push(GEvent.addListener(map, "extinfowindowopen", this.EnableDraggingDelegate));
        this.eventListeners.push(GEvent.addListener(map, "infowindowclose", this.DisableDraggingDelegate));
        this.eventListeners.push(GEvent.addListener(map, "extinfowindowclose", this.DisableDraggingDelegate));
      };
    
    this.Deactivate = function (map) {
        map.getContainer().style.cursor = null;
        for (var x = 0; x < this.eventListeners.length; x += 1) {
          GEvent.removeListener(this.eventListeners[x]);
        }
        this.eventListeners = [];
        if (this.tabs.length > 0) {
          map.closeInfoWindow();
          this.tabs = [];
        }
        this.map = null;
      };
    
    this.GetName = function () { 
        return "Get Information";
      };
    
    this.GetId = function () { 
        return "FieldScope.Tool[getInfo]";
      };
    
    this.GetIconCssClass = function () { 
         return "infoIcon";
      };
    
  };

FieldScope.InfoMouseMode.registerClass('FieldScope.InfoMouseMode', null, FieldScope.MouseMode);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }