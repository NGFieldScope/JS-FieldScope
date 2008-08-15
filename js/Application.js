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

FieldScope.Application = function (savedState, mapDiv, getSearchTextFn, setSearchResultsFn) {
    
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
        bathymetry : { },
        agriculture : { },
        states : { },
        physiography : { },
        // Async point layers
        then : { },
        now : { },
        photos : { },
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
        if (this.layers.agriculture.tileLayer && this.layers.agriculture.visible) {
          tileLayers.push(this.layers.agriculture.tileLayer);
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
        if (this.layers.bathymetry.tileLayer && this.layers.bathymetry.visible) {
          tileLayers.push(this.layers.bathymetry.tileLayer);
        }
        if (this.layers.watersheds.tileLayer && this.layers.watersheds.visible) {
          tileLayers.push(this.layers.watersheds.tileLayer);
        }
        if (this.layers.physiography.tileLayer && this.layers.physiography.visible) {
          tileLayers.push(this.layers.physiography.tileLayer);
        }
        if (this.layers.states.tileLayer && this.layers.states.visible) {
          tileLayers.push(this.layers.states.tileLayer);
        }
        if (this.layers.streets.tileLayer && this.layers.streets.visible) {
          tileLayers.push(this.layers.streets.tileLayer);
        }
        this.map.setMapType(new GMapType(tileLayers, 
                                         G_SATELLITE_MAP.getProjection(), 
                                         "FieldScope",
                                         { errorMessage:"No data available",
                                           maxResolution : 15,
                                           minResolution : 6 }));
        FieldScope.DomUtils.hide(this.layers.terrain.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.satellite.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.nutrients.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.agriculture.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.impervious.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.permeability.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.landcover.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.bathymetry.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.watersheds.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.physiography.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.states.loadingIndicator);
        FieldScope.DomUtils.hide(this.layers.streets.loadingIndicator);
      });
    
    this.IdentifyWatershedsDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_watersheds/MapServer/3");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "HUC4_NAME", "HUC8_NAME", "HUC11_NAME" ];
        task.execute(query, false, function (result) {
            if (result.features && (result.features.length > 0)) {
              var attributes = result.features[0].attributes;
              var html = '';
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="2">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;Watershed Boundaries';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:right">Subregion (USGS HUC4):</td>';
              html +=     '<td>';
              html +=       attributes.HUC4_NAME;
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=   '<td style="font-weight:bold;text-align:right">Subbasin (HUC8):</td>';
              html +=     '<td>';
              html +=       attributes.HUC8_NAME;
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<td style="font-weight:bold;text-align:right">Local Watershed (HUC11):</td>';
              html +=     '<td>';
              html +=       attributes.HUC11_NAME;
              html +=     '</td>';
              html +=   '</tr>';
              html += '</table>';
              callback.call(this, loc, "Watersheds", html);
            }
          });
      });
    
    this.IdentifyNutreientsDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_nutrients/MapServer/0");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "TRIB_BAS_1",
                            "AG_TP_PER", "FOR_TP_PER", "MIX_TP_PER", "URB_TP_PER", "DEP_TP_PER", "PNT_TP_PER",
                            "AG_TN_PER", "FOR_TN_PER", "MIX_TN_PER", "URB_TN_PER", "DEP_TN_PER", "PNT_TN_PER",
                            "AG_SD_PER", "FOR_SD_PER", "MIX_SD_PER", "URB_SD_PER" ];
        task.execute(query, false, function (result) {
            if (result.features && (result.features.length > 0)) {
              var attributes = result.features[0].attributes;
              var html = '';
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="3">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;Sources of Nutrient & Sediment Runoff';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Basin:</td>';
              html +=     '<td id="FieldScope_Runoff_Basin">';
              html +=       attributes.TRIB_BAS_1;
              html +=     '</td>';
              html +=     '<td align="right">';
              html +=       '<img id="FieldScope_CBIBS_SaveGraph_Button"';
              html +=           ' style="display:block;border:2px outset"';
              html +=           ' src="images/clipboard-large.gif"';
              html +=           ' alt="Save"';
              html +=           ' onclick="document.FieldScopeNutrientsSaveGraph($get(\'FieldScope_Runoff_Basin\'),';
              html +=                                                           '$get(\'FieldScope_Runoff_Phosphorous\'),';
              html +=                                                           '$get(\'FieldScope_Runoff_Nitrogen\'),';
              html +=                                                           '$get(\'FieldScope_Runoff_Sediment\'));"';
              html +=           ' onmousedown="this.style.borderStyle=\'inset\';"';
              html +=           ' onmouseup="this.style.borderStyle=\'outset\';"';
              html +=           ' onmouseout="this.style.borderStyle=\'outset\';" />';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Phosphorous:</td>';
              html +=     '<td colspan="2">';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   attributes.AG_TP_PER + ',' + attributes.FOR_TP_PER + ',';
              html +=                   attributes.MIX_TP_PER + ',' + attributes.URB_TP_PER + ',';
              html +=                   attributes.DEP_TP_PER + ',' + attributes.PNT_TP_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"';
              html +=           ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Phosphorous" />';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Nitrogen:</td>';
              html +=     '<td colspan="2">';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   attributes.AG_TN_PER + ',' + attributes.FOR_TN_PER + ',';
              html +=                   attributes.MIX_TN_PER + ',' + attributes.URB_TN_PER + ',';
              html +=                   attributes.DEP_TN_PER + ',' + attributes.PNT_TN_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"'; 
              html +=           ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Nitrogen" />';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold">Sediment:</td>';
              html +=     '<td colspan="2">';
              html +=       '<img src="http://chart.apis.google.com/chart';
              html +=                 '?cht=p';
              html +=                 '&chs=220x75';
              html +=                 '&chd=t:';
              html +=                   attributes.AG_SD_PER + ',' + attributes.FOR_SD_PER + ',';
              html +=                   attributes.MIX_SD_PER + ',' + attributes.URB_SD_PER;
              html +=                 '&chl=Agriculture|Forest|Mixed%20Use|Urban';
              html +=                 '&chco=E1E298,35824D,BCBCE6,FAAB9F"';
              html +=       ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Sediment" /></td>';
              html +=   '</tr>';
              html += '</table>';
              callback.call(this, loc, "Runoff", html);
            }
          });
      });
    
    document.FieldScopeNutrientsSaveGraph = function (basinTd, phosphorousImg, nitrogenImg, sedimentImg) {
        var table = document.createElement("table");
        table.cellSpacing = 0;
        table.style.height = "258px";
        table.style.border = "1px solid silver";
        table.style.margin = "2px";
        table.style.paddingLeft = "4px";
        table.style.backgroundColor = "white";
        // HACK: this browser-specific business is necessary because IE's
        // implementation of float:left is broken. Fortunately, so is its 
        // implementation of display:inline (in a good way). Browser 
        // detection code based on 
        // http://www.thefutureoftheweb.com/blog/detect-ie6-in-javascript
        if (false /*@cc_on || true @*/) {
          table.style.display = "inline";
        } else {
          table.style.cssFloat = "left";
        }
        var tbody = document.createElement("tbody");
        var row0 = document.createElement("tr");
        var cell01 = document.createElement("td");
        cell01.appendChild(document.createTextNode("Basin:"));
        row0.appendChild(cell01);
        var cell02 = document.createElement("td");
        cell02.innerHTML = basinTd.innerHTML;
        row0.appendChild(cell02);
        var cell03 = document.createElement("td");
        cell03.align = "right";
        var closeButton = document.createElement("input");
        closeButton.type = "button";
        closeButton.value = "X";
        closeButton.style.width = "20px";
        closeButton.style.backgroundColor = "silver";
        closeButton.style.color = "gray";
        closeButton.style.textAlign = "center";
        closeButton.style.textDecoration = "none";
        closeButton.style.borderStyle = "none";
        closeButton.onclick = function () {
            table.parentNode.removeChild(table);
          };
        cell03.appendChild(closeButton);
        row0.appendChild(cell03);
        tbody.appendChild(row0);
        var row1 = document.createElement("tr");
        var cell11 = document.createElement("td");
        cell11.appendChild(document.createTextNode("Phosphorous:"));
        row1.appendChild(cell11);
        var cell12 = document.createElement("td");
        cell12.colSpan = 2;
        var pImg = document.createElement("img");
        pImg.src = phosphorousImg.src;
        cell12.appendChild(pImg);
        row1.appendChild(cell12);
        tbody.appendChild(row1);
        var row2 = document.createElement("tr");
        var cell21 = document.createElement("td");
        cell21.appendChild(document.createTextNode("Nitrogen:"));
        row2.appendChild(cell21);
        var cell22 = document.createElement("td");
        cell22.colSpan = 2;
        var nImg = document.createElement("img");
        nImg.src = nitrogenImg.src;
        cell22.appendChild(nImg);
        row2.appendChild(cell22);
        tbody.appendChild(row2);
        var row3 = document.createElement("tr");
        var cell31 = document.createElement("td");
        cell31.appendChild(document.createTextNode("Sediment:"));
        row3.appendChild(cell31);
        var cell32 = document.createElement("td");
        cell32.colSpan = 2;
        var sImg = document.createElement("img");
        sImg.src = sedimentImg.src;
        cell32.appendChild(sImg);
        row3.appendChild(cell32);
        tbody.appendChild(row3);
        table.appendChild(tbody);
        var pasteboard = $get("FieldScope_Pasteboard");
        FieldScope.DomUtils.show(pasteboard);
        pasteboard.appendChild(table);
      };
    
    this.IdentifyStateDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_states/MapServer/0");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "cb_states.STATE_NAME", "cb_states_2.AREA_SQMI" ];
        task.execute(query, false, function (result) {
            if (result.features && (result.features.length > 0)) {
              var attributes = result.features[0].attributes;
              var html = '';
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="2">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;State';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:right">Name:</td>';
              html +=     '<td>';
              html +=       attributes["cb_states.STATE_NAME"];
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:right">Area in Watershed:</td>';
              html +=     '<td>';
              html +=       attributes["cb_states_2.AREA_SQMI"];
              html +=       'mi<sup>2</sup>';
              html +=     '</td>';
              html +=   '</tr>';
              html += '</table>';
              callback.call(this, loc, "State", html);
            }
          });
      });
    
    this.IdentifyPhysiographyDelegate = Function.createDelegate(this, function (loc, callback) {
        var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix+"/ArcGIS/rest/services/cb_physiography/MapServer/0");
        var query = new esri.arcgis.gmaps.Query();
        query.queryGeometry = loc;
        query.returnGeometry = false;
        query.outFields = [ "provNames5.NAME" ];
        task.execute(query, false, function (result) {
            if (result.features && (result.features.length > 0)) {
              var attributes = result.features[0].attributes;
              var html = '';
              html += '<table>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:center" colspan="2">';
              html +=       '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
              html +=       '&nbsp;Physiographic Region';
              html +=     '</td>';
              html +=   '</tr>';
              html +=   '<tr>';
              html +=     '<td style="font-weight:bold;text-align:right">Name:</td>';
              html +=     '<td>';
              html +=       attributes["provNames5.NAME"];
              html +=     '</td>';
              html +=   '</tr>';
              html += '</table>';
              callback.call(this, loc, "Region", html);
            }
          });
      });
    
    //
    // Here is where we actually do the setup, now that our methods have all been defined
    //
    if (GBrowserIsCompatible()) {
      this.map = new GMap2(mapDiv);
      var blankMap = new GMapType([], G_SATELLITE_MAP.getProjection(),  "FieldScope", { maxResolution : 15, minResolution : 6 });
      if (savedState) {
        this.map.setCenter(new GLatLng(savedState.centerLatitude, savedState.centerLongitude), savedState.zoomLevel, blankMap);
      } else {
        this.map.setCenter(new GLatLng(39.9265, -77.2558), 6, blankMap);
      }
      this.map.addControl(new GLargeMapControl());
      this.map.enableScrollWheelZoom();
      this.map.disableDoubleClickZoom();
      this.mapExtension = new esri.arcgis.gmaps.MapExtension(this.map);
      // Force Google Maps to load info window code & create the info window object
      var dummy1 = this.map.getInfoWindow();
      var dummy2 = this.map.getExtInfoWindow();
      
      this.searchTool = new FieldScope.GSearch(this.map, this.SetSearchResults);
      
      // Terrain layer
      this.layers.terrain = {
          name : "Terrain",
          id : "FieldScope.Layer[terrain]",
          group : "basemap",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.terrain.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.terrain.visible = visible;
              this.layers.satellite.visible = !visible;
              FieldScope.DomUtils.show(this.layers.terrain.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.terrainVisible : true,
          tileLayer : G_PHYSICAL_MAP.getTileLayers()[0],
          iconHTML : '<img src="images/terrain.jpg" style="height:16px" />'
        };
      
      // Satellite layer
      this.layers.satellite = {
          name : "Satellite",
          id : "FieldScope.Layer[satellite]",
          group : "basemap",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.satellite.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.satellite.visible = visible;
              this.layers.terrain.visible = !visible;
              FieldScope.DomUtils.show(this.layers.satellite.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.satelliteVisible : false,
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
          visible : savedState ? savedState.streetsVisible : false,
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
          visible : savedState ? savedState.permeabilityVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_permeability/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_permeability/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: MRLC National Landcover Dataset 2001</p>'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_permeability/MapServer",
                                                                 { opacity: 0.5 },
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
          visible : savedState ? savedState.landcoverVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_landcover/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_landcover/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: Chesapeake Bay Program (Watershed Model v5.0)</p>'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_landcover/MapServer",
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
          visible : savedState ? savedState.imperviousVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_impervious/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_impervious/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: MRLC National Landcover Dataset 2001; Chesapeake Bay Program</p>'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_impervious/MapServer",
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
          visible : savedState ? savedState.watershedsVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_watersheds/MapServer/tile/6/24/18.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_watersheds/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: USGS; Chesapeake Bay Program</p>',
          Identify : this.IdentifyWatershedsDelegate
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_watersheds/MapServer",
                                                                 { opacity: 1.0 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.watersheds.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Nutrients & Sediment layer
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
          visible : savedState ? savedState.nutrientsVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_nutrients/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_nutrients/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: Chesapeake Bay Program (Watershed Model v4.3)</p>',
          Identify : this.IdentifyNutreientsDelegate
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_nutrients/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.nutrients.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Bathymetry layer
      this.layers.bathymetry = {
          name : "Water Depth (Bathymetry)",
          id : "FieldScope.Layer[bathymetry]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.bathymetry.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.bathymetry.visible = visible;
              FieldScope.DomUtils.show(this.layers.bathymetry.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.bathymetryVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_bathymetry/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_bathymetry/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: National Geographic Maps</p>'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_bathymetry/MapServer",
                                                                 { opacity: 0.75 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.bathymetry.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Percent Agricultural layer
      this.layers.agriculture = {
          name : "Percent Agricultural",
          id : "FieldScope.Layer[agriculture]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.agriculture.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.agriculture.visible = visible;
              FieldScope.DomUtils.show(this.layers.agriculture.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.agricultureVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_agriculture/MapServer/tile/10/392/295.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_agriculture/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: Chesapeake Bay Program; National Geographic Maps</p>'
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_agriculture/MapServer",
                                                                 { opacity: 0.55 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.agriculture.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // State Boundaries layer
      this.layers.states = {
          name : "State Boundaries",
          id : "FieldScope.Layer[states]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.states.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.states.visible = visible;
              FieldScope.DomUtils.show(this.layers.states.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.statesVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_states/MapServer/tile/6/24/18.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_states/MapServer')+'" />',
          Identify : this.IdentifyStateDelegate
        };
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_states/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.states.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Physiography layer
      this.layers.physiography = {
          name : "Physiographic Regions",
          id : "FieldScope.Layer[physiography]",
          IsVisible : Function.createDelegate(this, function () {
              return this.layers.physiography.visible;
            }),
          SetVisible : Function.createDelegate(this, function (visible) {
              this.layers.physiography.visible = visible;
              FieldScope.DomUtils.show(this.layers.physiography.loadingIndicator);
              // use setTimeout so the checkbox updates immediately
              window.setTimeout(this.UpdateMapType, 0);
            }),
          loadingIndicator : null,
          visible : savedState ? savedState.physiographyVisible : false,
          tileLayer : null,
          iconHTML : '<img src="'+this.urlPrefix+'/ArcGIS/rest/services/cb_physiography/MapServer/tile/6/24/18.png" style="height:16px" />',
          legendHTML : '<img src="ArcGISLegendService.ashx?srv='+encodeURIComponent(this.urlPrefix + '/ArcGIS/services/cb_physiography/MapServer')+'" />' +
                       '<p class="legendDataSource">Data Source: Chesapeake Bay Program; USGS</p>',
          Identify : this.IdentifyPhysiographyDelegate
        };
      
      window.setTimeout(Function.createDelegate(this, function () {
          // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
          // constructor again before the first one is finished causes IE6 to hang
          var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/cb_physiography/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function (layer) {
                                                                     this.layers.physiography.tileLayer = layer;
                                                                     this.UpdateMapType();
                                                                   }));
        }), 0);
      
      // Chesapeake "Then" layer
      var thenProvider = new FieldScope.MetaLens.GDataProvider(this.map, MetaLensService, "http://focus.metalens.org");
      thenProvider.keyword = "thenjs";
      thenProvider.icon = new GIcon(null, "images/cbthen.png");
      thenProvider.icon.shadow = "images/cbshadow.png";
      thenProvider.icon.iconSize = new GSize(15, 18);
      thenProvider.icon.shadowSize = new GSize(22, 19);
      thenProvider.icon.iconAnchor = new GPoint(7, 18);
      thenProvider.icon.infoWindowAnchor = new GPoint(7, 0);
      thenProvider.icon.infoShadowAnchor = new GPoint(22, 20);
      thenProvider.clusterIcon = new GIcon(thenProvider.icon, "images/cbthen-cl.png");
      thenProvider.clusterIcon.iconSize = new GSize(15, 23);
      thenProvider.clusterIcon.iconAnchor = new GPoint(7, 23);
      thenProvider.clusterIcon.infoShadowAnchor = new GPoint(22, 27);
      thenProvider.cssClass = "fieldscope_metalens_thenAndNow_window";
      this.layers.then = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, thenProvider),
                                                             "Chesapeake 1607",
                                                             "FieldScope.Layer[then]",
                                                             '<img src="images/cbthen.png" style="height:16px" />');
      this.layers.then.legendHTML = '<span>Stories from National Geographic\'s <a href="http://www.nationalgeographic.com/chesapeake/" target="_blank">Chesapeake--Then and Now</a></span>';
      this.layers.then.SetVisible(savedState ? savedState.thenVisible : false);
      
      // Chesapeake "Now" layer
      var nowProvider = new FieldScope.MetaLens.GDataProvider(this.map, MetaLensService, "http://focus.metalens.org");
      nowProvider.keyword = "nowjs";
      nowProvider.icon = new GIcon(null, "images/cbnow.png");
      nowProvider.icon.shadow = "images/cbshadow.png";
      nowProvider.icon.iconSize = new GSize(15, 18);
      nowProvider.icon.shadowSize = new GSize(22, 19);
      nowProvider.icon.iconAnchor = new GPoint(7, 18);
      nowProvider.icon.infoWindowAnchor = new GPoint(7, 0);
      nowProvider.icon.infoShadowAnchor = new GPoint(22, 20);
      nowProvider.clusterIcon = new GIcon(thenProvider.icon, "images/cbnow-cl.png");
      nowProvider.clusterIcon.iconSize = new GSize(15, 23);
      nowProvider.clusterIcon.iconAnchor = new GPoint(7, 23);
      nowProvider.clusterIcon.infoShadowAnchor = new GPoint(22, 27);
      nowProvider.cssClass = "fieldscope_metalens_thenAndNow_window";
      this.layers.now = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, nowProvider),
                                                            "Chesapeake Today",
                                                            "FieldScope.Layer[now]",
                                                            '<img src="images/cbnow.png" style="height:16px" />');
      this.layers.now.legendHTML = '<span>Stories from National Geographic\'s <a href="http://www.nationalgeographic.com/chesapeake/" target="_blank">Chesapeake--Then and Now</a></span>';
      this.layers.now.SetVisible(savedState ? savedState.nowVisible : false);
      
      // Photos layer
      var photosProvider = new FieldScope.MetaLens.GDataProvider(this.map, MetaLensService, "http://focus.metalens.org");
      photosProvider.keyword = "FieldScope";
      photosProvider.icon = new GIcon(null, "images/camera.png");
      photosProvider.icon.shadow = "images/camera-shadow.png";
      photosProvider.icon.iconSize = new GSize(24, 24);
      photosProvider.icon.shadowSize = new GSize(32, 24);
      photosProvider.icon.iconAnchor = new GPoint(19, 13);
      photosProvider.icon.infoWindowAnchor = new GPoint(19, 6);
      photosProvider.icon.infoShadowAnchor = new GPoint(24, 24);
      photosProvider.clusterIcon = new GIcon(photosProvider.icon, "images/camera-cl.png");
      photosProvider.cssClass = "fieldscope_metalens_photos_window";
      this.layers.photos = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, photosProvider),
                                                               "Photo Locations",
                                                               "FieldScope.Layer[photos]",
                                                               '<img src="images/camera.png" style="height:16px" />');
      this.layers.photos.SetVisible(savedState ? savedState.photosVisible : false);
      
      // CBIBS layer
      var cbibsProvider = new FieldScope.CBIBS.GDataProvider(this.map, CBIBSService);
      this.layers.cbibs = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, cbibsProvider),
                                                              "CBIBS",
                                                              "FieldScope.Layer[cbibs]",
                                                              '<img src="images/buoy.png" style="height:16px" />');
      this.layers.cbibs.legendHTML = '<span>Real-time water quality data from the <a href="http://www.buoybay.org/" target="_blank">Chesapeake Bay Interpretive Buoy System</a></span>';
      this.layers.cbibs.SetVisible(savedState ? savedState.cbibsVisible : false);
      
      // Student observations layer
      var observationsUrl = this.urlPrefix + "/ArcGIS/rest/services/cb_observations_2/MapServer/0";
      var observationsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, observationsUrl);
      observationsProvider.icon = new GIcon(null, "images/beaker.gif");
      observationsProvider.icon.shadow = "images/beaker-shadow.png";
      observationsProvider.icon.iconSize = new GSize(24, 24);
      observationsProvider.icon.shadowSize = new GSize(36, 24);
      observationsProvider.icon.iconAnchor = new GPoint(12, 24);
      observationsProvider.icon.infoWindowAnchor = new GPoint(8, 2);
      observationsProvider.icon.infoShadowAnchor = new GPoint(16, 8);
      observationsProvider.queryfields = [ "TEMPERATURE", "SALINITY", "TURBIDITY", "OXYGEN", "NITROGEN", "PHOSPHOROUS",
                                           "SCHOOL_NAME", "COLLECTION_DATE", "ENTRY_DATE", "FIELD_NOTES" ];
      var html = '<table style="border-collapse:collapse;" cellspacing="2">';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold;text-align:center" colspan="2">';
      html +=          '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
      html +=          '&nbsp;Student Observation';
      html +=        '</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Temperature:</td>';
      html +=        '<td>{TEMPERATURE} &deg;C</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Salinity:</td>';
      html +=        '<td>{SALINITY} PSU</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Turbidity:</td>';
      html +=        '<td>{TURBIDITY} NTU</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Oxygen:</td>';
      html +=        '<td>{OXYGEN} mg/L</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Nitrogen:</td>';
      html +=        '<td>{NITROGEN} mg/L</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="padding-bottom:4px;font-weight:bold">Phosphorus:</td>';
      html +=        '<td style="padding-bottom:4px">{PHOSPHOROUS} mg/L</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="border-top:thin ridge;padding-top:4px;font-weight:bold">School Name:</td>';
      html +=        '<td style="border-top:thin ridge;padding-top:4px">{SCHOOL_NAME}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="font-weight:bold">Collected:</td>';
      html +=        '<td>{COLLECTION_DATE}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="padding-bottom:4px;font-weight:bold">Entered:</td>';
      html +=        '<td style="padding-bottom:4px">{ENTRY_DATE}</td>';
      html +=      '</tr>';
      html +=      '<tr>';
      html +=        '<td style="border-top:thin ridge;padding-top:4px;font-weight:bold;vertical-align:top">Field Notes:</td>';
      html +=        '<td style="border-top:thin ridge;padding-top:4px" rowspan="2">';
      html +=          '<div style="max-width:200px">{FIELD_NOTES}</div>';
      html +=        '</td>';
      html +=      '</tr>';
      html +=    '</table>';
      observationsProvider.infoWindow = html;
      this.layers.observations = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, observationsProvider),
                                                                     "Student Observations",
                                                                     "FieldScope.Layer[observations]",
                                                                     '<img src="images/beaker.gif" style="height:16px" />');
      this.layers.observations.SetVisible(savedState ? savedState.observationsVisible : false);
      
      // Watershed boundary layer
      var studyAreaUrl = this.urlPrefix + "/ArcGIS/rest/services/cb_watersheds/MapServer/0";
      var studyAreaProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, studyAreaUrl);
      studyAreaProvider.fillStyle = {color: "#0000FF", opacity: 0.0};
      studyAreaProvider.lineStyle = {color: "#0000FF", opacity: 0.75, weight: 2};
      var studyAreaLegend = '<div style="width:10px;height:12px;border:2px solid #0000FF;opacity:0.75;filter:alpha(opacity=75)"></div>';
      this.layers.studyArea = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, studyAreaProvider),
                                                                   "Chesapeake Watershed",
                                                                   "FieldScope.Layer[studyArea]",
                                                                   studyAreaLegend);
      this.layers.studyArea.SetVisible(savedState ? savedState.studyAreaVisible : true);
      
      // 
      // The layerTree determines how the layers are presented to the user
      //
      this.layerTree = [ 
          null,
          this.layers.observations,
          this.layers.cbibs,
          this.layers.photos,
          [ { name    : "Chesapeake Then & Now", 
              id      : "FieldScope.LayerGroup[thenAndNow]", 
              visible : savedState ? savedState.thenAndNowOpen : false },
            this.layers.then,
            this.layers.now ],
          [ { name    : "Boundaries", 
              id      : "FieldScope.LayerGroup[boundaries]", 
              visible : savedState ? savedState.boundariesOpen : true },
            this.layers.studyArea,
            this.layers.watersheds,
            this.layers.states,
            this.layers.physiography ],
          [ { name    : "Land Use", 
              id      : "FieldScope.LayerGroup[landuse]", 
              visible : savedState ? savedState.landuseOpen : true },
            this.layers.landcover,
            this.layers.permeability,
            this.layers.impervious,
            this.layers.agriculture,
            this.layers.nutrients ],
          [ { name    : "Basemap", 
              id      : "FieldScope.LayerGroup[basemap]", 
              visible : savedState ? savedState.basemapOpen : true },
            this.layers.streets,
            this.layers.bathymetry,
            this.layers.satellite,
            this.layers.terrain ]
        ];
      
      //
      // Setup mouse modes
      //
      this.mouseModes.navigate = new FieldScope.NavigateMouseMode();
      this.mouseModes.placeObservation = new FieldScope.Observation.MouseMode(this.layers.observations.asyncLayer, 
                                                                              this.urlPrefix,
                                                                              "cb_observations_2");
      this.mouseModes.placePhoto = new FieldScope.MetaLens.MouseMode(this.layers.photos.asyncLayer, "http://focus.metalens.org");
      this.mouseModes.identify = new FieldScope.InfoMouseMode([this.layers.watersheds, 
                                                               this.layers.physiography, 
                                                               this.layers.states, 
                                                               this.layers.nutrients]);
      
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
      mapDiv.innerHTML = "Sorry, your browser is not compatable with Google Maps. Make sure Javascript is enabled.";
    }
    
    this.GetState = function () {
        return {
            centerLatitude : this.map.getCenter().lat(),
            centerLongitude : this.map.getCenter().lng(),
            zoomLevel : this.map.getZoom(),
            terrainVisible : this.layers.terrain.IsVisible(),
            satelliteVisible : this.layers.satellite.IsVisible(),
            streetsVisible : this.layers.streets.IsVisible(),
            landcoverVisible : this.layers.landcover.IsVisible(),
            permeabilityVisible : this.layers.permeability.IsVisible(),
            imperviousVisible : this.layers.impervious.IsVisible(),
            watershedsVisible : this.layers.watersheds.IsVisible(),
            nutrientsVisible : this.layers.nutrients.IsVisible(),
            bathymetryVisible : this.layers.bathymetry.IsVisible(),
            agricultureVisible : this.layers.agriculture.IsVisible(),
            statesVisible : this.layers.states.IsVisible(),
            thenVisible : this.layers.then.IsVisible(),
            nowVisible : this.layers.now.IsVisible(),
            photosVisible : this.layers.photos.IsVisible(),
            cbibsVisible : this.layers.cbibs.IsVisible(),
            observationsVisible : this.layers.observations.IsVisible(),
            studyAreaVisible : this.layers.studyArea.IsVisible(),
            physiographyVisible : this.layers.physiography.IsVisible(),
            thenAndNowOpen : FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[thenAndNow]")),
            boundariesOpen : FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[boundaries]")),
            landuseOpen : FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[landuse]")),
            basemapOpen : FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[basemap]"))
          };
      };
  };

FieldScope.Application.registerClass('FieldScope.Application');

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }