/*global FieldScope, esri, Sys, Type $get CBIBSService MetaLensService */
/*global GBrowserIsCompatible GMap2  GLargeMapControl G_HYBRID_MAP G_PHYSICAL_MAP G_SATELLITE_MAP */
/*global GEvent GIcon GLatLng GMapType GMarker GPoint GSize */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// AsyncLayerController class

FieldScope.AsyncLayerController = function (layer, name, id, iconHTML) {
    this.asyncLayer = layer;
    this.name = name;
    this.id = id;
    this.IsVisible = Function.createDelegate(this, function () {
        return this.asyncLayer.IsVisible();
      });
    this.SetVisible = Function.createDelegate(this, function (visible) {
        this.asyncLayer.SetVisible(visible);
      });
    this.loadingIndicator = null;
    this.asyncLayer.AttachEvent("onbeginloading", Function.createDelegate(this, function (evt) {
        if (this.loadingIndicator) {
          FieldScope.DomUtils.show(this.loadingIndicator);
        }
      }));
    this.asyncLayer.AttachEvent("onfinishloading", Function.createDelegate(this, function (evt) {
        if (this.loadingIndicator) {
          FieldScope.DomUtils.hide(this.loadingIndicator);
        }
      }));
    this.asyncLayer.SetVisible(false);
    this.iconHTML = iconHTML;
  };

FieldScope.AsyncLayerController.registerClass('FieldScope.AsyncLayerController');

// ----------------------------------------------------------------------------
// Application class

FieldScope.Application = function (mapDiv, getSearchTextFn, setSearchResultsFn) {
    
    this.urlPrefix = "http://" + FieldScope.StringUtils.removePortNumber(location.host);
    
    this.map = null;
    this.mapTypes = null;
    this.mapExtension = null;
    
    this.searchTool = null;
    this.GetSearchText = getSearchTextFn;
    this.SetSearchResults = setSearchResultsFn;
    
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
    
    this.mouseModes = { 
        navigate: null,
        placeObservation : null, 
        placePhoto : null,
        identify : null
      };
    
    this.currentMouseMode = null;
    
    this.SetMouseMode = function (newMode) {
        if (newMode !== this.currentMouseMode) {
          if (this.currentMouseMode) {
            this.currentMouseMode.Deactivate(this.map);
          }
          this.currentMouseMode = newMode;
          if (this.currentMouseMode) {
            this.currentMouseMode.Activate(this.map);
          }
        }
      };
    
    this.layers = {
        // Google Tile layers
        terrain : { },
        satellite : { },
        streets : { },
        // ArcGIS Tile layers
        landcover : { },
        permeability : { },
        impervious : { },
        watersheds : { },
        nutrients : { },
        // Async point layers
        metaLens : { },
        cbibs : { },
        observations : { },
        // Async polygon layers
        studyArea : { }
      };
    
    this.UpdateMapType = Function.createDelegate(this, function () {
        var tileLayers = [ ];
        if (this.layers.terrain.tileLayer && this.layers.terrain.visible) {
          tileLayers.push(this.layers.terrain.tileLayer);
        }
        if (this.layers.satellite.tileLayer && this.layers.satellite.visible) {
          tileLayers.push(this.layers.satellite.tileLayer);
        }
        if (this.layers.nutrients.tileLayer && this.layers.nutrients.visible) {
          tileLayers.push(this.layers.nutrients.tileLayer);
        }
        if (this.layers.impervious.tileLayer && this.layers.impervious.visible) {
          tileLayers.push(this.layers.impervious.tileLayer);
        }
        if (this.layers.permeability.tileLayer && this.layers.permeability.visible) {
          tileLayers.push(this.layers.permeability.tileLayer);
        }
        if (this.layers.landcover.tileLayer && this.layers.landcover.visible) {
          tileLayers.push(this.layers.landcover.tileLayer);
        }
        if (this.layers.watersheds.tileLayer && this.layers.watersheds.visible) {
          tileLayers.push(this.layers.watersheds.tileLayer);
        }
        if (this.layers.streets.tileLayer && this.layers.streets.visible) {
          tileLayers.push(this.layers.streets.tileLayer);
        }
        this.map.setMapType(new GMapType(tileLayers, 
                                         G_SATELLITE_MAP.getProjection(), 
                                         "FieldScope",
                                         { errorMessage:"No data available",
                                           maxResolution : 17,
                                           minResolution : 6 }));
        FieldScope.DomUtils.hide(this.layers.terrain.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.satellite.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.nutrients.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.impervious.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.permeability.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.landcover.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.watersheds.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.streets.loadingIndicator);
      });
    
    this.IdentifyWatershedsDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_watersheds/MapServer/2");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "HUC4_NAME", "HUC8_Name" ];
        task.execute(query, false, function (result) {
            var html = '';
            if (result.features && (result.features.length > 0)) {
              var atributes = result.features[0].attributes;
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="2">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;Watershed Boundaries';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:right">Subregion:</td>';
              html +=     '<td>';
              html +=       atributes.HUC4_NAME;
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=   '<td style="font-weight:bold;text-align:right">Subbasin:</td>';
              html +=     '<td>';
              html +=       atributes.HUC8_Name;
              html +=     '</td>';
              html +=   '</tr>';
              html += '</table>';
            }
            callback.apply(this, [ html ]);
          });
        return true;
      });
    
    this.IdentifyNutreientsDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_nutrients/MapServer/4");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "TRIB_BASIN", 
                            "AG_TP_PER", "FOR_TP_PER", "MIX_TP_PER", "URB_TP_PER", "DEP_TP_PER", "PNT_TP_PER",
                            "AG_TN_PER", "FOR_TN_PER", "MIX_TN_PER", "URB_TN_PER", "DEP_TN_PER", "PNT_TN_PER",
                            "AG_SD_PER", "FOR_SD_PER", "MIX_SD_PER", "URB_SD_PER" ];
        task.execute(query, false, function (result) {
            var html = '';
            if (result.features && (result.features.length > 0)) {
              var atributes = result.features[0].attributes;
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="2">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;Nutrients & Sediment';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Basin:</td>';
              html +=     '<td>' + atributes.TRIB_BASIN + '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Phosphorous:</td>';
              html +=     '<td>';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   atributes.AG_TP_PER + ',' + atributes.FOR_TP_PER + ',';
              html +=                   atributes.MIX_TP_PER + ',' + atributes.URB_TP_PER + ',';
              html +=                   atributes.DEP_TP_PER + ',' + atributes.PNT_TP_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"';
              html +=           ' width="220" height="75" alt="chart missing" />';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Nitrogen:</td>';
              html +=     '<td>';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   atributes.AG_TN_PER + ',' + atributes.FOR_TN_PER + ',';
              html +=                   atributes.MIX_TN_PER + ',' + atributes.URB_TN_PER + ',';
              html +=                   atributes.DEP_TN_PER + ',' + atributes.PNT_TN_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"'; 
              html +=           ' width="220" height="75" alt="chart missing" />';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Sediment:</td>';
              html +=     '<td>';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   atributes.AG_SD_PER + ',' + atributes.FOR_SD_PER + ',';
              html +=                   atributes.MIX_SD_PER + ',' + atributes.URB_SD_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F"';
              html +=       ' width="220" height="75" alt="chart missing" /></td>';
              html +=   '</tr>';
              html += '</table>';
            }
            callback.apply(this, [ html ]);
          });
        return true;
      });
    
    //
    // Here is where we actually do the setup, now that our methods have all been defined
    //
    if (GBrowserIsCompatible()) {
      this.map = new GMap2(mapDiv);
      var blankMap = new GMapType([], G_SATELLITE_MAP.getProjection(),  "FieldScope", { maxResolution : 17, minResolution : 6 });
      this.map.setCenter(new GLatLng(39.9265, -77.2558), 6, blankMap);
      this.map.addControl(new GLargeMapControl());
      this.map.enableScrollWheelZoom();
      this.map.disableDoubleClickZoom();
      this.mapExtension = new esri.arcgis.gmaps.MapExtension(this.map);
      
      this.searchTool = new FieldScope.GSearch(this.map, this.SetSearchResults);
      
      // Terrain layer
      this.layers.terrain = {
          name : "Terrain",
          id : "FieldScope.Layer[terrain]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.terrain.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.terrain.visible = visible;
              FieldScope.DomUtils.show(this.layers.terrain.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : true,
          tileLayer : G_PHYSICAL_MAP.getTileLayers()[0],
          iconHTML : '<img src="images/terrain.jpg" style="height:16px" />'
        };
      
      // Satellite layer
      this.layers.satellite = {
          name : "Satellite",
          id : "FieldScope.Layer[satellite]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.satellite.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.satellite.visible = visible;
              FieldScope.DomUtils.show(this.layers.satellite.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : G_HYBRID_MAP.getTileLayers()[0],
          iconHTML : '<img src="images/satellite.jpg" style="height:16px" />'
        };
      
      // Streets layer
      this.layers.streets = {
          name : "Streets & Places",
          id : "FieldScope.Layer[streets]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.streets.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.streets.visible = visible;
              FieldScope.DomUtils.show(this.layers.streets.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : G_HYBRID_MAP.getTileLayers()[1],
          iconHTML : '<img src="http://mt2.google.com/mt?n=404&v=apt.75&hl=en&x=292&y=391&zoom=7&s=Gal" style="height:16px" />'
        };
      
      // Impervious surfaces layer
      this.layers.permeability = {
          name : "Impervious Surfaces",
          id : "FieldScope.Layer[permeability]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.permeability.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.permeability.visible = visible;
              FieldScope.DomUtils.show(this.layers.permeability.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_permeability/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_permeability/MapServer')+'" />'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy1 = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_permeability/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.permeability.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Land Cover layer
      this.layers.landcover = {
          name : "Land Cover",
          id : "FieldScope.Layer[landcover]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.landcover.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.landcover.visible = visible;
              FieldScope.DomUtils.show(this.layers.landcover.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_landcover/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_landcover/MapServer')+'" />'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy2 = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_landcover/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.landcover.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Percent impervious layer
      this.layers.impervious = {
          name : "Percent Impervious",
          id : "FieldScope.Layer[impervious]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.impervious.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.impervious.visible = visible;
              FieldScope.DomUtils.show(this.layers.impervious.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_impervious/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_impervious/MapServer')+'" />'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy1 = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_impervious/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.impervious.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Watershed boundaries layer
      this.layers.watersheds = {
          name : "Watershed Boundaries",
          id : "FieldScope.Layer[watersheds]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.watersheds.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.watersheds.visible = visible;
              FieldScope.DomUtils.show(this.layers.watersheds.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_watersheds/MapServer/tile/6/24/18.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_watersheds/MapServer')+'" />',
          Identify : this.IdentifyWatershedsDelegate
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy1 = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_watersheds/MapServer",
                                                                 { opacity: 1.0 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.watersheds.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Watershed boundaries layer
      this.layers.nutrients = {
          name : "Nutrients & Sediment",
          id : "FieldScope.Layer[nutrients]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.nutrients.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.nutrients.visible = visible;
              FieldScope.DomUtils.show(this.layers.nutrients.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_nutrients/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_nutrients/MapServer')+'" />',
          Identify : this.IdentifyNutreientsDelegate
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy1 = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_nutrients/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.nutrients.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // MetaLens layer
      var metaLensProvider = new FieldScope.MetaLens.GDataProvider(this.map, "http://focus.metalens.org", MetaLensService);
      this.layers.metaLens = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, metaLensProvider),
                                                                 "Photo Locations",
                                                                 "FieldScope.Layer[metaLens]",
                                                                 '<img src="images/pin.png" style="height:16px" />');
      
      // CBIBS layer
      var cbibsProvider = new FieldScope.CBIBS.GDataProvider(this.map, CBIBSService);
      this.layers.cbibs = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, cbibsProvider),
                                                              "CBIBS",
                                                              "FieldScope.Layer[cbibs]",
                                                              '<img src="images/buoy.png" style="height:16px" />');
      this.layers.cbibs.legendHTML = '<span>Real-time water quality data from the <a href="http://www.buoybay.org/" target="_blank">Chesapeake Bay Interpretive Buoy System</a></span>';
      
      // Student observations layer
      var observationsUrl = this.urlPrefix + "/ArcGIS/rest/services/cb_observations/MapServer/0";
      var observationsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, observationsUrl);
      observationsProvider.icon = new GIcon(null, "images/beaker.gif");
      observationsProvider.icon.shadow = "images/beaker-shadow.png";
      observationsProvider.icon.iconSize = new GSize(24, 24);
      observationsProvider.icon.shadowSize = new GSize(36, 24);
      observationsProvider.icon.iconAnchor = new GPoint(12, 24);
      observationsProvider.icon.infoWindowAnchor = new GPoint(8, 2);
      observationsProvider.icon.infoShadowAnchor = new GPoint(16, 8);
      observationsProvider.queryfields = [ "TEMPERATURE", "SALINITY", "TURBIDITY", "OXYGEN", "NITROGEN", "PHOSPHORUS" ];
      var html = '<table>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold;text-align:center" colspan="2">';
      html +=          '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
      html +=          '&nbsp;Student Observation';
      html +=        '</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Temperature:</td>';
      html +=        '<td>{TEMPERATURE}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Salinity:</td>';
      html +=        '<td>{SALINITY}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Turbidity:</td>';
      html +=        '<td>{TURBIDITY}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Oxygen:</td>';
      html +=        '<td>{OXYGEN}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Nitrogen:</td>';
      html +=        '<td>{NITROGEN}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Phosphorus:</td>';
      html +=        '<td>{PHOSPHORUS}</td>';
      html +=      '</tr>';
      html +=    '</table>';
      observationsProvider.infoWindow = html;
      this.layers.observations = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, observationsProvider),
                                                                     "Student Observations",
                                                                     "FieldScope.Layer[observations]",
                                                                     '<img src="images/beaker.gif" style="height:16px" />');
      
      // Watershed boundary layer
      var studyAreaProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, this.urlPrefix + "/ArcGIS/rest/services/cb_watersheds/MapServer/0");
      studyAreaProvider.fillStyle = {color: "#0000FF", opacity: 0.0};
      studyAreaProvider.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
      var studyAreaLegend = '<div style="width:10px;height:12px;border:2px solid #0000FF;opacity:0.75;filter:alpha(opacity=75)"></div>';
      this.layers.studyArea = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, studyAreaProvider),
                                                                   "Chesapeake Watershed",
                                                                   "FieldScope.Layer[studyArea]",
                                                                   studyAreaLegend);
      this.layers.studyArea.SetVisible(true);
      
      // 
      // The layerTree determines how the layers are presented to the user
      //
      this.layerTree = [ 
          null,
          this.layers.observations,
          this.layers.metaLens,
          this.layers.cbibs,
          [ "Watershed",
            this.layers.studyArea,
            this.layers.watersheds ],
          [ "Land Use",
            this.layers.landcover,
            this.layers.permeability,
            this.layers.impervious,
            this.layers.nutrients ],
          [ "Basemap",
            this.layers.streets,
            this.layers.satellite,
            this.layers.terrain ]
        ];
      
      //
      // Setup mouse modes
      //
      this.mouseModes.navigate = new FieldScope.NavigateMouseMode();
      this.mouseModes.placeObservation = new FieldScope.WFS.MouseMode(this.layers.observations.asyncLayer, 
                                                                      this.urlPrefix + "/arcgis/services/cb_observations/GeoDataServer/WFSServer",
                                                                      "cb_observations");
      this.mouseModes.placePhoto = new FieldScope.MetaLens.MouseMode(this.layers.metaLens.asyncLayer, "http://focus.metalens.org");
      this.mouseModes.identify = new FieldScope.InfoMouseMode([this.layers.watersheds, this.layers.nutrients]);
      
      //
      // The mouse mode list determines how mode buttons are presented to the user
      //
      this.mouseModeList = [
          this.mouseModes.navigate,
          this.mouseModes.placeObservation,
          this.mouseModes.placePhoto,
          this.mouseModes.identify
        ];
      
      this.SetMouseMode(this.mouseModes.navigate);
      
    } else {
      //
      //TODO: provide information about how to enable Javascript, what
      // browsers are supported, etc...
      //
      mapDiv.innerHTML = "Sorry, your browser is not compatable with Google Maps";
    }
  };

FieldScope.Application.registerClass('FieldScope.Application');

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }