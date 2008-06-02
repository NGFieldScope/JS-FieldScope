// VEExtras.js: extensions to Virtual Earth

/*global VEShapeLayer, VEShapeType, VEPixel, VEShape, VEColor */
/*global dojo, StringUtils */

Type.registerNamespace("VEExtras");

// ----------------------------------------------------------------------------
// VEDrawingTool.js: basic drawing tools for Virtual Earth
//
// This code is VERY loosely based on the solution at:
// http://www.viavirtualearth.com/Wiki/Drawing-Tool+for+VE+v5.ashx
//

VEExtras.DrawingTool = function (map) {
    this.customIcon = null;
    this.onFinishShape = null;
    
    var drawingLayer = new VEShapeLayer();
    var drawingMode = null;
    var currentPoints = [];
    var tempShape = null;
    var instance = this;
    
    map.AddShapeLayer(drawingLayer);
    
    var replaceTempShape = function (points) {
        if (tempShape !== null) {
          drawingLayer.DeleteShape(tempShape);
          tempShape = null;
        }
        if (points.length === 2) {
          tempShape = new VEShape(VEShapeType.Polyline, points);
        } else if (points.length > 2) {
          tempShape = new VEShape(drawingMode, points);
        }
        if (tempShape !== null) {
          tempShape.SetLineColor(new VEColor(255,0,0,0.5));
          tempShape.HideIcon();
          drawingLayer.AddShape(tempShape);
        }
        document.getElementById(map.ID).style.cursor='crosshair';
      };
    
    var onMouseMove = function (e) {
        var tempPoints = currentPoints.slice(0, currentPoints.length);
        tempPoints.push(map.PixelToLatLong(new VEPixel(e.mapX, e.mapY)));
        replaceTempShape(tempPoints);
        document.getElementById(map.ID).style.cursor='crosshair';
        return true;
      };
    
    var onMouseDoubleClick = function (e) {
        if (((drawingMode === VEShapeType.Polyline) && (currentPoints.length > 1)) ||
            ((drawingMode === VEShapeType.Polygon)  && (currentPoints.length > 2))) {
          var newShape = new VEShape(drawingMode, currentPoints);
          currentPoints = [];
          replaceTempShape(currentPoints);
          newShape.HideIcon();
          drawingLayer.AddShape(newShape);
          if (instance.onFinishShape !== null) {
            instance.onFinishShape(newShape);
          }
          return true;
        }
      };
    
    var onMouseClick = function (e) {
        var mouseLatLon = map.PixelToLatLong(new VEPixel(e.mapX, e.mapY));
        if (drawingMode === VEShapeType.Pushpin) {
          var pushpin = new VEShape(VEShapeType.Pushpin, mouseLatLon);
          if (instance.customIcon) {
            pushpin.SetCustomIcon(instance.customIcon);
          }
          drawingLayer.AddShape(pushpin);
          if (instance.onFinishShape !== null) {
            instance.onFinishShape(pushpin);
          }
          currentPoints = [];
        } else if ((drawingMode === VEShapeType.Polygon) &&
                   (currentPoints.length > 0) &&
                   (currentPoints[currentPoints.length-1].Latitude === mouseLatLon.Latitude) &&
                   (currentPoints[currentPoints.length-1].Longitude === mouseLatLon.Longitude) &&
                   onMouseDoubleClick(e)) {
          // Virtual Earth doesn't reliably capture double-clicks when we're 
          // drawing polygons, so we have to hack it up a little bit here.
          return true;
        } else {
          currentPoints.push(mouseLatLon);
          replaceTempShape(currentPoints);
        }
        return true;
      };
    
    var onKeyDown = function (e) {
        if ((((drawingMode === VEShapeType.Polyline) && (currentPoints.length > 1)) ||
             ((drawingMode === VEShapeType.Polygon)  && (currentPoints.length > 2))) &&
            (e.keyCode === 0x1B)) {
          currentPoints = [];
          replaceTempShape(currentPoints);
          return true;
        }
      };
    
    var onMouseOver = function (e) {
        if (e.elementID !== null) {
          document.getElementById(e.elementID).style.cursor='crosshair';
        }
      };
    
    var onMouseOut = function (e) {
        if (e.elementID !== null) {
          document.getElementById(e.elementID).style.cursor='';
        }
      };
    
    this.getDrawingMode = function () {
        return drawingMode;
      };
    
    this.setDrawingMode = function (newDrawingMode) {
        if (newDrawingMode !== drawingMode) {
          if (newDrawingMode === null) {
            map.DetachEvent("onmousemove", onMouseMove);
            map.DetachEvent("onclick", onMouseClick);
            map.DetachEvent("ondoubleclick", onMouseDoubleClick);
            map.DetachEvent("onkeypress", onKeyDown);
            map.DetachEvent("onmouseover", onMouseOver);
            map.DetachEvent("onmouseout", onMouseOut);
            drawingMode = null;
            currentPoints = [];
            document.getElementById(map.ID).style.cursor = '';
          } else {
            drawingMode = newDrawingMode;
            map.AttachEvent("onmousemove", onMouseMove);
            map.AttachEvent("onclick", onMouseClick);
            map.AttachEvent("ondoubleclick", onMouseDoubleClick);
            map.AttachEvent("onkeypress", onKeyDown);
            map.AttachEvent("onmouseover", onMouseOver);
            map.AttachEvent("onmouseout", onMouseOut);
          }
        }
      };
    
    this.deleteShape = function (shape) {
        drawingLayer.DeleteShape(shape);
      };
  };

VEExtras.DrawingTool.registerClass("VEExtras.DrawingTool");

// ----------------------------------------------------------------------------
// SearchTool: basic place-name search tool for Virtual Earth

VEExtras.SearchTool = function (map, resultsDivID) {
  
    var resultsLayer = new VEShapeLayer();
    map.AddShapeLayer(resultsLayer);
    
    var instance = this;
    var processSearchResults = function (ignore1, ignore2, results) {
        resultsLayer.DeleteAllShapes();
        var resultsDiv = dojo.byId(resultsDivID);
        if (results === null) {
          results = [];
          resultsDiv.appendChild(document.createTextNode("No Results Found"));
        } else {
          var header = document.createElement("p");
          header.className = "header";
          header.appendChild(document.createTextNode("Search Results:"));
          resultsDiv.appendChild(header);
          var onAnchorClick = function () {
              map.SetCenterAndZoom(this.placeLoc, 14);
            };
          for (var i = 0; i < results.length; i += 1) {
            var row = document.createElement("p");
            row.className = "row";
            var nameParts = StringUtils.splitOnce(results[i].Name, ",");
            var myAnchor = document.createElement("a");
            myAnchor.innerText = nameParts[0];
            myAnchor.setAttribute("href", "#");
            myAnchor.setAttribute("name", i);
            myAnchor.placeLoc = results[i].LatLong;
            myAnchor.onclick = onAnchorClick;
            row.appendChild(myAnchor);
            if (nameParts.length > 1) {
              row.appendChild(document.createTextNode("," + nameParts[1]));
            }
            resultsDiv.appendChild(row);
            var shape = new VEShape(VEShapeType.Pushpin, results[i].LatLong);
            shape.SetDescription(results[i].Name);
            resultsLayer.AddShape(shape);
          }
        }
        resultsDiv.style.visibility="visible";
        instance.onFinishSearch(results);
      };
    
    this.onBeginSearch = function (text) { };
    
    this.onFinishSearch = function (results) { };
    
    this.doSearch = function (text) {
        this.clearSearchResults();
        this.onBeginSearch(text);
        map.Find(null, text, null, null, 0, 20, false, false, false, false, processSearchResults);
      };
    
    this.clearSearchResults = function () {
        resultsLayer.DeleteAllShapes();
        var resultsDiv = dojo.byId(resultsDivID);
        for (var i = resultsDiv.childNodes.length - 1; i >= 0; i -= 1) {
          resultsDiv.removeChild(resultsDiv.childNodes[i]);
        }
        resultsDiv.style.visibility="hidden";
      };
  };

VEExtras.SearchTool.registerClass("VEExtras.SearchTool");

// ----------------------------------------------------------------------------
// Add an objectId Property to the VEShape This allows us to link back to the
// feature wherever it is stored
// D.Bouwman - March 3 2008

VEShape.prototype.GetObjectId = function() {
    return this.ObjectId;
  };

VEShape.prototype.SetObjectId = function (objectId) {
    this.ObjectId = objectId;
  };

if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }