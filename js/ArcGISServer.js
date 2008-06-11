/*global ArcGISServer, ESRI, Sys, Type */
/*global VEColor, VELatLong, VEShape, VEShapeType */
/*global AsyncDataProvider */

Type.registerNamespace("ArcGISServer");

// ----------------------------------------------------------------------------
// ArcGISServer.DataProvider class

ArcGISServer.DataProvider = function (inUrl) {
    
    this.url = inUrl;
    this.lineColor = new VEColor(255, 0, 0, 0.5); 
    this.fillColor = new VEColor(0, 255, 0, 0.5);
    this.labelField = "";
    
    this.GetMinimumZoomLevel = function () { 
        return 0; 
      };
    
    this.GetRecords = function (bounds, zoom, OnSuccess, OnFailure) { 
        var top = bounds.TopLeftLatLong.Latitude;
        var left = bounds.TopLeftLatLong.Longitude;
        var bottom = bounds.BottomRightLatLong.Latitude;
        var right = bounds.BottomRightLatLong.Longitude;
        var spatialQueryParams = new ESRI.ArcGIS.VE.Query();
        spatialQueryParams.Geometry = new VEShape(VEShapeType.Polygon, 
                                                  [ new VELatLong(top, left),
                                                    new VELatLong(top, right), 
                                                    new VELatLong(bottom, right),
                                                    new VELatLong(bottom, left) ]);
        spatialQueryParams.SpatialRelationship = "esriSpatialRelIntersects";
        spatialQueryParams.OutFields = [this.labelField];
        var spatialQueryTask = new ESRI.ArcGIS.VE.QueryTask();
        spatialQueryTask.Url = this.url;
        spatialQueryTask.Execute(spatialQueryParams, Function.createDelegate(this, function (data) {
            this.OnQueryExecuteSucceeded(data, OnSuccess, OnFailure);
          }));
      };
    
    this.OnQueryExecuteSucceeded = function (data, OnSuccess, OnFailure) {
        if (data.Error) {
          OnFailure.call(this, data.Error);
        } else {
          OnSuccess.call(this, data.Features);
        }
      };
    
    this.CreateShapes = function (record) { 
        var result = [];
        for (var i = 0; i < record.Shapes.length; i += 1) {
          var shape = record.Shapes[i];
          shape.SetFillColor(this.fillColor);
          shape.SetLineColor(this.lineColor);
          shape.SetCustomIcon("<div class='featureLabel'>"+record.Attributes[this.labelField]+"</div>");
          shape.Show();
          result.push(shape);
        }
        return result;
      };
    
    this.OwnsShape = function (shape) { 
        return false;
      };
    
    this.GetPopup = function (shape, divID, OnSuccess, OnFailure) { 
        
      };
  };

ArcGISServer.DataProvider.registerClass('ArcGISServer.DataProvider', null, AsyncDataProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }