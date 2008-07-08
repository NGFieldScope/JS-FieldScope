/*global FieldScope Sys Type $get */
/*global GClientGeocoder GEvent GLatLng GMarker */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// Google Geocoding class

FieldScope.GSearch = function (inMap, inResultsDivId) {
    
    this.map = inMap;
    this.resultsDivId = inResultsDivId;
    this.eventHandlers = new Sys.EventHandlerList();
    this.geocoder = new GClientGeocoder();
    this.overlays = [];
    
    this.AttachEvent = function (evt, handler) {
        if ((evt === "onbeginsearch") || (evt === "onfinishsearch")) {
          this.eventHandlers.addHandler(evt, handler);
        } else {
          throw "Unsupported event: " + evt;
        }
      };
    
    this.DetachEvent = function (evt, handler) {
        this.eventHandlers.removeHandler(evt, handler);
      };
    
    this.DoSearch = function (text) {
        this.ClearSearchResults();
        var handler = this.eventHandlers.getHandler("onbeginsearch");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        this.geocoder.setViewport(this.map.getBounds());
        this.geocoder.getLocations(text, this.SearchCallbackDelegate);
      };
    
    this.MakePlacemark = function (place) {
        var point = new GLatLng(place.Point.coordinates[1],
                                place.Point.coordinates[0]);
        var marker = new GMarker(point);
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        var anchor = document.createElement("a");
        anchor.innerText = place.address;
        anchor.setAttribute("href", 'javascript: void(0)');
        cell.appendChild(anchor);
        row.appendChild(cell);
        var delegate = Function.createDelegate(this, function () {
            this.map.panTo(point);
            row.style.background = "#FFFF00";
            window.setTimeout(function () { row.style.background = ""; }, 750);
          });
        anchor.onclick = delegate;
        GEvent.addListener(marker, "click", delegate);
        return {Row: row, Overlay: marker};
      };
    
    this.SearchCallbackDelegate = Function.createDelegate(this, function (response) {
        var resultsDiv = $get(this.resultsDivId);
        if ((!response) || (response.Status.code !== 200) || (response.Placemark.length === 0)) {
          resultsDiv.innerHTML = "Address not found.";
        } else {
          var heading = document.createElement("p");
          heading.style.fontWeight = "bold";
          heading.style.margin = "0px";
          heading.appendChild(document.createTextNode("Search Results:"));
          resultsDiv.appendChild(heading);
          var table = document.createElement("table");
          table.style.width = "100%";
          table.style.fontSize = "smaller";
          var tbody = document.createElement("tbody");
          for (var y = 0; y < response.Placemark.length; y += 1) {
            var pm = this.MakePlacemark(response.Placemark[y]);
            tbody.appendChild(pm.Row);
            this.overlays.push(pm.Overlay);
          }
          table.appendChild(tbody);
          resultsDiv.appendChild(table);
          for (var z = 0; z < this.overlays.length; z += 1) {
            this.map.addOverlay(this.overlays[z]);
          }
        }
        resultsDiv.style.visibility="visible";
        var handler = this.eventHandlers.getHandler("onfinishsearch");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
      });
    
    this.ClearSearchResults = function () {
        for (var x = 0; x < this.overlays.length; x += 1) {
          this.map.removeOverlay(this.overlays[x]);
        }
        this.overlays = [];
        var resultsDiv = $get(this.resultsDivId);
        resultsDiv.innerHTML = "";
        resultsDiv.style.visibility="hidden";
      };
  };

FieldScope.GSearch.registerClass("FieldScope.GSearch");

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
