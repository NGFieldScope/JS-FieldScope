/*global MetaLens, Sys, Type, Utility, $get, $addHandler */
/*global VELatLong, VEShape, VEShapeType */
/*global AsyncDataProvider */

Type.registerNamespace("MetaLens");

// ----------------------------------------------------------------------------
// Setup additional properties for shapes

VEShape.prototype.PointLocationIds=[]; //array of point location id's
VEShape.prototype.GAINSType="";

// ----------------------------------------------------------------------------
// MetaLens.DataProvider class

MetaLens.DataProvider = function (inService) {
    
    this.service = inService;
    this.currentIndex = 0;
    
    this.GetMinimumZoomLevel = function () { 
        return 3; 
      };
    
    this.GetRecords = function (bounds, zoom, OnSuccess, OnFailure) { 
        var bboxString = bounds.TopLeftLatLong.Latitude + ' ' + bounds.TopLeftLatLong.Longitude + ',' + bounds.BottomRightLatLong.Latitude + ' ' + bounds.BottomRightLatLong.Longitude;
        //call webservice
        this.service.GetPoints(bboxString, zoom, OnSuccess, OnFailure);
      };
    
    this.CreateShape = function (record) { 
        var loc = new VELatLong(record.Location.Lat, record.Location.Lon);
        //Create the shape
        var newShape = new VEShape(VEShapeType.Pushpin, loc);
        newShape.GAINSType = "gainsPoint";
        newShape.PointLocationIds = record.ClusteredPointLocationIds;
        //Default Pin popup information  
        newShape.SetTitle("Point: " + record.PointLocationId);
        newShape.SetDescription("fetching data...");   
        //set custom png pin, IE6 will require a PNG fix.
        var pinClass = 'pin';
        if (record.IsClustered === true) {
            pinClass = pinClass + '-cl';
        }
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version === 6)) {
            newShape.SetCustomIcon("<div class='" + pinClass + "IE6'></div>");
        } else {  
            newShape.SetCustomIcon("<div class='" + pinClass + "'></div>");                
        }                
        return newShape;
      };
    
    this.OwnsShape = function (shape) { 
        return shape.GAINSType === "gainsPoint";
      };
    
    this.GetPopup = function (shape, divID, OnSuccess, OnFailure) { 
        //set current pin               
        this.currentIndex = 0;
        //get the content for the pin.
        this.service.GetPointPopup(shape.PointLocationIds[this.currentIndex],
                                   Function.createDelegate(this, function (result, shapeID) { 
                                       this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                     }),
                                   OnFailure, 
                                   shape.GetID());
      };
    
    this.PreviousRecord = function (evt, shape, divID, OnSuccess) {
        this.currentIndex -= 1;
        $get(divID).innerHTML = "Loading...";
        this.service.GetPointPopup(shape.PointLocationIds[this.currentIndex],
                                   Function.createDelegate(this, function (result, shapeID) { 
                                       this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                     }),
                                   Utility.OnFailed, 
                                   shape.GetID());
      };
    
    this.NextRecord = function (evt, shape, divID, OnSuccess) {
        this.currentIndex += 1;
        $get(divID).innerHTML = "Loading...";
        this.service.GetPointPopup(shape.PointLocationIds[this.currentIndex],
                                   Function.createDelegate(this, function (result, shapeID) { 
                                       this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                     }),
                                   Utility.OnFailed, 
                                   shape.GetID());
      };
    
    this.OnContentSucceededDelegate = function (result, shape, divID, OnSuccess) {
        //create the content element
        var el = document.createElement("div");
        el.innerHTML = result.Html;
        // Add the NEXT / PREV buttons if this pin represents multiple data points
        if (shape.PointLocationIds.length > 1) {
          var prevButton = document.createElement("div");
          prevButton.innerHTML = "Previous";
          el.appendChild(prevButton);
          Sys.UI.DomElement.addCssClass(prevButton, "ActionButton");
          if (this.currentIndex > 0) {  
            $addHandler(prevButton,"click", Function.createDelegate(this, function (e) {
                this.PreviousRecord(e, shape, divID, OnSuccess);
              }));
          } else {
            Sys.UI.DomElement.addCssClass(prevButton, "ButtonDisabled");
          }
          var nextButton = document.createElement("div");
          nextButton.innerHTML = "Next";
          el.appendChild(nextButton);  
          Sys.UI.DomElement.addCssClass(nextButton, "ActionButton");
          if (this.currentIndex < (shape.PointLocationIds.length - 1)) {  
            $addHandler(nextButton, "click", Function.createDelegate(this, function (e) {
                this.NextRecord(e, shape, divID, OnSuccess);
              }));                      
          } else {
            Sys.UI.DomElement.addCssClass(nextButton, "ButtonDisabled");
          }
        }
        OnSuccess.call(this, shape.GetID(), result.Title, result.Details, el);
      };
  };


MetaLens.DataProvider.registerClass('MetaLens.DataProvider', null, AsyncDataProvider);


if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }