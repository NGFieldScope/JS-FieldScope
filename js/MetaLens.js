/*global FieldScope Sys Type StringUtils $get */
/*global GIcon GSize GPoint GMarker GLatLng GEvent G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.MetaLens");

// ----------------------------------------------------------------------------
// MetaLens.GDataProvider class

FieldScope.MetaLens.GDataProvider = function (inMap, inService) {
    
    this.IsClustered = true;
    this.map = inMap;
    this.service = inService;
    this.marker = null;
    this.icon = new GIcon(null, "images/pin.png");
    this.icon.shadow = "images/pin-shadow.png";
    this.icon.iconSize = new GSize(11, 16);
    this.icon.shadowSize = new GSize(23, 16);
    this.icon.iconAnchor = new GPoint(5, 7);
    this.icon.infoWindowAnchor = new GPoint(5, 0);
    this.icon.infoShadowAnchor = new GPoint(11, 8);
    this.icon_cl = new GIcon(this.icon, "images/pin-cl.png");
    this.loadingHTML = '<img src="images/loading24.gif" />Loading...';
    
    function OnFailure (error) {
      console.log(error);
    }
    
    this.UpdateInfoWindow = function (html) {
        var parent = $get("custom_info_window_red_contents");
        if (parent) {
          parent.innerHTML = html;
          var thumbnail = $get("FieldScope.MetaLens.Media");
          if (thumbnail) {
            var resizeListener = GEvent.addDomListener(thumbnail, "load", Function.createDelegate(this, function (e) {
                // Run this once and then remove the listener, or
                // you'll end up in an infinite loop on IE6.
                this.map.getExtInfoWindow().resize();
                GEvent.removeListener(resizeListener);
              }));
          }
          var prevButton = $get("FieldScope.MetaLens.PrevButton");
          if (prevButton) {
            prevButton.onclick = Function.createDelegate(this, function () {
                this.ChangeAsset(-1);
              });
          } 
          var nextButton = $get("FieldScope.MetaLens.NextButton");
          if (nextButton) {
            nextButton.onclick = Function.createDelegate(this, function () {
                this.ChangeAsset(+1);
              });
          }
        }
      };
    
    this.ChangeAsset = function (offset) {
        this.marker.MetaLensAssetIndex += offset;
        this.LoadInfoWindow(this.marker, this.UpdateInfoWindowDelegate);
      };
    
    this.OnGetDescriptonSuccessDelegate = Function.createDelegate(this, function (result) {
        this.UpdateInfoWindow(this.CreateInfoWindowHTML(result));
      });
    
    this.LoadInfoWindow = function (marker) {
        this.marker = marker;
        this.service.GetDescription(marker.MetaLensAssetIds[marker.MetaLensAssetIndex],
                                    this.OnGetDescriptonSuccessDelegate,
                                    OnFailure);
      };
    
    this.CreateInfoWindowHTML = function (data) {
        var result = "<div>";
        if (data.Caption !== null) {
          result += '<div class="title" style="font-size:10pt">';
          result += data.Caption;
          result += '</div>';
        }
        result += '<table style="width:100%"><tr><td>';
        if (data.Type === "image") {
          var assetId = StringUtils.padLeft(data.Id, 32, "0");
          result += '<img id="FieldScope.MetaLens.Media" src="http://focus.metalens.org/assets/'+assetId+'/thumb/large.cpx">';
        } else if (data.Type === "audio") {
          
          //TODO: use media player
          result += '<div id="FieldScope.MetaLens.Media"></div>';
          
        } else if (data.Type === "video") {
        
          //TODO: use media player
          result += '<div id="FieldScope.MetaLens.Media"></div>';
        
        }
        result += '</td><td style="vertical-align:top;width:100%"><div style="font-size:8pt;max-height:150px;overflow:auto">';
        if (data.Description !== null) {
          result += data.Description;
        }
        result += '</td></tr>';
        if (data.Copyright !== null) {
          result += '<tr><td colspan="2"><div style="font-size:7pt;font-weight:bold">';
          result += data.Copyright;
          result += '</div></td></tr>';
        }
        if (this.marker.MetaLensAssetIds.length > 1) {
          result += '<tr>';
          result += '<td align="left"><input type="button" id="FieldScope.MetaLens.PrevButton" value="&lt;- Previous" style="font-size:8pt"';
          if (this.marker.MetaLensAssetIndex === 0) {
            result += ' disabled="disabled"';
          }
          result += ' /></td>';
          result += '<td align="right"><input type="button" id="FieldScope.MetaLens.NextButton" value="Next -&gt;" style="font-size:8pt"';
          if (this.marker.MetaLensAssetIndex === (this.marker.MetaLensAssetIds.length - 1)) {
            result += ' disabled="disabled"';
          }
          result += ' /></td>';
          result += '</tr>';
        }
        result += '</table></div>';
        return result;
      };
    
    this.MakeMarker = function (record) {
        var icon = this.icon;
        if (record.AssetIds.length > 1) {
          icon = this.icon_cl;
        }
        var marker = new GMarker(new GLatLng(record.Latitude, record.Longitude), icon);
        marker.MetaLensAssetIds = record.AssetIds;
        marker.MetaLensAssetIndex = 0;
        GEvent.addListener(marker, "click", Function.createDelegate(this, function () {
            marker.openExtInfoWindow(
                this.map, 
                "custom_info_window_red", 
                this.loadingHTML,
                {beakOffset: 3, paddingX: 10, paddingY: 10}
              );
            this.LoadInfoWindow(marker);
          }));
        return marker;
      };
    
    this.QuerySuccessCallback = function (records, callback) {
        var overlays = [];
        for (var x = 0; x < records.length; x += 1) {
          overlays.push(this.MakeMarker(records[x]));
        }
        callback.call(this, overlays);
      };
    
    this.GetOverlays = function (bounds, size, OnSuccess, OnFailure) { 
        this.service.GetPoints(bounds.getSouthWest().lng(),
                               bounds.getNorthEast().lng(),
                               bounds.getSouthWest().lat(),
                               bounds.getNorthEast().lat(),
                               size.width,
                               size.height,
                               Function.createDelegate(this, function (records) {
                                   this.QuerySuccessCallback(records, OnSuccess);
                                 }),
                               OnFailure);
      };
    
    GEvent.addDomListener(this.map, "extinfowindowclose", Function.createDelegate(this, function() {
        this.marker = null;
      }));
  };

FieldScope.MetaLens.GDataProvider.registerClass('FieldScope.MetaLens.GDataProvider', null, FieldScope.GAsyncDataProvider);

// ----------------------------------------------------------------------------
// MetaLens.DataEntryProvider class


FieldScope.MetaLens.DataEntryProvider = function (layer) {
    
    this.layer = layer;
    
    this.GenerateForm = Function.createDelegate(this, function () {
        var result = '<div id="FieldScope.MetaLens.DataEntryDiv">';
        result += 'Upload Photo To MetaLens:<br>';
        result += '<table>';
        result += '<tr><td>';
        result += '<input type="file" accept="image/jpeg" />';
        result += '</td></tr>';
        result += '<tr align="right"><td>';
        result += '<input type="button" id="FieldScope.MetaLens.CancelButton" value="Cancel" style="font-size:9pt" />';
        result += '</td></tr>';
        result += '</table></div>';
        return result;
      });
    
    this.ActivateForm = Function.createDelegate(this, function (map) {
        $get("FieldScope.MetaLens.CancelButton").onclick = function () {
            map.closeInfoWindow();
          };
      });
    
    this.MarkerIcon = new GIcon(null, "images/pin.png");
    this.MarkerIcon.shadow = "images/pin-shadow.png";
    this.MarkerIcon.iconSize = new GSize(11, 16);
    this.MarkerIcon.shadowSize = new GSize(23, 16);
    this.MarkerIcon.iconAnchor = new GPoint(5, 7);
    this.MarkerIcon.infoWindowAnchor = new GPoint(5, 0);
    this.MarkerIcon.infoShadowAnchor = new GPoint(11, 8);
  };

FieldScope.MetaLens.DataEntryProvider.registerClass('FieldScope.MetaLens.DataEntryProvider', null, FieldScope.DataEntryProvider);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
