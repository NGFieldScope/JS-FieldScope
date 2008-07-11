/*global FieldScope Sys Type $get */
/*global GClientGeocoder GEvent GLatLng GMarker */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// Google Geocoding class

FieldScope.GSearch = function (inMap, setResultsCallback) {
    
    this.map = inMap;
    this.SetResults = setResultsCallback;
    this.eventHandlers = new Sys.EventHandlerList();
    this.geocoder = new GClientGeocoder();
    this.overlays = [];
    
    this.AttachEvent = Function.createDelegate(this, function (evt, handler) {
        if ((evt === "onbeginsearch") || (evt === "onfinishsearch")) {
          this.eventHandlers.addHandler(evt, handler);
        } else {
          throw "Unsupported event: " + evt;
        }
      });
    
    this.DetachEvent = Function.createDelegate(this, function (evt, handler) {
        this.eventHandlers.removeHandler(evt, handler);
      });
    
    this.DoSearch = Function.createDelegate(this, function (text) {
        this.ClearSearchResults();
        var handler = this.eventHandlers.getHandler("onbeginsearch");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        this.geocoder.setViewport(this.map.getBounds());
        this.geocoder.getLocations(text, this.SearchCallbackDelegate);
      });
    
    this.MakePlacemark = function (place) {
        var point = new GLatLng(place.Point.coordinates[1],
                                place.Point.coordinates[0]);
        var marker = new GMarker(point);
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        var anchor = document.createElement("a");
        anchor.setAttribute("href", 'javascript: void(0)');
        anchor.appendChild(document.createTextNode(place.address));
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
        var handler = this.eventHandlers.getHandler("onfinishsearch");
        if (handler) { handler.call(this, Sys.EventArgs.Empty); }
        var result = document.createElement("div");
        if ((!response) || (response.Status.code !== 200) || (response.Placemark.length === 0)) {
          result.innerHTML = "Address not found.";
        } else {
          var heading = document.createElement("p");
          heading.style.fontWeight = "bold";
          heading.style.margin = "0px";
          heading.appendChild(document.createTextNode("Search Results:"));
          result.appendChild(heading);
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
          result.appendChild(table);
          for (var z = 0; z < this.overlays.length; z += 1) {
            this.map.addOverlay(this.overlays[z]);
          }
        }
        this.SetResults(result);
      });
    
    this.ClearSearchResults = Function.createDelegate(this, function () {
        for (var x = 0; x < this.overlays.length; x += 1) {
          this.map.removeOverlay(this.overlays[x]);
        }
        this.overlays = [];
        this.SetResults(null);
      });
  };

FieldScope.GSearch.registerClass("FieldScope.GSearch");

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }