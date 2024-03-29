/*global FieldScope esri Sys Type G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.ArcGISServer");

// ----------------------------------------------------------------------------
// ArcGISServer.DataProvider class

FieldScope.ArcGISServer.GDataProvider = function (mapExt, inUrl) {
    
    this.mapExt = mapExt;
    this.qtask = new esri.arcgis.gmaps.QueryTask(inUrl);
    this.fillStyle = {color: "#0000FF", opacity: 0.3};
    this.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
    this.icon = G_DEFAULT_ICON;
    this.queryfields = [];
    this.infoWindow = null;
    
    this.QueryCallback = function (fset, OnSuccess, OnFailure) {
        try {
          var overlays = [];
          if (fset) {
            var overlayOptions = {
                markerOptions : { 
                    icon : this.icon,
                    clickable : (this.infoWindow !== null)
                  },
                strokeColor : this.lineStyle.color,
                strokeWeight : this.lineStyle.weight,
                strokeOpacity : this.lineStyle.opacity,
                fillColor : this.fillStyle.color,
                fillOpacity : this.fillStyle.opacity,
                clickable : (this.infoWindow !== null)
              };
            var infoWindowOptions = {
                content : this.infoWindow
              };
            var arr = this.mapExt.addToMap(fset, overlayOptions, infoWindowOptions);
            for (var x = 0; x < arr.length; x += 1) {
              for (var y = 0; y < arr[x].length; y += 1) {
                overlays.push(arr[x][y]);
              }
            }
          }
          OnSuccess.call(this, overlays);
        } catch (e) {
          console.error(e);
          OnFailure.call(this, e);
        }
      };
    
    this.AddOverlays = function (bounds, size, OnSuccess, OnFailure) { 
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = bounds;
        query.outFields  = this.queryfields;
        query.returnGeometry = true;
        this.qtask.execute(query, false, Function.createDelegate(this, function (fset) {
            this.QueryCallback(fset, OnSuccess, OnFailure);
          }));
      };
    
    this.TriggersRefresh = function (oldState, newState) {
        return (!oldState.dataBounds.containsBounds(newState.mapBounds));
      };
  };

FieldScope.ArcGISServer.GDataProvider.registerClass('FieldScope.ArcGISServer.GDataProvider', null, FieldScope.GAsyncDataProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }