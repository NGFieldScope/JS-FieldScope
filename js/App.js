/*global FieldScope, esri, Sys, Type $get */
/*global GBrowserIsCompatible GMap2 GEvent GLatLng GLargeMapControl GMapType GMarker G_HYBRID_MAP G_SATELLITE_MAP */
/*global dijit MetaLensService */

Type.registerNamespace("FieldScope");

// ----------------------------------------------------------------------------
// DataEntryProvider class

FieldScope.DataEntryProvider = function () {
    this.GenerateForm = function () { };
    this.ActivateForm = function (map) { };
    this.MarkerIcon = null;
  };

FieldScope.DataEntryProvider.registerInterface('FieldScope.DataEntryProvider');

// ----------------------------------------------------------------------------
// Application class

FieldScope.App = function (mapId, 
                           searchInputId,
                           searchResultsId,
                           watershedsLoadingId,
                           metaLensLoadingId,
                           observationsLoadingId) {
    
    this.elementIds = { map : mapId,
                        searchInput : searchInputId,
                        searchResults : searchResultsId,
                        watershedsLoading : watershedsLoadingId,
                        metaLensLoading : metaLensLoadingId,
                        observationsLoading : observationsLoadingId };
    
    this.map = null;
    this.mapTypes = null;
    this.mapExtension = null;
    
    this.searchTool = null;
    
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
        permeability : null,
        watersheds : null,
        metaLens : null,
        observations : null
      };
    this.layersVisible = {
        permeability : true,
        places : false
      };
    
    this.SetupMapTypes = Function.createDelegate(this, function () {
        this.mapTypes = [ G_SATELLITE_MAP,
                          G_HYBRID_MAP,
                          new GMapType([G_SATELLITE_MAP.getTileLayers()[0], this.layers.permeability],
                                       G_SATELLITE_MAP.getProjection(), 
                                       "Satellite with Permeability", 
                                       {errorMessage:"No data available"}),
                          new GMapType([G_HYBRID_MAP.getTileLayers()[0], this.layers.permeability, G_HYBRID_MAP.getTileLayers()[1]],
                                       G_HYBRID_MAP.getProjection(),
                                       "Hybrid with Permeability", 
                                       {errorMessage:"No data available"}) ];
        this.UpdateMapType();
      });
    
    this.UpdateMapType = Function.createDelegate(this, function () {
        var typeIndex = 0;
        if (this.layersVisible.places) {
          typeIndex += 1;
        }
        if (this.layersVisible.permeability) {
          typeIndex += 2;
        }
        this.map.setMapType(this.mapTypes[typeIndex]);
      });
    
    this.SetLayerVisible = Function.createDelegate(this, function (index, visible) {
        switch (index) {
          case 0:
            this.layers.observations.SetVisible(visible);
            break;
          case 1:
            this.layers.metaLens.SetVisible(visible);
            break;
          case 2:
            this.layers.watersheds.SetVisible(visible);
            break;
          case 3:
            this.layersVisible.permeability = visible;
            // use setTimeout so the checkbox updates immediately
            window.setTimeout(this.UpdateMapType, 0);
            break;
          case 4:
            this.layersVisible.places = visible;
            // use setTimeout so the checkbox updates immediately
            window.setTimeout(this.UpdateMapType, 0);
            break;
        }
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
          this.OnSearchClick();
        }
      });
    
    this.OnSearchClick = Function.createDelegate(this, function (event) {
        this.searchTool.DoSearch($get("searchInput").value);
      });
    
    this.SetDataEntryTool = function (newTool) {
        if (newTool !== this.dataEntry.currentTool) {
          if (this.dataEntry.currentTool !== null) {
            GEvent.removeListener(this.dataEntry.eventListener);
            this.dataEntry.eventListener = null;
            this.dataEntry.currentTool = null;
            if (this.dataEntry.marker) {
              this.map.removeOverlay(this.dataEntry.marker);
              this.dataEntry.marker = null;
            }
          }
          if (newTool !== null) {
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
                  this.dataEntry.marker.openInfoWindow(this.dataEntry.currentTool.GenerateForm());
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
      var mapDiv = $get(this.elementIds.map);
      this.map = new GMap2(mapDiv);
      this.map.setCenter(new GLatLng(39.04, -77.06), 10);
      this.map.addControl(new GLargeMapControl());
      this.map.setMapType(G_SATELLITE_MAP);
      this.map.enableScrollWheelZoom();
      
      //this.mapExtension = new esri.arcgis.gmaps.MapExtension(this.map);
      
      this.searchTool = new FieldScope.GSearch(this.map, this.elementIds.searchResults);
      
      // Impervious surfaces layer
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer("http://localhost/ArcGIS/rest/services/cb_permeability/MapServer",
                                                             {opacity: 0.35},
                                                             Function.createDelegate(this, function (layer) {
                                                                 this.layers.permeability = layer;
                                                                 this.SetupMapTypes();
                                                               }));
      
      // Watershed boundaries layer
      var watershedsProvider = new FieldScope.ArcGISServer.GDataProvider("http://localhost/ArcGIS/rest/services/cb_watersheds/MapServer/0");
      watershedsProvider.fillStyle = {color: "#0000FF", opacity: 0.1};
      watershedsProvider.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
      this.layers.watersheds = new FieldScope.GAsyncLayer(this.map, watershedsProvider);
      this.layers.watersheds.AttachEvent("onbeginloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.watershedsLoading).style.visibility="visible";
        }));
      this.layers.watersheds.AttachEvent("onfinishloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.watershedsLoading).style.visibility="hidden";
        }));
      this.layers.watersheds.LoadLayer();
      
      // MetaLens layer
      var metaLensProvider = new FieldScope.MetaLens.GDataProvider(this.map, MetaLensService);
      this.layers.metaLens = new FieldScope.GAsyncLayer(this.map, metaLensProvider);
      this.layers.metaLens.AttachEvent("onbeginloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.metaLensLoading).style.visibility="visible";
        }));
      this.layers.metaLens.AttachEvent("onfinishloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.metaLensLoading).style.visibility="hidden";
        }));
      this.layers.metaLens.LoadLayer();
      
      // Student observations layer
      var observationsProvider = new FieldScope.ArcGISServer.GDataProvider("http://geode1/ArcGIS/rest/services/cb_observations/MapServer/0");
      observationsProvider.icon = new GIcon(null, "images/beaker.gif");
      observationsProvider.icon.shadow = "images/beaker-shadow.png";
      observationsProvider.icon.iconSize = new GSize(24, 24);
      observationsProvider.icon.shadowSize = new GSize(36, 24);
      observationsProvider.icon.iconAnchor = new GPoint(12, 24);
      observationsProvider.icon.infoWindowAnchor = new GPoint(8, 2);
      observationsProvider.icon.infoShadowAnchor = new GPoint(16, 8);
      this.layers.observations = new FieldScope.GAsyncLayer(this.map, observationsProvider);
      this.layers.observations.AttachEvent("onbeginloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.observationsLoading).style.visibility="visible";
        }));
      this.layers.observations.AttachEvent("onfinishloading", Function.createDelegate(this, function (evt) {
          $get(this.elementIds.observationsLoading).style.visibility="hidden";
        }));
      this.layers.observations.LoadLayer();
      
      
      this.dataEntryTools.observations = new FieldScope.WFS.DataEntryProvider(this.layers.observations, "http://geode1/arcgis/services/cb_data_2/GeoDataServer/WFSServer");
      this.dataEntryTools.photos = new FieldScope.MetaLens.DataEntryProvider(this.layers.metaLens);
      
    } else {
      $get(this.elementIds.map).innerHTML = "Sorry, your browser is not compatable with Google Maps";
    }
  };

FieldScope.App.registerClass('FieldScope.App');


if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }