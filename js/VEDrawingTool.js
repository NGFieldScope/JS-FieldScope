/*

VEDrawingTool.js: basic drawing tools for Virtual Earth

This code is VERY loosely based on the solution at:
http://www.viavirtualearth.com/Wiki/Drawing-Tool+for+VE+v5.ashx

*/

/*global VEShapeLayer, VEShapeType, VEPixel, VEShape, VEColor */

function VEDrawingTool (map) {
  
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
}
