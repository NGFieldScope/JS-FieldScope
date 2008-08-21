/*global FieldScope Sys Type $addHandler $get */
/*global GEvent GIcon GInfoWindowTab GLatLng GMarker GPoint GSize G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.CBIBS");

// ----------------------------------------------------------------------------
// CBIBS.GDataProvider class

FieldScope.CBIBS.FieldNames = {
    concentration_of_chlorophyll_in_sea_water : "Chlorophyll A",
    concentration_of_oxygen_in_sea_water : "Dissolved Oxygen",
    simple_turbidity : "Turbidity",
    sea_water_electrical_conductivity : "Water Conductivity",
    sea_water_salinity : "Water Salinity",
    sea_water_temperature : "Water Temperature",
    air_pressure : "Air Pressure",
    air_temperature : "Air Temperature",
    relative_humidity : "Relative Humidity",
    wind_speed : "Wind Speed"
  };

FieldScope.CBIBS.GDataProvider = function (map, service) {
    
    this.map = map;
    this.service = service;
    this.graphIndex = 0;
    
    this.icon = new GIcon(null, "images/buoy.png");
    this.icon.shadow = "";
    this.icon.iconSize = new GSize(22, 48);
    this.icon.shadowSize = new GSize(1, 1);
    this.icon.iconAnchor = new GPoint(12, 46);
    this.icon.infoWindowAnchor = new GPoint(12, 12);
    this.icon.infoShadowAnchor = new GPoint(22, 22);
    
    this.CreateInfoWindowHTML = function (platform, measurements) {
        var tab1 = "<div>";
        tab1 += '<table cellspacing="3">';
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
          if (FieldScope.CBIBS.FieldNames[measurements[x].Name]) {
            tab1 += '<tr style="font-size:8pt">';
            tab1 += '<td>';
            tab1 += FieldScope.CBIBS.FieldNames[measurements[x].Name];
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
        }
        tab1 += '</table></div>';
        
        var tab2 = '<div>';
        tab2 +=      '<iframe id="FieldScope.CBIBS.GraphFrame"';
        tab2 +=        ' name="FieldScope.CBIBS.GraphFrame"';
        tab2 +=        ' src="CBIBSGraph.aspx';
        tab2 +=              '?platform='+encodeURIComponent(platform.Id);
        tab2 +=              '&name='+encodeURIComponent(platform.Name)+'"';
        tab2 +=        ' width="400"';
        tab2 +=        ' height="365"';
        tab2 +=        ' frameborder="0">';
        tab2 +=      '</iframe>';
        tab2 +=    '</div>';
        return [ new GInfoWindowTab("Current", tab1),  new GInfoWindowTab("Graphs", tab2) ];
      };
    
    this.OnSaveGraphDelegate = Function.createDelegate(this, function (img) {
        if (img && img.src) {
          var table = document.createElement("table");
          table.cellSpacing = 0;
          table.style.height = "258px";
          table.style.border = "1px solid silver";
          table.style.margin = "2px";
          table.style.backgroundColor = "white";
          // HACK: this browser-specific business is necessary because IE's
          // implementation of float:left is broken. Fortunately, so is its 
          // implementation of display:inline (in a good way). Browser 
          // detection code based on 
          // http://www.thefutureoftheweb.com/blog/detect-ie6-in-javascript
          if (false /*@cc_on || true @*/) {
            table.style.display = "inline";
          } else {
            table.style.cssFloat = "left";
          }
          var tbody = document.createElement("tbody");
          var row1 = document.createElement("tr");
          var cell11 = document.createElement("td");
          cell11.rowSpan = 4;
          var timg = document.createElement("img");
          timg.src = img.src;
          cell11.appendChild(timg);
          row1.appendChild(cell11);
          var cell12 = document.createElement("td");
          var closeButton = document.createElement("input");
          closeButton.type = "button";
          closeButton.value = "X";
          closeButton.style.width = "20px";
          closeButton.style.backgroundColor = "silver";
          closeButton.style.color = "gray";
          closeButton.style.textAlign = "center";
          closeButton.style.textDecoration = "none";
          closeButton.style.borderStyle = "none";
          closeButton.onclick = function () {
              table.parentNode.removeChild(table);
            };
          cell12.appendChild(closeButton);
          row1.appendChild(cell12);
          tbody.appendChild(row1);
          var row2 = document.createElement("tr");
          var cell21 = document.createElement("td");
          cell21.style.backgroundColor = "white";
          cell21.innerHTML = "&nbsp;";
          row2.appendChild(cell21);
          tbody.appendChild(row2);
          var row3 = document.createElement("tr");
          var cell31 = document.createElement("td");
          var download = document.createElement("a");
          download.href = "DownloadChartProxy.ashx?query=" + encodeURIComponent(img.src.substring(img.src.indexOf("?")));
          download.style.display = "block";
          download.style.width = "20px";
          download.style.backgroundColor = "silver";
          download.style.color = "gray";
          download.style.textAlign = "center";
          download.style.textDecoration = "none";
          var saveIcon = document.createElement("img");
          saveIcon.alt = "S";
          saveIcon.src = "images/save.gif";
          saveIcon.style.margin = "2px";
          download.appendChild(saveIcon);
          cell31.appendChild(download);
          row3.appendChild(cell31);
          tbody.appendChild(row3);
          var row4 = document.createElement("tr");
          var cell41 = document.createElement("td");
          cell41.style.backgroundColor = "white";
          cell41.height = 200;
          cell41.innerHTML = "&nbsp;";
          row4.appendChild(cell41);
          tbody.appendChild(row4);
          table.appendChild(tbody);
          var pasteboard = $get("FieldScope_Pasteboard");
          FieldScope.DomUtils.show(pasteboard);
          pasteboard.appendChild(table);
        }
      });

    this.OnLoadDelegate = Function.createDelegate(this, function (event) {
        var iframe = $get("FieldScope.CBIBS.GraphFrame");
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) {
          doc = doc.document;
        }
        // CBIBS.aspx contains a button that calls this method
        doc.FieldScopeCBIBSSaveGraph = this.OnSaveGraphDelegate;
      });
    
    this.OnOpenDelegate = Function.createDelegate(this, function () {
        var iframe = $get("FieldScope.CBIBS.GraphFrame");
        $addHandler(iframe, "load", this.OnLoadDelegate);
      });
    
    this.OnClick = function (marker, platform, measurements) {
        GEvent.addListener(marker, "infowindowopen", this.OnOpenDelegate);
        marker.openInfoWindowTabsHtml(this.CreateInfoWindowHTML(platform, measurements));
      };
    
    this.CreateMarker = function (reading) {
        var lat = 0;
        var lng = 0;
        var measurements = [];
        for (var x = 0; x < reading.Measurements.length; x += 1) {
          if (reading.Measurements[x].Name === "latitude") {
            lat = reading.Measurements[x].Value;
          } else if (reading.Measurements[x].Name === "longitude") {
            lng = reading.Measurements[x].Value;
          } else if (reading.Measurements[x].Name) {
            measurements.push(reading.Measurements[x]);
          }
        }
        var marker = new GMarker(new GLatLng(lat, lng), this.icon);
        GEvent.addListener(marker, "click", Function.createDelegate(this, function () {
            this.OnClick(marker, reading.Platform, measurements);
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