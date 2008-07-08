/*global FieldScope, esri, dojo, Sys, Type */

Type.registerNamespace("FieldScope.ArcGISServer");

// ----------------------------------------------------------------------------
// ArcGISServer.DataProvider class

FieldScope.ArcGISServer.GDataProvider = function (inUrl) {
    
    this.qtask = new esri.arcgis.gmaps.QueryTask(inUrl);
    this.fillStyle = {color: "#0000FF", opacity: 0.3};
    this.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
    this.icon = null;
    this.description = { };
    
    dojo.xhrGet({ 
        url: inUrl + "?f=json",
        handleAs: "json",
        load: Function.createDelegate(this, function (response, ioArgs) {
            this.description = response;
            return response;
          }),
        error: function (response, ioArgs) {
            console.error(response);
            return response;
          },
        sync: true
     });
    
    this.QueryCallback = function (fset, OnSuccess, OnFailure) {
        try {
          var overlays = [];
          var overlay;
          for (var x = 0; x < fset.features.length; x += 1) {
            var feature = fset.features[x];
            for (var y = 0; y < feature.geometry.length; y += 1) {
              overlay = feature.geometry[y];
              if (overlay.setStrokeStyle) {
                overlay.setStrokeStyle(this.lineStyle);
              }
              if (overlay.setFillStyle) {
                overlay.setFillStyle(this.fillStyle);
              }
              if (overlay.setImage && this.icon) {
                overlay = new GMarker(overlay.getLatLng(), this.icon);
              }
              overlays.push(overlay);
            }
          }
          OnSuccess.call(this, overlays);
          /*
          if (this.iconImage) {
            for (var z = 0; z < overlays.length; z += 1) {
              if (overlays[z].setImage) {
                overlays[z].setImage(this.iconImage);
              }
            }
          }
          */
        } catch (e) {
          OnFailure.call(this, e);
        }
      };
    
    this.GetOverlays = function (bounds, size, OnSuccess, OnFailure) { 
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = bounds;
        query.returnGeometry = true;
        this.qtask.execute(query, false, Function.createDelegate(this, function (fset) {
            this.QueryCallback(fset, OnSuccess, OnFailure);
          }));
      };
  };

FieldScope.ArcGISServer.GDataProvider.registerClass('FieldScope.ArcGISServer.GDataProvider', null, FieldScope.GAsyncDataProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }