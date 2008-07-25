/*global FieldScope WFSService Sys Type $get */
/*global GEvent GIcon GMarker GSize GPoint */

Type.registerNamespace("FieldScope.WFS");

// ----------------------------------------------------------------------------
// WFS.MouseMode class

FieldScope.WFS.MouseMode = function (layer, url, entryName) {
    
    this.layer = layer;
    this.icon = layer.provider.icon;
    this.url = url;
    this.entryName = entryName;
    this.geometryName = null;
    this.marker = null;
    this.onClickListener = null;
    this.onFinishLoadingHandler = null;
    
    this.GenerateForm = Function.createDelegate(this, function (marker) {
        var fields = this.layer.provider.description.fields;
        var result = '<div id="FieldScope.WFS.DataEntryDiv">';
        result += 'Enter Student Observation<br>';
        result += '<table>';
        for (var x = 0; x < fields.length; x += 1) {
          if (fields[x].type === "esriFieldTypeGeometry") {
            this.geometryName = fields[x].name;
          } else {
            result += '<tr><td align="right" style="font-weight:bold">';
            result += fields[x].alias;
            result += ':</td><td>';
            result += '<input type="text" id="' + fields[x].name + '" />';
            result += '</td></tr>';
          }
        }
        result += '<tr><td colspan="2" align="right">';
        result += '<input type="button" id="FieldScope.WFS.SaveButton" value="Save" style="font-size:9pt" />';
        result += '</td></tr>';
        result += '</table></div>';
        return result;
      });
    
    this.WireForm = Function.createDelegate(this, function (map) {
        $get("FieldScope.WFS.SaveButton").onclick = Function.createDelegate(this, function () {
            //alert("saving!");
            var point = map.getInfoWindow().getPoint();
            var fields = this.layer.provider.description.fields;
            var data = { };
            for (var x = 0; x < fields.length; x += 1) {
              var element = $get(fields[x].name);
              if (element) {
                data[fields[x].name] = element.value;
              }
            }
            this.onFinishLoadingHandler = Function.createDelegate(this, function (event) {
                map.closeInfoWindow();
                this.layer.DetachEvent("onfinishloading", this.onFinishLoadingHandler);
                this.onFinishLoadingHandler = null;
              });
            this.layer.AttachEvent("onfinishloading", this.onFinishLoadingHandler);
            this.layer.SetVisible(true);
            $get("FieldScope.WFS.DataEntryDiv").innerHTML = '<img src="images/loading24.gif" />Saving...';
            WFSService.InsertPoint(
                this.url, 
                this.entryName,
                this.geometryName,
                { Latitude: point.lat(), Longitude: point.lng() },
                data,
                Function.createDelegate(this, function (result) {
                    console.log("result: " + result);
                    this.layer.ReloadLayer();
                  }),
                function (result) {
                    console.error(result);
                  }
              );
          });
      });
    
    this.Activate = function (map) {
        map.disableDragging();
        this.onClickListener = GEvent.addListener(map, "click", Function.createDelegate(this, function (overlay, loc, overlayLoc) {
            loc = loc || overlayLoc;
            if (loc && (this.marker === null)) {
              this.marker = new GMarker(loc, this.icon);
              map.addOverlay(this.marker);
              GEvent.addListener(this.marker, "infowindowclose", Function.createDelegate(this, function () {
                  map.removeOverlay(this.marker);
                  this.marker = null;
                }));
              GEvent.addListener(this.marker, "infowindowopen", Function.createDelegate(this, function () {
                  this.WireForm(map);
                }));
              this.marker.openInfoWindowHtml(this.GenerateForm());
            }
          }));
      };
    
    this.Deactivate = function (map) {
        if (this.onClickListener) {
          GEvent.removeListener(this.onClickListener);
          this.onClickListener = null;
        }
        if (this.marker) {
          map.removeOverlay(this.marker);
          this.marker = null;
        }
      };
    
    this.GetName = function () { 
        return "Place Observation";
      };
    
    this.GetId = function () { 
        return "FieldScope.Tool[observations]";
      };
    
    this.GetIconCssClass = function () {
        return "addObservationIcon";
      };
  };

FieldScope.WFS.MouseMode.registerClass('FieldScope.WFS.MouseMode', null, FieldScope.MouseMode);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
