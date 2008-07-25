/*global FieldScope GEvent Sys Type */

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
    
    this.layers = layers;
    this.eventListeners = [];
    this.infoWindowOpen = false;
    
    this.Activate = function (map) {
        map.disableDragging();
        map.getContainer().style.cursor = 'pointer';
        this.eventListeners.push(GEvent.addListener(map, "click", Function.createDelegate(this, function (overlay, loc, overlayLoc) {
            loc = loc || overlayLoc;
            if (loc &&
                map.getInfoWindow().isHidden() &&
                (!map.getExtInfoWindow()) &&
                ((!overlay) || (!overlay.getLatLng))) {
              map.getContainer().style.cursor = 'wait';
              var callback = Function.createDelegate(this, function (html) {
                  var options = {
                      onCloseFn : Function.createDelegate(this, function () {
                          this.infoWindowOpen = false;
                        })
                    };
                  map.openInfoWindowHtml(loc, html, options);
                  this.infoWindowOpen = true;
                  map.getContainer().style.cursor = 'pointer';
                });
              for (var x = 0; x < this.layers.length; x += 1) {
                if (this.layers[x].IsVisible() && this.layers[x].Identify) {
                  if (this.layers[x].Identify(loc, callback)) {
                    break;
                  }
                }
              }
            }
          })));
        var EnableDragging = function () {
            map.enableDragging();
          };
        var DisableDragging = function () {
            map.disableDragging();
          };
        this.eventListeners.push(GEvent.addListener(map, "infowindowopen", EnableDragging));
        this.eventListeners.push(GEvent.addListener(map, "extinfowindowopen", EnableDragging));
        this.eventListeners.push(GEvent.addListener(map, "infowindowclose", DisableDragging));
        this.eventListeners.push(GEvent.addListener(map, "extinfowindowclose", DisableDragging));
      };
    
    this.Deactivate = function (map) {
        map.getContainer().style.cursor = null;
        for (var x = 0; x < this.eventListeners.length; x += 1) {
          GEvent.removeListener(this.eventListeners[x]);
        }
        this.eventListeners = [];
        if (this.infoWindowOpen) {
          map.closeInfoWindow();
          this.infoWindowOpen = false;
        }
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