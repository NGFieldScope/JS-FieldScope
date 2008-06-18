/*global MetaLens, Sys, Type, Utility, $get, $addHandler */
/*global VELatLong, VEShape, VEShapeType */
/*global AsyncDataProvider */

Type.registerNamespace("MetaLens");

// ----------------------------------------------------------------------------
// Setup additional properties for shapes

VEShape.prototype.AssetIds=[]; //array of point location id's
VEShape.prototype.AssetType="";

// ----------------------------------------------------------------------------
// MetaLens.DataProvider class

MetaLens.DataProvider = function (inService) {
    
    this.service = inService;
    this.currentIndex = 0;
    
    this.GetMinimumZoomLevel = function () { 
        return 3; 
      };
    
    this.GetRecords = function (bounds, width, height, OnSuccess, OnFailure) { 
        this.service.GetPoints(bounds.TopLeftLatLong.Longitude,
                               bounds.BottomRightLatLong.Longitude,
                               bounds.BottomRightLatLong.Latitude,
                               bounds.TopLeftLatLong.Latitude,
                               width,
                               height,
                               OnSuccess, 
                               OnFailure);
      };
    
    this.CreateShapes = function (record) { 
        var loc = new VELatLong(record.Latitude, record.Longitude);
        //Create the shape
        var newShape = new VEShape(VEShapeType.Pushpin, loc);
        newShape.AssetType = "asset";
        newShape.AssetIds = record.AssetIds;
        //Default Pin popup information  
        newShape.SetTitle("MetaLens Point");
        newShape.SetDescription("fetching data...");   
        //set custom png pin, IE6 will require a PNG fix.
        var pinClass = 'pin';
        if (record.AssetIds.length > 1) {
            pinClass = pinClass + '-cl';
        }
        if ((Sys.Browser.agent === Sys.Browser.InternetExplorer) && (Sys.Browser.version === 6)) {
            newShape.SetCustomIcon("<div class='" + pinClass + "IE6'></div>");
        } else {  
            newShape.SetCustomIcon("<div class='" + pinClass + "'></div>");                
        }                
        return [newShape];
      };
    
    this.OwnsShape = function (shape) { 
        return shape.AssetType === "asset";
      };
    
    this.GetPopup = function (shape, divID, OnSuccess, OnFailure) { 
        //set current pin               
        this.currentIndex = 0;
        //get the content for the pin.
        this.service.GetDescription(shape.AssetIds[this.currentIndex],
                                    Function.createDelegate(this, function (result, shapeID) { 
                                        this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                      }),
                                    OnFailure, 
                                    shape.GetID());
      };
    
    this.PreviousRecord = function (evt, shape, divID, OnSuccess) {
        this.currentIndex -= 1;
        $get(divID).innerHTML = "Loading...";
        this.service.GetDescription(shape.AssetIds[this.currentIndex],
                                    Function.createDelegate(this, function (result, shapeID) { 
                                        this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                      }),
                                    Utility.OnFailed, 
                                    shape.GetID());
      };
    
    this.NextRecord = function (evt, shape, divID, OnSuccess) {
        this.currentIndex += 1;
        $get(divID).innerHTML = "Loading...";
        this.service.GetDescription(shape.AssetIds[this.currentIndex],
                                    Function.createDelegate(this, function (result, shapeID) { 
                                        this.OnContentSucceededDelegate(result, shape, divID, OnSuccess);
                                      }),
                                    Utility.OnFailed, 
                                    shape.GetID());
      };
    
    this.OnContentSucceededDelegate = function (result, shape, divID, OnSuccess) {
        //create the content element
        var el = document.createElement("div");
        var header = document.createElement("h2");
        header.appendChild(document.createTextNode(result.Caption));
        el.appendChild(header);
        var img = document.createElement("img");
        img.src = "http://focus.metalens.org/assets/"+result.Id+"/proxy/lores.cpx";
        img.alt = result.Name;
        el.appendChild(img);
        var desc = document.createElement("p");
        desc.className = "desc";
        desc.appendChild(document.createTextNode(result.Description));
        el.appendChild(desc);
        var coords = document.createElement("p");
        coords.className = "coords";
        coords.appendChild(document.createTextNode("Lat: " + result.Latitude + " Lon: " + result.Longitude));
        el.appendChild(coords);
        el.appendChild(document.createElement("br"));
        var credit = document.createElement("p");
        credit.className = "credit";
        credit.appendChild(document.createTextNode(result.Copyright));
        el.appendChild(credit);
        var clear = document.createElement("div");
        clear.style.clear = "both";
        el.appendChild(clear);
        // Add the NEXT / PREV buttons if this pin represents multiple data points
        if (shape.AssetIds.length > 1) {
          var prevButton = document.createElement("div");
          prevButton.appendChild(document.createTextNode("Previous"));
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
          nextButton.appendChild(document.createTextNode("Next"));
          el.appendChild(nextButton);  
          Sys.UI.DomElement.addCssClass(nextButton, "ActionButton");
          if (this.currentIndex < (shape.AssetIds.length - 1)) {  
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