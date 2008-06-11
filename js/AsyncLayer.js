/*global AsyncLayer, Sys, Type, Utility, $get, $addHandler */
/*global VELatLong, VEMapStyle, VEMapMode, VEShape, VEShapeLayer, VEShapeType */

// ----------------------------------------------------------------------------
// AsyncLayerProvider class

/*global AsyncDataProvider */
AsyncDataProvider = function () {
    this.GetMinimumZoomLevel = function () { return 0; };
    this.GetRecords = function (bounds, zoom, OnSuccess, OnFailure) { };
    this.CreateShapes = function (record) { return null; };
    this.OwnsShape = function (shape) { return false; };
    this.GetPopup = function (shape, divID, OnSuccess, OnFailure) { };
  };

AsyncDataProvider.registerInterface('AsyncDataProvider');

// ----------------------------------------------------------------------------
// AsyncLayer class

/*global AsyncLayer */
AsyncLayer = function (inMap, inProvider) {

    this.map = inMap;
    this.provider = inProvider;
    this.veLayer= new VEShapeLayer(); 
    this.map.AddShapeLayer(this.veLayer);
    this.zoomlevel = 0;
    this.popupPrefix = "POPUP";
    this.currentShape = null;
    this.eventHandlers = new Sys.EventHandlerList();
    
    this.isVisible = function () { 
        return this.veLayer.IsVisible();
      };
    
    this.setVisible = function (newVisible) {
        if (newVisible) {
          this.veLayer.Show();
        } else {
          this.veLayer.Hide();
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
    
    this.OnGetDataSucceededDelegate = Function.createDelegate(this, function (newRecords) {
        if (newRecords !== null) {
          var newShapes = [];
          // clear existing shapes
          this.veLayer.DeleteAllShapes();
          //clear existing pins
          this.veLayer.DeleteAllShapes();
          //add new shapes
          for (var x = 0; x < newRecords.length; x += 1) {
            var record = newRecords[x];
            var shapes = this.provider.CreateShapes(record);
            for (var y = 0; y < shapes.length; y += 1) {
              this.veLayer.AddShape(shapes[y]);
            }
          } 
        }
        // fire finishloading event
        var handler = this.eventHandlers.getHandler("onfinishloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
      });
    
    this.RefreshDataDelegate = Function.createDelegate(this, function (event) {
        if (this.map.GetZoomLevel() < this.provider.GetMinimumZoomLevel()) {
          return;
        }
        var zoom;
        var bounds;
        if (this.map.GetMapStyle() === VEMapStyle.Birdseye) {    
            //set zoomlevel      
            zoom = 19;
            bounds = this.map.GetBirdseyeScene().GetBoundingRectangle();
        } else {
            zoom = this.map.GetZoomLevel();
            bounds = this.map.GetMapView();
        }
        if (this.zoomlevel !== zoom) {
            //clear existing pins
            this.veLayer.DeleteAllShapes();
            this.zoomlevel = zoom;
        }
        // fire beginloading event
        var handler = this.eventHandlers.getHandler("onbeginloading");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        // call webservice
        this.provider.GetRecords(bounds, zoom, this.OnGetDataSucceededDelegate, Utility.OnFailed);
      });
    
    this.map.AttachEvent("onchangeview", this.RefreshDataDelegate);
    
    this.OnPopupSucceededDelegate = Function.createDelegate(this, function (shapeID, title, description, dom) { 
        if (this.currentShape.GetID() === shapeID) {
          if (this.map.GetMapMode() === VEMapMode.Mode3D) {
            //3D mode fails to be able to retrieve the div we placed earlier so resort to setting the title and description only
            this.currentShape.SetTitle(title);
            this.currentShape.SetDescription(description);
          } else {
            var popupDiv = $get(this.popupPrefix + shapeID);
            if (popupDiv === null) {
              // if the data provider returns too quickly, the loading... div won't
              // have been added to the page yet, so we just cram the results into
              // the shape's description
              this.currentShape.SetDescription(dom.innerHTML);
            } else {
              // clear loading and attach the content
              popupDiv.innerHTML = "";
              popupDiv.appendChild(dom);
            }
          }
        }
      });
    
    this.PinHoverDelegate = Function.createDelegate(this, function (e) {
        if (e.elementID) {
          var shape = this.map.GetShapeByID(e.elementID);
          if (this.provider.OwnsShape(shape)) {
            //set current pin
            this.currentShape = shape;
            //while that's happending, show a loading... message
            var divID = this.popupPrefix + this.currentShape.GetID();
            this.currentShape.SetDescription("<div id='" + divID + "'>Loading...</div>");
            this.currentShape.SetTitle("");
            //get the content for the pin.
            this.provider.GetPopup(this.currentShape,
                                   divID,
                                   this.OnPopupSucceededDelegate, 
                                   Utility.OnFailed);
          }
        }
      });
    
    this.map.AttachEvent("onmouseover", this.PinHoverDelegate);
    this.map.AttachEvent("onclick", this.PinHoverDelegate);
    
    this.LoadLayer = function () {
        // get the data for the initial view
        this.RefreshDataDelegate();
      };
  };

AsyncLayer.registerClass('AsyncLayer');


if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }