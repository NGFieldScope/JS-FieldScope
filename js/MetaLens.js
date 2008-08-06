/*global FieldScope Sys Type $get $addHandler $removeHandler swfobject */
/*global GIcon GSize GPoint GMarker GLatLng GEvent G_DEFAULT_ICON */

Type.registerNamespace("FieldScope.MetaLens");

// ----------------------------------------------------------------------------
// MetaLens.GDataProvider class

FieldScope.MetaLens.GDataProvider = function (map, service, url) { 
    
    this.map = map;
    this.url = url;
    this.service = service;
    this.keyword = null;
    this.icon = G_DEFAULT_ICON;
    this.clusterIcon = null;
    this.marker = null;
    this.resizeTrigger = null;
    this.cssClass = "fieldscope_metalens_window";
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
        if (this.resizeTrigger) {
          $removeHandler(this.resizeTrigger, "load", this.OnLoadDelegate);
          this.resizeTrigger = null;
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
        var parent = $get(this.cssClass + "_contents");
        if (parent) {
          parent.innerHTML = html;
          var resizeTrigger = $get("FieldScope.MetaLens.ResizeTrigger");
          if (resizeTrigger) {
            this.resizeTrigger = resizeTrigger;
            $addHandler(this.resizeTrigger, "load", this.OnLoadDelegate);
          }
          var flashPlayer = $get("FieldScope.MetaLens.Media.Audio");
          if (flashPlayer) {
            var assetId = flashPlayer.innerText || flashPlayer.textContent;
            var fileUrl = encodeURIComponent("../MetaLensProxyService.ashx?server="+this.url+"&asset="+assetId);
            var flashvars = {
                file : fileUrl,
                type : "video"
              };
            swfobject.embedSWF("swf/player.swf", "FieldScope.MetaLens.Media.Audio", "390", "21", "9", null, flashvars);
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
          result += '<div class="title">';
          result += data.Caption;
          result += '</div>';
        }
        result += '<table style="width:100%">';
        if (data.Type === "image") {
          result += '<tr>';
          result += '<td style="vertical-align:top">';
          result += '<div style="margin-left:3px;margin-top:3px">';
          result += '<a href="MetaLensDisplayAsset.aspx?server='+encodeURIComponent(this.url)+'&asset='+encodeURIComponent(assetId)+'" target="_blank">';
          result += '<img id="FieldScope.MetaLens.ResizeTrigger" src="'+this.url+'/assets/'+assetId+'/thumb/large.cpx">';
          result += '</a>';
          result += '</div>';
          result += '</td>';
          if (data.Description !== null) {
            result += '<td style="vertical-align:top;width:100%">';
            result += '<div style="font-size:9pt;max-height:150px;overflow:auto;margin-left:3px">';
            result += data.Description;
            result += '</div>';
            result += '</td>';
          }
          result += '</tr>';
          if (data.Copyright !== null) {
            result += '<tr>';
            result += '<td colspan="2">';
            result += '<div style="font-size:7pt;font-weight:bold">';
            result += data.Copyright;
            result += '</div>';
            result += '</td>';
            result += '</tr>';
          }
        } else if (data.Type === "audio") {
          result += '<tr>';
          result += '<td' + ((this.marker.MetaLensAssetIds.length > 1) ? ' colspan="2"' : '') + '>';
          result += '<div style="margin:3px">';
          result += '<div id="FieldScope.MetaLens.Media.Audio">';
          result += assetId;
          result += '</div>';
          result += '</div>';
          result += '</td>';
          result += '</tr>';
          if (data.Copyright !== null) {
            result += '<tr>';
            result += '<td align="right"' + ((this.marker.MetaLensAssetIds.length > 1) ? ' colspan="2"' : '') + '>';
            result += '<div style="font-size:7pt;font-weight:bold">';
            result += data.Copyright;
            result += '</div>';
            result += '</td>';
            result += '</tr>';
          }
          if (data.Description !== null) {
            result += '<tr>';
            result += '<td style="vertical-align:top;width:100%"' + ((this.marker.MetaLensAssetIds.length > 1) ? ' colspan="2"' : '') + '>';
            result += '<div style="font-size:9pt;max-height:130px;overflow:auto;margin-left:3px">';
            result += data.Description;
            result += '</div>';
            result += '</td>';
            result += '</tr>';
          }
        } else if (data.Type === "video") {
          result += '<a href="MetaLensDisplayAsset.aspx?server='+encodeURIComponent(this.url)+'&asset='+encodeURIComponent(assetId)+'" target="_blank">';
          //TODO: inline media player?
          result += '<img id="FieldScope.MetaLens.Media.Image" src="images/Video.png" height="65" alt="video" />';
          result += '</a>';
          result += '</td>';
          if (data.Description !== null) {
            result += '<td style="vertical-align:top;width:100%">';
            result += '<div style="font-size:8pt;max-height:150px;overflow:auto">';
            result += data.Description;
            result += '</div>';
            result += '</td>';
          }
          result += '</tr>';
          if (data.Copyright !== null) {
            result += '<tr>';
            result += '<td colspan="2">';
            result += '<div style="font-size:7pt;font-weight:bold">';
            result += data.Copyright;
            result += '</div>';
            result += '</td>';
            result += '</tr>';
          }
        }
        if (this.marker.MetaLensAssetIds.length > 1) {
          result += '<tr>';
          result += '<td align="left">';
          result += '<input type="button" id="FieldScope.MetaLens.PrevButton" value="&lt;- Previous" style="font-size:8pt"';
          if (this.marker.MetaLensAssetIndex === 0) {
            result += ' disabled="disabled"';
          }
          result += ' />';
          result += '</td>';
          result += '<td align="right">';
          result += '<input type="button" id="FieldScope.MetaLens.NextButton" value="Next -&gt;" style="font-size:8pt"';
          if (this.marker.MetaLensAssetIndex === (this.marker.MetaLensAssetIds.length - 1)) {
            result += ' disabled="disabled"';
          }
          result += ' />';
          result += '</td>';
          result += '</tr>';
        }
        if (data.Type === "audio") {
          result += '<tr><td><img src="images/dummy.gif" id="FieldScope.MetaLens.ResizeTrigger" /></tr></td>';
        }
        result += '</table>';
        result += '</div>';
        return result;
      };
    
    this.OnClickMarker = function (marker) {
        marker.openExtInfoWindow(
            this.map, 
            this.cssClass,
            this.loadingHTML,
            {beakOffset: 0, paddingX: 10, paddingY: 10}
          );
        this.map.getExtInfoWindow().FieldScopeMarker = marker;
        this.LoadInfoWindow(marker);
      };
    
    this.MakeMarker = function (record) {
        var icon = this.icon;
        if (this.clusterIcon && (record.AssetIds.length > 1)) {
          icon = this.clusterIcon;
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
                               this.keyword,
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
        result +=        ' height="200"';
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
          this.marker = new GMarker(loc, this.layer.provider.icon);
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
