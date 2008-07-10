/*global FieldScope WFSService Sys Type $get */
/*global GIcon GSize GPoint */

Type.registerNamespace("FieldScope.WFS");

// ----------------------------------------------------------------------------
// WFS.DataEntryProvider class

FieldScope.WFS.DataEntryProvider = function (layer, url) {
    
    this.layer = layer;
    this.url = url;
    this.geometryName = null;
    this.onFinishLoadingHandler = null;
    
    this.GenerateForm = Function.createDelegate(this, function () {
        var fields = this.layer.provider.description.fields;
        var result = '<div id="FieldScope.WFS.DataEntryDiv">';
        result += 'Enter Student Observation<br>';
        result += '<table>';
        for (var x = 0; x < fields.length; x += 1) {
          if (fields[x].type === "esriFieldTypeGeometry") {
            this.geometryName = fields[x].name;
          } else if ((fields[x].type !== "esriFieldTypeOID") &&
                     (!fields[x].name.startsWith("gml_"))) {
            result += '<tr><td align="right" style="font-weight:bold">';
            result += fields[x].alias;
            result += ':</td><td>';
            result += '<input type="text" id="' + fields[x].name + '" />';
            result += '</td></tr>';
          }
        }
        result += '<tr><td colspan="2" align="right">';
        result += '<input type="button" id="FieldScope.WFS.CancelButton" value="Cancel" style="font-size:9pt" />';
        result += '&nbsp;&nbsp;';
        result += '<input type="button" id="FieldScope.WFS.SaveButton" value="Save" style="font-size:9pt" />';
        result += '</td></tr>';
        result += '</table></div>';
        return result;
      });
    
    this.ActivateForm = Function.createDelegate(this, function (map) {
        $get("FieldScope.WFS.CancelButton").onclick = function () {
            map.closeInfoWindow();
          };
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
                this.layer.provider.description.name,
                this.geometryName,
                { Latitude: point.lat(), Longitude: point.lng() },
                data,
                Function.createDelegate(this, function (result) {
                    this.layer.ReloadLayer();
                  }),
                function (result) {
                    console.error(result);
                  }
              );
          });
      });
    
    this.MarkerIcon = this.layer.provider.icon;
  };

FieldScope.WFS.DataEntryProvider.registerClass('FieldScope.WFS.DataEntryProvider', null, FieldScope.DataEntryProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
