/*global FieldScope Sys Type $get $addHandler $removeHandler */
/*global GIcon GSize GPoint GMarker GLatLng GEvent G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.MetaLens");


// ----------------------------------------------------------------------------
// MetaLens icons

FieldScope.MetaLens.icon = new GIcon(null, "images/pin.png");
FieldScope.MetaLens.icon.shadow = "images/pin-shadow.png";
FieldScope.MetaLens.icon.iconSize = new GSize(11, 16);
FieldScope.MetaLens.icon.shadowSize = new GSize(23, 16);
FieldScope.MetaLens.icon.iconAnchor = new GPoint(5, 7);
FieldScope.MetaLens.icon.infoWindowAnchor = new GPoint(5, 0);
FieldScope.MetaLens.icon.infoShadowAnchor = new GPoint(11, 8);

FieldScope.MetaLens.icon_cl = new GIcon(FieldScope.MetaLens.icon, "images/pin-cl.png");

// ----------------------------------------------------------------------------
// MetaLens.GDataProvider class

FieldScope.MetaLens.GDataProvider = function (inMap, inUrl, inService) {
    
    this.map = inMap;
    this.service = inService;
    this.url = inUrl;
    this.marker = null;
    this.thumbnail = null;
    this.loadingHTML = '<img src="images/loading24.gif" />Loading...';
    
    function OnFailure (error) {
      console.error(error);
    }
    
    this.OnLoadDelegate = Function.createDelegate(this, function (e) {
        var infoWindow = this.map.getExtInfoWindow();
        // Force Safari to layout the page before we try to resize 
        // the window. Safari normally fires the load event before
        // images are loaded, but it won't be able to tell us the
        // offset width until our image is finished loading. See
        // http://ajaxian.com/archives/safari-3-onload-firing-and-bad-timing and
        // http://www.howtocreate.co.uk/safaribenchmarks.html
        var dummy = document.body.offsetWidth;
        // resize the info window, now that we know how big the image is
        infoWindow.resize();
        // Run this once and then remove the listener, or
        // you'll end up in an infinite loop on IE6.
        if (this.thumbnail) {
          $removeHandler(this.thumbnail, "load", this.OnLoadDelegate);
          this.thumbnail = null;
        }
      });
    
    this.OnClickPreviousDelegate = Function.createDelegate(this, function () {
        this.ChangeAsset(-1);
      });
    
    this.OnClickNextDelegate = Function.createDelegate(this, function () {
        this.ChangeAsset(1);
      });
    
    this.ChangeAsset = function (offset) {
        this.marker.MetaLensAssetIndex += offset;
        this.LoadInfoWindow(this.marker);
      };
    
    this.UpdateInfoWindow = function (html) {
        var parent = $get("fieldscope_metalens_window_contents");
        if (parent) {
          parent.innerHTML = html;
          var thumbnail = $get("FieldScope.MetaLens.Media");
          if (thumbnail) {
            this.thumbnail = thumbnail;
            $addHandler(this.thumbnail, "load", this.OnLoadDelegate);
          }
          var prevButton = $get("FieldScope.MetaLens.PrevButton");
          if (prevButton) {
            $addHandler(prevButton, "click", this.OnClickPreviousDelegate);
          } 
          var nextButton = $get("FieldScope.MetaLens.NextButton");
          if (nextButton) {
            $addHandler(nextButton, "click", this.OnClickNextDelegate);
          }
        }
      };
    
    this.OnGetDescriptonSuccessDelegate = Function.createDelegate(this, function (result) {
        this.UpdateInfoWindow(this.CreateInfoWindowHTML(result));
      });
    
    this.LoadInfoWindow = function (marker) {
        this.marker = marker;
        this.service.GetDescription(this.url,
                                    marker.MetaLensAssetIds[marker.MetaLensAssetIndex],
                                    this.OnGetDescriptonSuccessDelegate,
                                    OnFailure);
      };
    
    this.CreateInfoWindowHTML = function (data) {
        var assetId = FieldScope.StringUtils.padLeft(data.Id, 32, "0");
        var result = "<div>";
        if (data.Caption !== null) {
          result += '<div class="title" style="font-size:10pt">';
          result += data.Caption;
          result += '</div>';
        }
        result += '<table style="width:100%"><tr><td>';
        
        result += '<a href="MetaLensDisplayAsset.aspx?server='+encodeURIComponent(this.url)+'&asset='+encodeURIComponent(assetId)+'" target="_blank">';
        if (data.Type === "image") {
          result += '<img id="FieldScope.MetaLens.Media" src="'+this.url+'/assets/'+assetId+'/thumb/large.cpx">';
        } else if (data.Type === "audio") {
          
          //TODO: use media player
          result += '<img id="FieldScope.MetaLens.Media" src="images/missing.gif" alt="audio" />';
          
        } else if (data.Type === "video") {
        
          //TODO: use media player
          result += '<img id="FieldScope.MetaLens.Media" src="images/missing.gif" alt="video" />';
        
        }
        result += '</a>';
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
    
    this.OnClickMarker = function (marker) {
        marker.openExtInfoWindow(
            this.map, 
            "fieldscope_metalens_window", 
            this.loadingHTML,
            {beakOffset: 0, paddingX: 10, paddingY: 10}
          );
        this.map.getExtInfoWindow().FieldScopeMarker = marker;
        this.LoadInfoWindow(marker);
      };
    
    this.MakeMarker = function (record) {
        var icon = FieldScope.MetaLens.icon;
        if (record.AssetIds.length > 1) {
          icon = FieldScope.MetaLens.icon_cl;
        }
        var marker = new GMarker(new GLatLng(record.Latitude, record.Longitude), icon);
        marker.MetaLensAssetIds = record.AssetIds;
        marker.MetaLensAssetIndex = 0;
        GEvent.addListener(marker, "click",  Function.createDelegate(this, function () {
            this.OnClickMarker(marker);
          }));
        return marker;
      };
    
    this.QuerySuccessCallback = function (records, callback) {
        var overlays = [];
        var marker;
        for (var x = 0; x < records.length; x += 1) {
          marker = this.MakeMarker(records[x]);
          this.map.addOverlay(marker);
          overlays.push(marker);
        }
        callback.call(this, overlays);
      };
    
    this.AddOverlays = function (bounds, size, OnSuccess, OnFailure) { 
        this.service.GetPoints(this.url,
                               bounds.getSouthWest().lng(),
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
    
    this.TriggersRefresh = function (oldState, newState) {
        return (!oldState.dataBounds.containsBounds(newState.mapBounds)) ||
               (oldState.zoom !== newState.zoom);
      };
    
    GEvent.addDomListener(this.map, "extinfowindowclose", Function.createDelegate(this, function() {
        if (this.map.getExtInfoWindow().FieldScopeMarker === this.marker) {
          this.marker = null;
        }
      }));
  };

try {
FieldScope.MetaLens.GDataProvider.registerClass('FieldScope.MetaLens.GDataProvider', null, FieldScope.GAsyncDataProvider);
} catch (e) { console.error(e); }

// ----------------------------------------------------------------------------
// MetaLens.MouseMode class

FieldScope.MetaLens.MouseMode = function (layer, url) {
    
    this.layer = layer;
    this.url = url;
    this.map = null;
    this.marker = null;
    this.onClickListener = null;
    
    this.GenerateForm = Function.createDelegate(this, function () {
        var location = this.marker.getLatLng();
        var result = '<div id="FieldScope.MetaLens.DataEntryDiv">';
        result += '<iframe id="FieldScope.MetaLens.DataEntryFrame"';
        result +=        ' name="FieldScope.MetaLens.DataEntryFrame"';
        result +=        ' src="MetaLensUpload.aspx?';
        result +=              'server='+encodeURIComponent(this.url)+'&';
        result +=              'lat='+encodeURIComponent(location.lat().toString())+'&';
        result +=              'lon='+encodeURIComponent(location.lng().toString())+'"';
        result +=        ' width="350"';
        result +=        ' height="230"';
        result +=        ' frameborder="0">';
        result += '</iframe></div>';
        return result;
      });
    
    this.RefreshLayerDelegate = Function.createDelegate(this, function () {
        this.layer.ReloadLayer();
      });
    
    this.UploadCompleteDelegate = Function.createDelegate(this, function () {
        this.map.closeInfoWindow();
        window.setTimeout(this.RefreshLayerDelegate, 2500);
      });
    
    this.OnLoadDelegate = Function.createDelegate(this, function (event) {
        var iframe = $get("FieldScope.MetaLens.DataEntryFrame");
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) {
          doc = doc.document;
        }
        // MetaLensUpload.aspx.cs will register a StartupScript to call
        // FieldScopeMetaLensUploadComplete on the ASP.NET page's document
        // once it's finished uploading the image. The resulting 
        // interdependency between this file and the ASP.NET page
        // is unfortunate, but at least it works. Maybe once I know what
        // I'm doing I'll figure out a better way to do this.
        doc.FieldScopeMetaLensUploadComplete = this.UploadCompleteDelegate;
      });
    
    this.WireForm = function () {
        var iframe = $get("FieldScope.MetaLens.DataEntryFrame");
        $addHandler(iframe, "load", this.OnLoadDelegate);
      };
    
    this.DisableDraggingDelegate = Function.createDelegate(this, function () {
        this.map.disableDragging();
        this.marker = null;
      });
    
    this.OnCloseDelegate = Function.createDelegate(this, function () {
        this.map.removeOverlay(this.marker);
        window.setTimeout(this.DisableDraggingDelegate, 0);
      });
    
    this.OnOpenDelegate = Function.createDelegate(this, function () {
        this.WireForm();
        this.map.enableDragging();
      });
    
    this.OnClickDelegate = Function.createDelegate(this, function (overlay, loc, overlayLoc) {
        loc = loc || overlayLoc;
        if (loc && (this.marker === null)) {
          this.marker = new GMarker(loc, FieldScope.MetaLens.icon);
          this.map.addOverlay(this.marker);
          GEvent.addListener(this.marker, "infowindowclose", this.OnCloseDelegate);
          GEvent.addListener(this.marker, "infowindowopen", this.OnOpenDelegate);
          this.marker.openInfoWindowHtml(this.GenerateForm());
        }
      });
    
    this.Activate = function (map) {
        this.map = map;
        map.disableDragging();
        this.eventListener = GEvent.addListener(map, "click", this.OnClickDelegate);
      };
    
    this.Deactivate = function (map) {
        if (this.eventListener) {
          GEvent.removeListener(this.eventListener);
          this.eventListener = null;
        }
        if (this.marker) {
          map.removeOverlay(this.marker);
          this.marker = null;
        }
        this.map = null;
      };
    
    this.GetName = function () { 
        return "Place Photo";
      };
    
    this.GetId = function () { 
        return "FieldScope.Tool[photos]";
      };
    
    this.GetIconCssClass = function () {
        return "addPhotoIcon";
      };
  };

FieldScope.MetaLens.MouseMode.registerClass('FieldScope.MetaLens.MouseMode', null, FieldScope.MouseMode);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
