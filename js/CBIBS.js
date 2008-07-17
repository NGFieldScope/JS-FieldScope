/*global FieldScope Sys Type GIcon GLatLng GMarker GPoint GSize G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.CBIBS");

// ----------------------------------------------------------------------------
// CBIBS.GDataProvider class

FieldScope.CBIBS.GDataProvider = function (map, service) {
    
    this.map = map;
    this.service = service;
    
    this.icon = new GIcon(null, "images/buoy.png");
    this.icon.shadow = "";
    this.icon.iconSize = new GSize(22, 48);
    this.icon.shadowSize = new GSize(1, 1);
    this.icon.iconAnchor = new GPoint(12, 46);
    this.icon.infoWindowAnchor = new GPoint(12, 12);
    this.icon.infoShadowAnchor = new GPoint(22, 22);
    
    this.CreateInfoWindowHTML = function (platform, measurements) {
        var result = "<div>";
        result += '<table>';
        result += '<tr style="font-weight:bold;font-size:8pt">';
        result += '<td colspan="4">';
        result += 'Current Readings At Buoy: "';
        result += platform.Name;
        result += '"</td>';
        result += '</tr>';
        result += '<tr style="font-weight:bold;font-size:8pt">';
        result += '<td>Measurement</td>';
        result += '<td>Value</td>';
        result += '<td>Units</td>';
        result += '<td>Time</td>';
        result += '</tr>';
        for (var x = 0; x < measurements.length; x += 1) {
          result += '<tr style="font-size:8pt">';
          result += '<td>';
          result += measurements[x].Name;
          result += '</td><td>';
          result += measurements[x].Value;
          result += '</td><td>';
          result += measurements[x].Units;
          result += '</td><td>';
          result += measurements[x].Time.getFullYear();
          result += '-';
          result += measurements[x].Time.getMonth()+1;
          result += '-';
          result += measurements[x].Time.getDate();
          result += ' '
          result += measurements[x].Time.getHours();
          result += ':'
          if (measurements[x].Time.getMinutes() < 10) {
            result += '0';
          }
          result += measurements[x].Time.getMinutes();
          result += ':'
          if (measurements[x].Time.getSeconds() < 10) {
            result += '0';
          }
          result += measurements[x].Time.getSeconds();
          result += '</td>';
          result += '</tr>';
        }
        result += '</table></div>';
        return result;
      };
    
    this.CreateMarker = function (reading) {
        var lat = 0;
        var lng = 0;
        var measurements = [];
        for (var x = 0; x < reading.Measurements.length; x += 1) {
          if (reading.Measurements[x].Name === "latitude") {
            lat = reading.Measurements[x].Value;
          } else if (reading.Measurements[x].Name === "longitude") {
            lng = -reading.Measurements[x].Value;
          } else {
            measurements.push(reading.Measurements[x]);
          }
        }
        var marker = new GMarker(new GLatLng(lat, lng), this.icon);
        //marker.CBIBSMeasurements = measurements;
        GEvent.addListener(marker, "click", Function.createDelegate(this, function () {
            marker.openInfoWindow(this.CreateInfoWindowHTML(reading.Platform, measurements));
          }));
        return marker;
      };
    
    this.QuerySuccessCallback = function (measurements, callback) {
        var overlays = [];
        var marker;
        for (var x = 0; x < measurements.length; x += 1) {
          marker = this.CreateMarker(measurements[x]);
          this.map.addOverlay(marker);
          overlays.push(marker);
        }
        callback.call(this, overlays);
      };
    
    
    this.AddOverlays = function (bounds, size, OnSuccess, OnFailure) { 
        this.service.GetAllCurrentReadings(Function.createDelegate(this, function (measurements) {
                                               this.QuerySuccessCallback(measurements, OnSuccess);
                                             }),
                                           OnFailure);
      };
  };

FieldScope.CBIBS.GDataProvider.registerClass('FieldScope.CBIBS.GDataProvider', null, FieldScope.GAsyncDataProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }