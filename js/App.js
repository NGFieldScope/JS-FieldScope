/*global FieldScope, esri, Sys, Type $get CBIBSService MetaLensService */
/*global GBrowserIsCompatible GMap2  GLargeMapControl G_HYBRID_MAP G_SATELLITE_MAP */
/*global GEvent GIcon GLatLng GMapType GMarker GPoint GSize */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// DataEntryProvider class

FieldScope.DataEntryProvider = function () {
    this.GenerateForm = function (marker) { };
    this.ActivateForm = function (map) { };
    this.MarkerIcon = null;
  };

FieldScope.DataEntryProvider.registerInterface('FieldScope.DataEntryProvider');

// ----------------------------------------------------------------------------
// AsyncLayerController class

FieldScope.AsyncLayerController = function (layer, name, iconHTML) {
    this.asyncLayer = layer;
    this.name = name;
    this.IsVisible = Function.createDelegate(this, function () {
        return this.asyncLayer.IsVisible();
      });
    this.SetVisible = Function.createDelegate(this, function (visible) {
        this.asyncLayer.SetVisible(visible);
      });
    this.loadingIndicator = null;
    this.asyncLayer.AttachEvent("onbeginloading", Function.createDelegate(this, function (evt) {
        if (this.loadingIndicator) {
          this.loadingIndicator.style.visibility="visible";
        }
      }));
    this.asyncLayer.AttachEvent("onfinishloading", Function.createDelegate(this, function (evt) {
        if (this.loadingIndicator) {
          this.loadingIndicator.style.visibility="hidden";
        }
      }));
    this.asyncLayer.SetVisible(false);
    this.iconHTML = iconHTML;
  };

FieldScope.AsyncLayerController.registerClass('FieldScope.AsyncLayerController');

// ----------------------------------------------------------------------------
// Application class

FieldScope.App = function (mapDiv, getSearchTextFn, setSearchResultsFn) {
    
    this.map = null;
    this.mapTypes = null;
    this.mapExtension = null;
    
    this.searchTool = null;
    this.GetSearchText = getSearchTextFn;
    this.SetSearchResults = setSearchResultsFn;
    
    this.dataEntryTools = { 
        observations : null, 
        photos : null, 
        none: null 
      };
    this.dataEntry = {
        currentTool : null,
        eventListener : null,
        marker : null
      };
    this.layers = {
        observations : { },
        cbibs : { },
        metaLens : { },
        watersheds : { },
        nutrients : { },
        streets : { },
        landcover : { },
        permeability : { }
      };
    
    this.UpdateMapType = Function.createDelegate(this, function () {
        var tileLayers = [ G_SATELLITE_MAP.getTileLayers()[0] ];
        if (this.layers.permeability.tileLayer && this.layers.permeability.visible) {
          tileLayers.push(this.layers.permeability.tileLayer);
        }
        if (this.layers.landcover.tileLayer && this.layers.landcover.visible) {
          tileLayers.push(this.layers.landcover.tileLayer);
        }
        if (this.layers.streets.tileLayer && this.layers.streets.visible) {
          tileLayers.push(this.layers.streets.tileLayer);
        }
        this.map.setMapType(new GMapType(tileLayers, G_SATELLITE_MAP.getProjection(), "Custom", {errorMessage:"No data available"}));
        this.layers.permeability.loadingIndicator.style.visibility="hidden";
        this.layers.landcover.loadingIndicator.style.visibility="hidden";
        this.layers.streets.loadingIndicator.style.visibility="hidden";
      });
    
    this.OnSearchKey = Function.createDelegate(this, function (event) {
        if (/* backspace */ (event.keyCode === 0x08) || 
            /* ascii */     ((event.keyCode >= 0x20) && (event.keyCode <= 0x7E)) || 
            /* delete */    (event.keyCode === 0x7F) ||
            /* extended */  (event.keyCode >= 0xA0)) { 
          this.searchTool.ClearSearchResults();
        } else if (/* return */ event.keyCode === 0x0D) {
          event.cancelBubble = true;
          event.returnValue = false;
          if (event.preventDefault) {
            event.preventDefault();
          }
          this.searchTool.DoSearch(this.GetSearchText());
          return false;
        }
      });
    
    this.OnSearchClick = Function.createDelegate(this, function (event) {
        this.searchTool.DoSearch(this.GetSearchText());
      });
    
    this.SetDataEntryTool = function (newTool) {
        if (newTool !== this.dataEntry.currentTool) {
          if (this.dataEntry.currentTool !== this.dataEntryTools.none) {
            GEvent.removeListener(this.dataEntry.eventListener);
            this.dataEntry.eventListener = null;
            this.dataEntry.currentTool = this.dataEntryTools.none;
            if (this.dataEntry.marker) {
              this.map.removeOverlay(this.dataEntry.marker);
              this.dataEntry.marker = null;
            }
          }
          if (newTool !== this.dataEntryTools.none) {
            this.map.disableDragging();
            this.layers.watersheds.SetVisible(false);
            this.dataEntry.eventListener = GEvent.addListener(this.map, "click", Function.createDelegate(this, function (overlay, loc) {
                if (loc && (this.dataEntry.marker === null)) {
                  this.dataEntry.marker = new GMarker(loc, this.dataEntry.currentTool.MarkerIcon);
                  this.map.addOverlay(this.dataEntry.marker);
                  GEvent.addListener(this.dataEntry.marker, "infowindowclose", Function.createDelegate(this, function () {
                      this.map.removeOverlay(this.dataEntry.marker);
                      this.dataEntry.marker = null;
                    }));
                  GEvent.addListener(this.dataEntry.marker, "infowindowopen", Function.createDelegate(this, function () {
                      this.dataEntry.currentTool.ActivateForm(this.map);
                    }));
                  this.dataEntry.marker.openInfoWindow(this.dataEntry.currentTool.GenerateForm(this.dataEntry.marker));
                }
              }));
            this.dataEntry.currentTool = newTool;
          } else {
            this.map.enableDragging();
          }
        }
      };
    
    //
    // Here is where we actually do the setup, now that our methods have all been defined
    //
    if (GBrowserIsCompatible()) {
      var urlPrefix = "http://" + FieldScope.StringUtils.removePortNumber(location.host);
    
      this.map = new GMap2(mapDiv);
      this.map.setCenter(new GLatLng(38.039, -76.025), 9);
      this.map.addControl(new GLargeMapControl());
      this.map.setMapType(G_SATELLITE_MAP);
      this.map.enableScrollWheelZoom();
      this.mapExtension = new esri.arcgis.gmaps.MapExtension(this.map);
      
      this.searchTool = new FieldScope.GSearch(this.map, this.SetSearchResults);
      
      // Impervious surfaces layer
      this.layers.permeability = {
          name : "Impervious Surfaces",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.permeability.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.permeability.visible = visible;
              this.layers.permeability.loadingIndicator.style.visibility="visible";
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+urlPrefix+'/ArcGIS/rest/services/cb_permeability/MapServer/tile/10/392/295.png" style="height:16px" />'
        };
      var dummy1 = new esri.arcgis.gmaps.TiledMapServiceLayer(urlPrefix + "/ArcGIS/rest/services/cb_permeability/MapServer",
                                                             {opacity: 0.35},
                                                             Function.createDelegate(this, function (layer) {
                                                                 this.layers.permeability.tileLayer = layer;
                                                                 this.UpdateMapType();
                                                               }));
      
      // Land Cover layer
      this.layers.landcover = {
          name : "Land Cover",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.landcover.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.landcover.visible = visible;
              this.layers.landcover.loadingIndicator.style.visibility="visible";
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+urlPrefix+'/ArcGIS/rest/services/cb_landcover/MapServer/tile/10/392/295.png" style="height:16px" />'
        };
      var dummy2 = new esri.arcgis.gmaps.TiledMapServiceLayer(urlPrefix + "/ArcGIS/rest/services/cb_landcover/MapServer",
                                                             {opacity: 0.45},
                                                             Function.createDelegate(this, function (layer) {
                                                                 this.layers.landcover.tileLayer = layer;
                                                                 this.UpdateMapType();
                                                               }));
      
      // Streets & places layer
      this.layers.streets = {
          name : "Streets & Places",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.streets.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.streets.visible = visible;
              this.layers.streets.loadingIndicator.style.visibility="visible";
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : G_HYBRID_MAP.getTileLayers()[1],
          iconHTML : '<img src="http://mt2.google.com/mt?n=404&v=apt.75&hl=en&x=292&y=391&zoom=7&s=Gal" style="height:16px" />'
        };
      
      // Watershed boundaries layer
      var watershedsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, urlPrefix + "/ArcGIS/rest/services/cb_watersheds/MapServer/0");
      watershedsProvider.fillStyle = {color: "#0000FF", opacity: 0.1};
      watershedsProvider.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
      watershedsProvider.queryfields = [ "HUC4_NAME", "HUC8_Name" ];
      watershedsProvider.infoWindow = '<table><tr><td style="font-weight:bold">Subregion:<td><td>{HUC4_NAME}</td></tr><tr><td style="font-weight:bold">Subbasin:<td><td>{HUC8_Name}</td></tr></table>';
      this.layers.watersheds = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, watershedsProvider),
                                                                   "Watershed Boundaries",
                                                                   '<div style="max-width:10px;max-height:12px;border:2px solid #0000FF;opacity:0.75;filter:alpha(opacity=75)"><div style="width:10px;height:12px;background-color:#0000FF;opacity:0.1;filter:alpha(opacity=10)"></div></div>');
      
      // Nutrients & Sediment layer
      var nutrientsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, urlPrefix + "/ArcGIS/rest/services/cb_nutrients/MapServer/3");
      nutrientsProvider.fillStyle = {color: "#00FF00", opacity: 0.1};
      nutrientsProvider.lineStyle = {color: "#00FF00", opacity: 0.75, weight: 2};
      nutrientsProvider.queryfields = [ "TRIB_BASIN", 
                                        "AG_TP_PER", "FOR_TP_PER", "MIX_TP_PER", "URB_TP_PER", "DEP_TP_PER", "PNT_TP_PER",
                                        "AG_TN_PER", "FOR_TN_PER", "MIX_TN_PER", "URB_TN_PER", "DEP_TN_PER", "PNT_TN_PER",
                                        "AG_SD_PER", "FOR_SD_PER", "MIX_SD_PER", "URB_SD_PER" ];
      nutrientsProvider.infoWindow = 
        '<table>'+
        '<tr><td style="font-weight:bold">Basin:</td><td>{TRIB_BASIN}</td></tr>' +
        '<tr><td style="font-weight:bold">Phosphorous:</td><td><img src="http://chart.apis.google.com/chart?cht=p&chs=220x75&chd=t:{AG_TP_PER},{FOR_TP_PER},{MIX_TP_PER},{URB_TP_PER},{DEP_TP_PER},{PNT_TP_PER}&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2" width="220" height="75" alt="chart missing" /></td></tr>'+
        '<tr><td style="font-weight:bold">Nitrogen:</td><td><img src="http://chart.apis.google.com/chart?cht=p&chs=220x75&chd=t:{AG_TN_PER},{FOR_TN_PER},{MIX_TN_PER},{URB_TN_PER},{DEP_TN_PER},{PNT_TN_PER}&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2" width="220" height="75" alt="chart missing" /></td></tr>'+
        '<tr><td style="font-weight:bold">Sediment:</td><td><img src="http://chart.apis.google.com/chart?cht=p&chs=220x75&chd=t:{AG_SD_PER},{FOR_SD_PER},{MIX_SD_PER},{URB_SD_PER}&chl=Agriculture|Forest|Mixed%20Use|Urban&chco=E1E298,35824D,BCBCE6,FAAB9F" width="220" height="75" alt="chart missing" /></td></tr>'+
        '</table>';
      this.layers.nutrients = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, nutrientsProvider),
                                                                  "Nutrients & Sediment",
                                                                  '<div style="max-width:10px;max-height:12px;border:2px solid #00FF00;opacity:0.75;filter:alpha(opacity=75)"><div style="width:10px;height:12px;background-color:#00FF00;opacity:0.1;filter:alpha(opacity=10)"></div></div>');
      
      // MetaLens layer
      var metaLensProvider = new FieldScope.MetaLens.GDataProvider(this.map, "http://focus.metalens.org", MetaLensService);
      this.layers.metaLens = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, metaLensProvider),
                                                                 "Photo Locations",
                                                                 '<img src="images/pin.png" style="height:16px" />');
      
      // CBIBS layer
      var cbibsProvider = new FieldScope.CBIBS.GDataProvider(this.map, CBIBSService);
      this.layers.cbibs = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, cbibsProvider),
                                                              "CBIBS",
                                                              '<img src="images/buoy.png" style="height:16px" />');
      
      // Student observations layer
      var observationsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, urlPrefix + "/ArcGIS/rest/services/cb_observations/MapServer/0");
      observationsProvider.icon = new GIcon(null, "images/beaker.gif");
      observationsProvider.icon.shadow = "images/beaker-shadow.png";
      observationsProvider.icon.iconSize = new GSize(24, 24);
      observationsProvider.icon.shadowSize = new GSize(36, 24);
      observationsProvider.icon.iconAnchor = new GPoint(12, 24);
      observationsProvider.icon.infoWindowAnchor = new GPoint(8, 2);
      observationsProvider.icon.infoShadowAnchor = new GPoint(16, 8);
      observationsProvider.queryfields = [ "TEMPERATURE", "SALINITY", "TURBIDITY", "OXYGEN", "NITROGEN", "PHOSPHORUS" ];
      observationsProvider.infoWindow = '<table><tr><td style="font-weight:bold">Temperature:<td><td>{TEMPERATURE}</td></tr><tr><td style="font-weight:bold">Salinity:<td><td>{SALINITY}</td></tr><tr><td style="font-weight:bold">Turbidity:<td><td>{TURBIDITY}</td></tr><tr><td style="font-weight:bold">Oxygen:<td><td>{OXYGEN}</td></tr><tr><td style="font-weight:bold">Nitrogen:<td><td>{NITROGEN}</td></tr><tr><td style="font-weight:bold">Phosphorus:<td><td>{PHOSPHORUS}</td></tr></table>';
      this.layers.observations = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, observationsProvider),
                                                                     "Student Observations",
                                                                     '<img src="images/beaker.gif" style="height:16px" />');
      
      this.dataEntryTools.observations = new FieldScope.WFS.DataEntryProvider(this.layers.observations.asyncLayer, 
                                                                              urlPrefix + "/arcgis/services/cb_observations/GeoDataServer/WFSServer",
                                                                              "cb_observations");
      this.dataEntryTools.observations.name = "Place Observation";
      this.dataEntryTools.photos = new FieldScope.MetaLens.DataEntryProvider(this.layers.metaLens.asyncLayer,
                                                                             "http://focus.metalens.org");
      this.dataEntryTools.photos.name = "Place Photo";
      this.dataEntryTools.none = { name : "Data Entry Off" };
      this.dataEntry.currentTool = this.dataEntryTools.none;
      
    } else {
      mapDiv.innerHTML = "Sorry, your browser is not compatable with Google Maps";
    }
  };

FieldScope.App.registerClass('FieldScope.App');

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }