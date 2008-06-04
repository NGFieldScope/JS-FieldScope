/*global MetaLens, Sys, Type, Utility, $get, $addHandler */
/*global VELatLong, VEMapStyle, VEMapMode, VEShape, VEShapeLayer, VEShapeType */

Type.registerNamespace("MetaLens");

// ----------------------------------------------------------------------------
// Setup additional properties for shapes

VEShape.prototype.Bounds = ""; //bounds of the clustering
VEShape.prototype.ObjectId = ""; //SDE objectId of the point
VEShape.prototype.PointLocationIds=[]; //array of point location id's
VEShape.prototype.GAINSType="";

// ----------------------------------------------------------------------------
// MetaLens.Layer class

MetaLens.Layer = function (inMap, inService) {
            
    this.map = inMap;
    this.service = inService;
    this.samplePointLayer= new VEShapeLayer(); 
    this.map.AddShapeLayer(this.samplePointLayer); 
    this.flywayLayer = new VEShapeLayer();      
    this.map.AddShapeLayer(this.flywayLayer);
    this.currentPin = null;        //Cureent PushPin 
    this.currentIndex = 0;         //Supporting clustering, this is the index of the current item in the cluster
    this.popupPrefix = "POPUP";    //Popup element Id Prefix
    
    
    this.isVisible = function () { 
        return this.samplePointLayer.IsVisible() && this.flywayLayer.IsVisible();
      };
    
    this.setVisible = function (newVisible) {
        if (newVisible) {
          this.samplePointLayer.Show();
          this.flywayLayer.Show();
        } else {
          this.samplePointLayer.Hide();
          this.flywayLayer.Hide();
        }
      };
    
    this.OnMapDataSucceededDelegate = Function.createDelegate(this, function (gainsPoints) {
        if (gainsPoints !== null) {
          var newShapes = [];
          //clear existing pins
          this.samplePointLayer.DeleteAllShapes();
          //add new pins
          for (var x = 0; x < gainsPoints.length; x += 1) {
            var gainsPoint = gainsPoints[x];
            var loc = new VELatLong(gainsPoint.Location.Lat, gainsPoint.Location.Lon);
            //Create the shape
            var newShape = new VEShape(VEShapeType.Pushpin, loc);
            newShape.GAINSType = "gainsPoint";
            newShape.Bounds = gainsPoint.ClusterArea; 
            newShape.PointLocationIds = gainsPoint.ClusteredPointLocationIds; 
            //Default Pin popup information  
            newShape.SetTitle("Point: " + gainsPoint.PointLocationId);
            newShape.SetDescription("fetching data...");   
            //set custom png pin, IE6 will require a PNG fix.
            var pinClass = 'pin';
            if (gainsPoint.IsClustered === true) {
                pinClass = pinClass + '-cl';
            }
            if (Sys.Browser.agent==Sys.Browser.InternetExplorer&&Sys.Browser.version==6){
                newShape.SetCustomIcon("<div class='" + pinClass + "IE6'></div>");
            } else {  
                newShape.SetCustomIcon("<div class='" + pinClass + "'></div>");                
            }                
            newShapes.push(newShape);       
          }                 
          this.samplePointLayer.AddShape(newShapes);  
        }            
      });
    
    this.GetPinDataDelegate = Function.createDelegate(this, function (event) {
        if (this.map.GetZoomLevel() < 3) {
          return;
        }
        var points = [];
        var zoom;
        var bboxString;
        if (this.map.GetMapStyle() == VEMapStyle.Birdseye) {    
            //set zoomlevel      
            zoom = 19;
            var be = this.map.GetBirdseyeScene();
            var rect = be.GetBoundingRectangle();                
            bboxString = rect.TopLeftLatLong.Latitude + ' ' + rect.TopLeftLatLong.Longitude + ',' + rect.BottomRightLatLong.Latitude + ' ' + rect.BottomRightLatLong.Longitude;              
        }
        else {
            var view = this.map.GetMapView();
            bboxString = view.TopLeftLatLong.Latitude + ' ' + view.TopLeftLatLong.Longitude + ',' + view.BottomRightLatLong.Latitude + ' ' + view.BottomRightLatLong.Longitude;              
            //get zoomlevel
            zoom = this.map.GetZoomLevel();
        }
        //var bounds = Utility.createEncodings(points);
        if (this.zoomlevel != zoom) {
            //clear existing pins
            this.samplePointLayer.DeleteAllShapes();
            this.zoomlevel = zoom;
        }
        //call webservice
        this.service.GetPoints(bboxString, zoom, this.OnMapDataSucceededDelegate, Utility.OnFailed);
      });
    
    this.map.AttachEvent("onchangeview", this.GetPinDataDelegate);
    
    this.PreviousRecordDelegate = Function.createDelegate(this, function (evt) {
        this.currentIndex -= 1;
        $get(this.popupPrefix + this.currentPin.GetID()).innerHTML = "Loading...";
        this.service.GetPointPopup(this.currentPin.PointLocationIds[this.currentIndex],
                                   this.OnContentSucceededDelegate, 
                                   Utility.OnFailed, 
                                   this.currentPin.GetID());
      });
    
    this.NextRecordDelegate = Function.createDelegate(this, function (evt) {
        this.currentIndex += 1;
        $get(this.popupPrefix + this.currentPin.GetID()).innerHTML = "Loading...";
        this.service.GetPointPopup(this.currentPin.PointLocationIds[this.currentIndex],
                                   this.OnContentSucceededDelegate, 
                                   Utility.OnFailed, 
                                   this.currentPin.GetID());
      });
    
    this.OnContentSucceededDelegate = Function.createDelegate(this, function (result, ID) { 
        if (ID === this.currentPin.GetID()) {
          if (this.map.GetMapMode() === VEMapMode.Mode3D) {
            //3D mode fails to be able to retrieve the div we placed earlier so resort to setting the title and description only
            this.currentPin.SetTitle(result.Title);
            this.currentPin.SetDescription(result.Details);
          } else {
            //create the content element
            var el = document.createElement("div");
            //console.log(result.Html);
            el.innerHTML = result.Html;
            //clear loading and attach the content
            $get(this.popupPrefix + ID).innerHTML = "";
            $get(this.popupPrefix + ID).appendChild(el);
            // Add the NEXT / PREV buttons if this pin represents multiple data points
            if (this.currentPin.PointLocationIds.length > 1) {
              var prevButton = document.createElement("div");
              prevButton.innerHTML = "Previous";
              el.appendChild(prevButton);
              Sys.UI.DomElement.addCssClass(prevButton, "ActionButton");
              if (this.currentIndex > 0) {  
                $addHandler(prevButton,"click",this.PreviousRecordDelegate);      
              } else {
                Sys.UI.DomElement.addCssClass(prevButton, "ButtonDisabled");
              }
              var nextButton = document.createElement("div");
              nextButton.innerHTML = "Next";
              el.appendChild(nextButton);  
              Sys.UI.DomElement.addCssClass(nextButton, "ActionButton");
              if (this.currentIndex < (this.currentPin.PointLocationIds.length - 1)) {  
                $addHandler(nextButton,"click",this.NextRecordDelegate);                         
              } else {
                Sys.UI.DomElement.addCssClass(nextButton, "ButtonDisabled");
              }
            }
          }
        }
      });
    
    this.PinHoverDelegate = Function.createDelegate(this, function (e) {
        if (e.elementID) {
          var popupShape = this.map.GetShapeByID(e.elementID);
          if (popupShape) {
            if (popupShape.GAINSType == "gainsPoint") {
              //set current pin
              this.currentPin = popupShape;                
              this.currentIndex = 0;
              //get the content for the pin.
              this.service.GetPointPopup(this.currentPin.PointLocationIds[this.currentIndex],
                                         this.OnContentSucceededDelegate, 
                                         Utility.OnFailed, 
                                         this.currentPin.GetID());
              //while that's happending, show a loading... message
              this.currentPin.SetDescription("<div id='" + this.popupPrefix + this.currentPin.GetID() + "'>Loading...</div>");
              this.currentPin.SetTitle("");
            }
          }
        }
      });
    
    this.map.AttachEvent("onmouseover", this.PinHoverDelegate);
    this.map.AttachEvent("onclick", this.PinHoverDelegate);
    
    //get the data for the default view
    this.GetPinDataDelegate();
  };

MetaLens.Layer.registerClass('MetaLens.Layer');

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }