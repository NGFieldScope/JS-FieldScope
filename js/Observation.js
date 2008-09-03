/*global FieldScope Sys Type $addHandler $get dojo */
/*global GEvent GMarker */

Type.registerNamespace("FieldScope.Observation");

// ----------------------------------------------------------------------------
// Observation.MouseMode class

FieldScope.Observation.MouseMode = function(layer, serviceUrl, serviceName) {
    
    this.layer = layer;
    this.icon = layer.provider.icon;
    this.serviceUrl = serviceUrl;
    this.serviceName = serviceName;
    this.map = null;
    this.marker = null;
    this.onClickListener = null;
    
    this.GenerateForm = function (marker) {
        var location = this.marker.getLatLng();
        var result = '<div id="FieldScope.Observation.DataEntryDiv">';
        result += '<iframe id="FieldScope.Observation.DataEntryFrame"';
        result +=        ' name="FieldScope.Observation.DataEntryFrame"';
        result +=        ' src="StudentObservation.aspx?';
        result +=              'service=' + encodeURIComponent(this.serviceUrl) + '&';
        result +=              'name='+encodeURIComponent(this.serviceName)+'&';
        result +=              'lat='+encodeURIComponent(location.lat().toString())+'&';
        result +=              'lon='+encodeURIComponent(location.lng().toString())+'"';
        result +=        ' width="575"';
        result +=        ' height="350"';
        result +=        ' frameborder="0"';
        result +=        ' marginheight="0"';
        result +=        ' marginwidth="0">';
        result += '</iframe></div>';
        return result;
      };
    
    this.RefreshLayerDelegate = Function.createDelegate(this, function () {
        this.layer.ReloadLayer();
      });
    
    this.UploadCompleteDelegate = Function.createDelegate(this, function () {
        this.map.closeInfoWindow();
        window.setTimeout(this.RefreshLayerDelegate, 1000);
      });
    
    this.OnLoadDelegate = Function.createDelegate(this, function (event) {
        var iframe = $get("FieldScope.Observation.DataEntryFrame");
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) {
          doc = doc.document;
        }
        // StudentObservation.aspx.cs will register a StartupScript to call
        // FieldScopeObservationUploadComplete on the ASP.NET page's document
        // once it's finished saving the observation. The resulting 
        // interdependency between this file and the ASP.NET page
        // is unfortunate, but at least it works. Maybe once I know what
        // I'm doing I'll figure out a better way to do this.
        doc.FieldScopeObservationUploadComplete = this.UploadCompleteDelegate;
      });
    
    this.WireForm = function () {
        var iframe = $get("FieldScope.Observation.DataEntryFrame");
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
          this.marker = new GMarker(loc, this.icon);
          this.map.addOverlay(this.marker);
          GEvent.addListener(this.marker, "infowindowclose", this.OnCloseDelegate);
          GEvent.addListener(this.marker, "infowindowopen", this.OnOpenDelegate);
          this.marker.openInfoWindowHtml(this.GenerateForm());
        }
      });
    
    this.Activate = function (map) {
        this.map = map;
        map.disableDragging();
        this.onClickListener = GEvent.addListener(map, "click", this.OnClickDelegate);
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
        this.map = null;
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
    
    this.LoginRequired = function () {
        return true;
      };
  };

FieldScope.Observation.MouseMode.registerClass('FieldScope.Observation.MouseMode', null, FieldScope.MouseMode);

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }
