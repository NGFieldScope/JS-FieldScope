/*global FieldScope Sys Type GEvent GIcon GInfoWindowTab GLatLng GMarker GPoint GSize G_DEFAULT_ICON */

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
        var tab1 = "<div>";
        tab1 += '<table>';
        tab1 += '<tr style="font-weight:bold;font-size:8pt">';
        tab1 += '<td colspan="4">';
        tab1 += 'Current Readings At Buoy: "';
        tab1 += platform.Name;
        tab1 += '"</td>';
        tab1 += '</tr>';
        tab1 += '<tr style="font-weight:bold;font-size:8pt">';
        tab1 += '<td>Measurement</td>';
        tab1 += '<td>Value</td>';
        tab1 += '<td>Units</td>';
        tab1 += '<td>Time</td>';
        tab1 += '</tr>';
        for (var x = 0; x < measurements.length; x += 1) {
          tab1 += '<tr style="font-size:8pt">';
          tab1 += '<td>';
          tab1 += measurements[x].Name;
          tab1 += '</td><td>';
          tab1 += measurements[x].Value;
          tab1 += '</td><td>';
          tab1 += measurements[x].Units;
          tab1 += '</td><td>';
          tab1 += measurements[x].Time.getFullYear();
          tab1 += '-';
          tab1 += measurements[x].Time.getMonth()+1;
          tab1 += '-';
          tab1 += measurements[x].Time.getDate();
          tab1 += ' ';
          tab1 += measurements[x].Time.getHours();
          tab1 += ':';
          if (measurements[x].Time.getMinutes() < 10) {
            tab1 += '0';
          }
          tab1 += measurements[x].Time.getMinutes();
          tab1 += ':';
          if (measurements[x].Time.getSeconds() < 10) {
            tab1 += '0';
          }
          tab1 += measurements[x].Time.getSeconds();
          tab1 += '</td>';
          tab1 += '</tr>';
        }
        tab1 += '</table></div>';
        
        var tab2 = '<div>';
        tab2 +=      '<iframe id="FieldScope.CBIBS.GraphFrame"';
        tab2 +=        ' name="FieldScope.CBIBS.GraphFrame"';
        tab2 +=        ' src="CBIBSGraph.aspx?';
        tab2 +=              'platform='+encodeURIComponent(platform.Id)+'"';
        tab2 +=        ' width="400"';
        tab2 +=        ' height="365"';
        tab2 +=        ' frameborder="0">';
        tab2 +=      '</iframe>';
        tab2 +=     '</div>';
        return [ new GInfoWindowTab("Current", tab1),  new GInfoWindowTab("Graphs", tab2) ];
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
            marker.openInfoWindowTabsHtml(this.CreateInfoWindowHTML(reading.Platform, measurements));
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
    
    this.TriggersRefresh = function (oldState, newState) {
        // refresh every ten minutes
        return (newState.time.milliseconds - oldState.time.milliseconds) > 600000;
      };
  };

FieldScope.CBIBS.GDataProvider.registerClass('FieldScope.CBIBS.GDataProvider', null, FieldScope.GAsyncDataProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }