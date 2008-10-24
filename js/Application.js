/*global FieldScope, esri, Sys, Type $get $addHandler CBIBSService MetaLensService */
/*global GBrowserIsCompatible GMap2  GLargeMapControl G_HYBRID_MAP G_PHYSICAL_MAP G_SATELLITE_MAP */
/*global GEvent GIcon GLatLng GMapType GMarker GOverviewMapControl GPoint GSize */

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

FieldScope.Application = function(savedState,
                                   mapDiv,
                                   updateLayerControlsFn,
                                   getSearchTextFn,
                                   appendSearchResultsFn) {

  this.urlPrefix = "http://" + FieldScope.StringUtils.removePortNumber(location.host);

  this.map = null;
  this.overview = null;
  this.mapExtension = null;

  this.searchTool = null;
  this.searchResultCount = 0;
  this.GetSearchText = getSearchTextFn;
  this.AppendSearchResults = appendSearchResultsFn;
  this.UpdateLayerControls = updateLayerControlsFn;

  this.OnSearchKey = Function.createDelegate(this, function(event) {
    if (/* backspace */(event.keyCode === 0x08) ||
    /* ascii */((event.keyCode >= 0x20) && (event.keyCode <= 0x7E)) ||
    /* delete */(event.keyCode === 0x7F) ||
    /* extended */(event.keyCode >= 0xA0)) {
      this.searchTool.ClearSearchResults();
    } else if (/* return */event.keyCode === 0x0D) {
      event.cancelBubble = true;
      event.returnValue = false;
      if (event.preventDefault) {
        event.preventDefault();
      }
      this.searchResultCount = 0;
      this.searchTool.DoSearch(this.GetSearchText());
      return false;
    }
  });

  this.OnSearchClick = Function.createDelegate(this, function(event) {
    this.searchResultCount = 0;
    this.searchTool.DoSearch(this.GetSearchText());
  });

  this.OnSearchResult = Function.createDelegate(this, function(result) {
    if (result != null) {
      this.searchResultCount += 1;
    }
    this.AppendSearchResults(result);
  });

  this.OnFinishSearch = Function.createDelegate(this, function(evt) {
    if (this.searchResultCount === 0) {
      this.AppendSearchResults(document.createTextNode("Location not found"));
    }
    this.searchResultCount = 0;
  });

  this.mouseModes = {
    navigate: null,
    placeObservation: null,
    placePhoto: null,
    identify: null
  };

  this.currentMouseMode = null;

  this.SetMouseMode = function(newMode) {
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
    terrain: {},
    satellite: {},
    streets: {},
    // ArcGIS Tile layers
    landcover: {},
    permeability: {},
    impervious: {},
    watersheds: {},
    nutrients: {},
    bathymetry: {},
    agriculture: {},
    states: {},
    physiography: {},
    smithtrail: {},
    // Async point layers
    then: {},
    now: {},
    photos: {},
    cbibs: {},
    observations: {},
    // Async polygon layers
    studyArea: {}
  };

  this.UpdateMapType = Function.createDelegate(this, function() {
    var tileLayers = [];
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
    if (this.layers.smithtrail.tileLayer && this.layers.smithtrail.visible) {
      tileLayers.push(this.layers.smithtrail.tileLayer);
    }
    if (this.layers.streets.tileLayer && this.layers.streets.visible) {
      tileLayers.push(this.layers.streets.tileLayer);
    }
    this.map.setMapType(new GMapType(tileLayers,
                                         G_SATELLITE_MAP.getProjection(),
                                         "FieldScope",
                                         { errorMessage: "No data available",
                                           maxResolution: 15,
                                           minResolution: 6
                                         }));
    this.overview.setMapType(G_PHYSICAL_MAP);
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
    FieldScope.DomUtils.hide(this.layers.smithtrail.loadingIndicator);
    FieldScope.DomUtils.hide(this.layers.streets.loadingIndicator);
  });

  this.IdentifyWatershedsDelegate = Function.createDelegate(this, function(loc, callback) {
    var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/watersheds/MapServer/3");
    var query = new esri.arcgis.gmaps.Query();
    query.queryGeometry = loc;
    query.returnGeometry = false;
    query.outFields = ["HUC4_NAME", "HUC8_NAME", "HUC11_NAME"];
    task.execute(query, false, function(result) {
      if (result.features && (result.features.length > 0)) {
        var attributes = result.features[0].attributes;
        var html = '';
        html += '<table>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:center" colspan="2">';
        html += '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
        html += '&nbsp;Watershed Boundaries';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:right">Subregion (USGS HUC4):</td>';
        html += '<td>';
        html += attributes.HUC4_NAME;
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:right">Subbasin (HUC8):</td>';
        html += '<td>';
        html += attributes.HUC8_NAME;
        html += '</td>';
        html += '</tr>';
        html += '<td style="font-weight:bold;text-align:right">Local Watershed (HUC11):</td>';
        html += '<td>';
        html += attributes.HUC11_NAME;
        html += '</td>';
        html += '</tr>';
        html += '</table>';
        callback.call(this, loc, "Watersheds", html);
      }
    });
  });

  this.IdentifyNutreientsDelegate = Function.createDelegate(this, function(loc, callback) {
    var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/nutrients/MapServer/0");
    var query = new esri.arcgis.gmaps.Query();
    query.queryGeometry = loc;
    query.returnGeometry = false;
    query.outFields = ["TRIB_BAS_1",
                            "AG_TP_PER", "FOR_TP_PER", "MIX_TP_PER", "URB_TP_PER", "DEP_TP_PER", "PNT_TP_PER",
                            "AG_TN_PER", "FOR_TN_PER", "MIX_TN_PER", "URB_TN_PER", "DEP_TN_PER", "PNT_TN_PER",
                            "AG_SD_PER", "FOR_SD_PER", "MIX_SD_PER", "URB_SD_PER"];
    task.execute(query, false, function(result) {
      if (result.features && (result.features.length > 0)) {
        var attributes = result.features[0].attributes;
        var html = '';
        html += '<table>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:center" colspan="3">';
        html += '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
        html += '&nbsp;Sources of Nutrient & Sediment Runoff';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold">Basin:</td>';
        html += '<td id="FieldScope_Runoff_Basin">';
        html += attributes.TRIB_BAS_1;
        html += '</td>';
        html += '<td align="right">';
        html += '<img id="FieldScope_CBIBS_SaveGraph_Button"';
        html += ' style="display:block;border:2px outset"';
        html += ' src="images/clipboard-large.gif"';
        html += ' alt="Save"';
        html += ' onclick="document.FieldScopeNutrientsSaveGraph($get(\'FieldScope_Runoff_Basin\'),';
        html += '$get(\'FieldScope_Runoff_Phosphorous\'),';
        html += '$get(\'FieldScope_Runoff_Nitrogen\'),';
        html += '$get(\'FieldScope_Runoff_Sediment\'));"';
        html += ' onmousedown="this.style.borderStyle=\'inset\';"';
        html += ' onmouseup="this.style.borderStyle=\'outset\';"';
        html += ' onmouseout="this.style.borderStyle=\'outset\';" />';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold">Phosphorous:</td>';
        html += '<td colspan="2">';
        html += '<img src="http://chart.apis.google.com/chart';
        html += '?cht=p';
        html += '&chs=220x75';
        html += '&chd=t:';
        html += attributes.AG_TP_PER + ',' + attributes.FOR_TP_PER + ',';
        html += attributes.MIX_TP_PER + ',' + attributes.URB_TP_PER + ',';
        html += attributes.DEP_TP_PER + ',' + attributes.PNT_TP_PER;
        html += '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
        html += '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"';
        html += ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Phosphorous" />';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold">Nitrogen:</td>';
        html += '<td colspan="2">';
        html += '<img src="http://chart.apis.google.com/chart';
        html += '?cht=p';
        html += '&chs=220x75';
        html += '&chd=t:';
        html += attributes.AG_TN_PER + ',' + attributes.FOR_TN_PER + ',';
        html += attributes.MIX_TN_PER + ',' + attributes.URB_TN_PER + ',';
        html += attributes.DEP_TN_PER + ',' + attributes.PNT_TN_PER;
        html += '&chl=Agriculture|Forest|Mixed%20Use|Urban|Atmosphere|Point%20Source';
        html += '&chco=E1E298,35824D,BCBCE6,FAAB9F,AACFC9,B2B2B2"';
        html += ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Nitrogen" />';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold">Sediment:</td>';
        html += '<td colspan="2">';
        html += '<img src="http://chart.apis.google.com/chart';
        html += '?cht=p';
        html += '&chs=220x75';
        html += '&chd=t:';
        html += attributes.AG_SD_PER + ',' + attributes.FOR_SD_PER + ',';
        html += attributes.MIX_SD_PER + ',' + attributes.URB_SD_PER;
        html += '&chl=Agriculture|Forest|Mixed%20Use|Urban';
        html += '&chco=E1E298,35824D,BCBCE6,FAAB9F"';
        html += ' width="220" height="75" alt="chart missing" id="FieldScope_Runoff_Sediment" /></td>';
        html += '</tr>';
        html += '</table>';
        callback.call(this, loc, "Runoff", html);
      }
    });
  });

  document.FieldScopeNutrientsSaveGraph = function(basinTd, phosphorousImg, nitrogenImg, sedimentImg) {
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
    if (false/*@cc_on || true@*/) {
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
    closeButton.onclick = function() {
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

  this.IdentifyStateDelegate = Function.createDelegate(this, function(loc, callback) {
    var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/states/MapServer/0");
    var query = new esri.arcgis.gmaps.Query();
    query.queryGeometry = loc;
    query.returnGeometry = false;
    query.outFields = ["cb_states.STATE_NAME", "cb_states_2.AREA_SQMI"];
    task.execute(query, false, function(result) {
      if (result.features && (result.features.length > 0)) {
        var attributes = result.features[0].attributes;
        var html = '';
        html += '<table>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:center" colspan="2">';
        html += '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
        html += '&nbsp;State';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:right">Name:</td>';
        html += '<td>';
        html += attributes["cb_states.STATE_NAME"];
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:right">Area in Watershed:</td>';
        html += '<td>';
        html += attributes["cb_states_2.AREA_SQMI"];
        html += 'mi<sup>2</sup>';
        html += '</td>';
        html += '</tr>';
        html += '</table>';
        callback.call(this, loc, "State", html);
      }
    });
  });

  this.IdentifyPhysiographyDelegate = Function.createDelegate(this, function(loc, callback) {
    var task = new esri.arcgis.gmaps.QueryTask(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/physiography/MapServer/0");
    var query = new esri.arcgis.gmaps.Query();
    query.queryGeometry = loc;
    query.returnGeometry = false;
    query.outFields = ["provNames5.NAME"];
    task.execute(query, false, function(result) {
      if (result.features && (result.features.length > 0)) {
        var attributes = result.features[0].attributes;
        var html = '';
        html += '<table>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:center" colspan="2">';
        html += '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
        html += '&nbsp;Physiographic Region';
        html += '</td>';
        html += '</tr>';
        html += '<tr>';
        html += '<td style="font-weight:bold;text-align:right">Name:</td>';
        html += '<td>';
        html += attributes["provNames5.NAME"];
        html += '</td>';
        html += '</tr>';
        html += '</table>';
        callback.call(this, loc, "Region", html);
      }
    });
  });

  this.OnResetDelegate = Function.createDelegate(this, function(evt) {
    this.layers.terrain.visible = true;
    this.layers.satellite.visible = false;
    this.layers.streets.visible = false;
    this.layers.landcover.visible = false;
    this.layers.permeability.visible = false;
    this.layers.impervious.visible = false;
    this.layers.watersheds.visible = false;
    this.layers.nutrients.visible = false;
    this.layers.bathymetry.visible = false;
    this.layers.agriculture.visible = false;
    this.layers.states.visible = false;
    this.layers.physiography.visible = false;
    this.layers.smithtrail.visible = false;
    this.UpdateMapType();
    this.layers.then.SetVisible(false);
    this.layers.now.SetVisible(false);
    this.layers.photos.SetVisible(false);
    this.layers.cbibs.SetVisible(false);
    this.layers.observations.SetVisible(false);
    this.layers.studyArea.SetVisible(true);
    this.UpdateLayerControls();
  });

  //
  // Here is where we actually do the setup, now that our methods have all been defined
  //
  if (GBrowserIsCompatible()) {
    if (false/*@cc_on || true@*/) {
      //HACK - the overview doesn't work properly in IE unless we do this
      mapDiv.style.width = "100%";
    }
    this.map = new GMap2(mapDiv);
    var blankMap = new GMapType([], G_SATELLITE_MAP.getProjection(), "FieldScope", { maxResolution: 15, minResolution: 6 });
    this.map.setCenter(new GLatLng(39.9265, -77.2558), 6, blankMap);
    this.overview = new GOverviewMapControl();
    this.map.addControl(this.overview);
    if (savedState) {
      this.map.setCenter(new GLatLng(savedState.centerLatitude, savedState.centerLongitude), savedState.zoomLevel, blankMap);
    }
    this.map.addControl(new GLargeMapControl());

    this.map.addControl(new HtmlControl('<div class="latLonControl"><div id="FieldScope.LatLon"></div></div>'),
                        new GControlPosition(G_ANCHOR_TOP_RIGHT, new GSize(6, 4)));
    GEvent.addListener(this.map, "mousemove", function(latlng) {
      $get("FieldScope.LatLon").innerHTML = latlng.lat().toFixed(4) + ", " + latlng.lng().toFixed(4);
    });

    this.map.enableScrollWheelZoom();
    this.map.disableDoubleClickZoom();
    this.mapExtension = new esri.arcgis.gmaps.MapExtension(this.map);
    // Force Google Maps to load info window code & create the info window object
    var dummy1 = this.map.getInfoWindow();
    var dummy2 = this.map.getExtInfoWindow();

    this.searchTool = new FieldScope.GSearch(this.map,
                                             [this.urlPrefix + "/arcgis/services/fieldscope_cb_1/school_address/GeocodeServer"],
                                             this.OnSearchResult);
    this.searchTool.AttachEvent("onfinishsearch", this.OnFinishSearch);

    //HACKETY HACK HACK- method for finding the reset button in the GLargeMapControl
    // thanks to http://groups.google.com.pk/group/Google-Maps-API/browse_thread/thread/42afb33cb2c94d49
    var divs = this.map.getContainer().getElementsByTagName('div');
    var resetButtonDiv;
    for (var i = 0; i < divs.length; i += 1) {
      if (divs[i].getAttribute('log') === 'center_result') {
        resetButtonDiv = divs[i];
      }
    }
    if (resetButtonDiv) {
      $addHandler(resetButtonDiv, "click", this.OnResetDelegate);
    }

    // Terrain layer
    this.layers.terrain = {
      name: "Terrain",
      id: "FieldScope.Layer[terrain]",
      group: "basemap",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.terrain.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.terrain.visible = visible;
        this.layers.satellite.visible = !visible;
        FieldScope.DomUtils.show(this.layers.terrain.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.terrainVisible : true,
      tileLayer: G_PHYSICAL_MAP.getTileLayers()[0],
      iconHTML: '<img src="images/terrain.jpg" style="height:16px" />'
    };

    // Satellite layer
    this.layers.satellite = {
      name: "Satellite",
      id: "FieldScope.Layer[satellite]",
      group: "basemap",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.satellite.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.satellite.visible = visible;
        this.layers.terrain.visible = !visible;
        FieldScope.DomUtils.show(this.layers.satellite.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.satelliteVisible : false,
      tileLayer: G_HYBRID_MAP.getTileLayers()[0],
      iconHTML: '<img src="images/satellite.jpg" style="height:16px" />'
    };

    // Streets layer
    this.layers.streets = {
      name: "Streets & Places",
      id: "FieldScope.Layer[streets]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.streets.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.streets.visible = visible;
        FieldScope.DomUtils.show(this.layers.streets.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.streetsVisible : false,
      tileLayer: G_HYBRID_MAP.getTileLayers()[1],
      iconHTML: '<img src="http://mt2.google.com/mt?n=404&v=apt.75&hl=en&x=292&y=391&zoom=7&s=Gal" style="height:16px" />'
    };

    // Impervious surfaces layer
    this.layers.permeability = {
      name: "Impervious Surfaces",
      id: "FieldScope.Layer[permeability]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.permeability.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.permeability.visible = visible;
        FieldScope.DomUtils.show(this.layers.permeability.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.permeabilityVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/impermeability/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Impervious Surfaces</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/impermeability/MapServer') + '" />' +
                      '<p class="legendInfo">' +
                      '  Impervious surfaces such as roads and parking lots do not allow water to easily penetrate and prevent ' +
                      '  rainfall from entering the groundwater system. This causes surface runoff and introduces non-point ' +
                      '  source pollution into waterways.' +
                      '</p>' +
                      '<p class="legendInfo">' +
                      '  In the raster image, cells with a value closer to 100 are highly impervious. Areas with a value ' +
                      '  closer to zero are more permeable by rainfall. Impervious surfaces give us an indication of development ' +
                      '  in a given area.' +
                      '</p>' +
                      '<p class="legendDataSource">Data Source: MRLC National Landcover Dataset 2001</p>'
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/impermeability/MapServer",
                                                                 { opacity: 0.5 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.permeability.tileLayer = layer;
                                                                   if (this.layers.permeability.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Land Cover layer
    this.layers.landcover = {
      name: "Land Cover",
      id: "FieldScope.Layer[landcover]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.landcover.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.landcover.visible = visible;
        FieldScope.DomUtils.show(this.layers.landcover.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.landcoverVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/landcover/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Land Cover</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/landcover/MapServer') + '" />' +
                      '<p class="legendDataSource">Data Source: Chesapeake Bay Program (Watershed Model v5.0)</p>'
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/landcover/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.landcover.tileLayer = layer;
                                                                   if (this.layers.landcover.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Percent impervious layer
    this.layers.impervious = {
      name: "Percent Impervious",
      id: "FieldScope.Layer[impervious]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.impervious.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.impervious.visible = visible;
        FieldScope.DomUtils.show(this.layers.impervious.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.imperviousVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/impervious/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Percent Impervious</p>' +
                       '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/impervious/MapServer') + '" />' +
                       '<p class="legendDataSource">Data Source: MRLC National Landcover Dataset 2001; Chesapeake Bay Program</p>'
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/impervious/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.impervious.tileLayer = layer;
                                                                   if (this.layers.impervious.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Watershed boundaries layer
    this.layers.watersheds = {
      name: "Watershed Boundaries",
      id: "FieldScope.Layer[watersheds]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.watersheds.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.watersheds.visible = visible;
        FieldScope.DomUtils.show(this.layers.watersheds.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.watershedsVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/watersheds/MapServer/tile/6/24/18.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Watershed Boundaries</p>' +
                       '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/watersheds/MapServer') + '" /> ' +
                       '<p class="legendInfo">' +
                       '  The U.S. Geological Survey (USGS) divides watershed into successively smaller units, or sub-watersheds, ' +
                       '  based on surface hydrologic features. Sub-watersheds are organized using a system of Hydrologic Unit Codes (HUCs). ' +
                       '  The USGS divides the Chesapeake Bay watershed into 4 sub-regions (HUC4), 58 sub-basins (HUC8) and 506 local watersheds (HUC11).' +
                       '</p>' +
                       '<p class="legendInfo">' +
                       '  A watershed is a dynamic system connected by a network of streams, rivers and groundwater flow. A sub-watershed is a system ' +
                       '  within a system. Investigating sub-watersheds offers the opportunity to engage in localized watershed studies. ' +
                       '</p>' +
                       '<p class="legendDataSource">Data Source: USGS; Chesapeake Bay Program</p>',
      Identify: this.IdentifyWatershedsDelegate
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/watersheds/MapServer",
                                                                 { opacity: 1.0 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.watersheds.tileLayer = layer;
                                                                   if (this.layers.watersheds.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Nutrients & Sediment layer
    this.layers.nutrients = {
      name: "Nutrients & Sediment",
      id: "FieldScope.Layer[nutrients]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.nutrients.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.nutrients.visible = visible;
        FieldScope.DomUtils.show(this.layers.nutrients.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.nutrientsVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/nutrients/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Nutrients & Sediment</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/nutrients/MapServer') + '" />' +
                      '<p class="legendInfo">' +
                      '  Excess nutrients and sediment are introduced to waterways by non-point and point source pollution. The vector ' +
                      '  map depicts the yield of total nitrogen pollution (from point and non-point sources) to modeling segments ' +
                      '  defined by the Chesapeake Bay Program.' +
                      '</p>' +
                      '<p class="legendInfo">' +
                      '  Use the query tool to click on the map to see a breakdown of nutrient and sediment pollution in an area from ' +
                      '  point and non-point sources. The categories used are:' +
                      '</p>' +
                      '<ol class="legendInfo">' +
                      '  <li>Urban</li>' +
                      '  <li>Mixed use (suburban)</li>' +
                      '  <li>Forest</li>' +
                      '  <li>Agriculture</li>' +
                      '  <li>Point Source</li>' +
                      '  <li>Atmospheric Deposition</li>' +
                      '</ol>' +
                      '<p class="legendDataSource">Data Source: Chesapeake Bay Program (Watershed Model v4.3)</p>',
      Identify: this.IdentifyNutreientsDelegate
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/nutrients/MapServer",
                                                                 { opacity: 0.45 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.nutrients.tileLayer = layer;
                                                                   if (this.layers.nutrients.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Bathymetry layer
    this.layers.bathymetry = {
      name: "Water Depth (Bathymetry)",
      id: "FieldScope.Layer[bathymetry]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.bathymetry.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.bathymetry.visible = visible;
        FieldScope.DomUtils.show(this.layers.bathymetry.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.bathymetryVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/bathymetry/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Bathymetry</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/bathymetry/MapServer') + '" />' +
                      '<p class="legendDataSource">Data Source: National Geographic Maps</p>'
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/bathymetry/MapServer",
                                                                 { opacity: 0.75 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.bathymetry.tileLayer = layer;
                                                                   if (this.layers.bathymetry.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Percent Agricultural layer
    this.layers.agriculture = {
      name: "Percent Agricultural",
      id: "FieldScope.Layer[agriculture]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.agriculture.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.agriculture.visible = visible;
        FieldScope.DomUtils.show(this.layers.agriculture.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.agricultureVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/agriculture/MapServer/tile/10/392/295.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Percent Agricultural</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/agriculture/MapServer') + '" />' +
                      '<p class="legendDataSource">Data Source: Chesapeake Bay Program; National Geographic Maps</p>'
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/agriculture/MapServer",
                                                                 { opacity: 0.55 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.agriculture.tileLayer = layer;
                                                                   if (this.layers.agriculture.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // State Boundaries layer
    this.layers.states = {
      name: "State Boundaries",
      id: "FieldScope.Layer[states]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.states.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.states.visible = visible;
        FieldScope.DomUtils.show(this.layers.states.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.statesVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/states/MapServer/tile/6/24/18.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">State Boundaries</p>' +
                      '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/states/MapServer') + '" />',
      Identify: this.IdentifyStateDelegate
    };
    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/states/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.states.tileLayer = layer;
                                                                   if (this.layers.states.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);

    // Physiography layer
    this.layers.physiography = {
      name: "Physiographic Regions",
      id: "FieldScope.Layer[physiography]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.physiography.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.physiography.visible = visible;
        FieldScope.DomUtils.show(this.layers.physiography.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.physiographyVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/physiography/MapServer/tile/6/24/18.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">Physiographic Regions</p>' +
                       '<img src="ArcGISLegendService.ashx?srv=' + encodeURIComponent(this.urlPrefix + '/ArcGIS/services/fieldscope_cb_1/physiography/MapServer') + '" /> ' +
                       '<p class="legendInfo">' +
                       '  Physiographic regions are surface areas defined by distinct terrain texture and geologic structure and history. ' +
                       '  In the Chesapeake Bay watershed there are eight distinct physiographic regions. The features within a region help ' +
                       '  to define the flow of rivers and streams and other watershed processes. A region\'s characteristics also help to ' +
                       '  define what type of development the land is best suited for.' +
                       '</p>' +
                       '<p class="legendDataSource">Data Source: Chesapeake Bay Program; USGS</p>',
      Identify: this.IdentifyPhysiographyDelegate
    };

    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/physiography/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                   this.layers.physiography.tileLayer = layer;
                                                                   if (this.layers.physiography.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
                                                                 }));
    }), 0);
    
    // John Smith Trail layer
    this.layers.smithtrail = {
      name: "John Smith Trail",
      id: "FieldScope.Layer[smithtrail]",
      IsVisible: Function.createDelegate(this, function() {
        return this.layers.smithtrail.visible;
      }),
      SetVisible: Function.createDelegate(this, function(visible) {
        this.layers.smithtrail.visible = visible;
        FieldScope.DomUtils.show(this.layers.smithtrail.loadingIndicator);
        // use setTimeout so the checkbox updates immediately
        window.setTimeout(this.UpdateMapType, 0);
      }),
      loadingIndicator: null,
      visible: savedState ? savedState.smithtrailVisible : false,
      tileLayer: null,
      iconHTML: '<img src="' + this.urlPrefix + '/ArcGIS/rest/services/fieldscope_cb_1/smith/MapServer/tile/6/24/18.png" style="height:16px" />',
      legendHTML: '<p class="legendTitle">John Smith Trail</p>' +
                       '<p class="legendInfo">' +
                       '  The Captain John Smith Chesapeake National Historic Trail. ' +
                       '  <a href="http://www.nps.gov/cajo/">NPS Site</a> |' + 
                       '  <a href="http://cbf.typepad.com/johnsmith/">Blog</a>' +
                       '</p>' +
                       '<p class="legendDataSource">Data Source: USGS; National Park Service</p>'
    };

    window.setTimeout(Function.createDelegate(this, function() {
      // We have to do this with setTimeout, because calling TiledMapServiceLayer's 
      // constructor again before the first one is finished causes IE6 to hang
      var dummy = new esri.arcgis.gmaps.TiledMapServiceLayer(this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/smith/MapServer",
                                                                 { opacity: 0.65 },
                                                                 Function.createDelegate(this, function(layer) {
                                                                  this.layers.smithtrail.tileLayer = layer;
                                                                    if (this.layers.smithtrail.IsVisible()) {
                                                                     this.UpdateMapType();
                                                                   }
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
    this.layers.then.legendHTML = '<p class="legendTitle">Chesapeake 1607</p>' +
                                    '<p class="legendInfo">' +
                                    '  Stories from National Geographic\'s ' +
                                    '  <a href="http://www.nationalgeographic.com/chesapeake/" target="_blank">Chesapeake--Then and Now</a>' +
                                    '</p>';
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
    this.layers.now.legendHTML = '<p class="legendTitle">Chesapeake Today</p>' +
                                   '<p class="legendInfo">' +
                                   '  Stories from National Geographic\'s ' +
                                   '  <a href="http://www.nationalgeographic.com/chesapeake/" target="_blank">Chesapeake--Then and Now</a>' +
                                   '</p>';
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
    this.layers.cbibs.legendHTML = '<p class="legendTitle">CBIBS</p>' +
                                     '<p class="legendInfo">' +
                                     '  Real-time water quality data from the ' +
                                     '  <a href="http://www.buoybay.org/" target="_blank">Chesapeake Bay Interpretive Buoy System</a>' +
                                     '</p>';
    this.layers.cbibs.SetVisible(savedState ? savedState.cbibsVisible : false);

    // Student observations layer
    var observationsUrl = this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/observations/MapServer/0";
    var observationsProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, observationsUrl);
    observationsProvider.icon = new GIcon(null, "images/beaker.gif");
    observationsProvider.icon.shadow = "images/beaker-shadow.png";
    observationsProvider.icon.iconSize = new GSize(24, 24);
    observationsProvider.icon.shadowSize = new GSize(36, 24);
    observationsProvider.icon.iconAnchor = new GPoint(12, 24);
    observationsProvider.icon.infoWindowAnchor = new GPoint(8, 2);
    observationsProvider.icon.infoShadowAnchor = new GPoint(16, 8);
    observationsProvider.queryfields = ["WATER_TEMPERATURE", "AIR_TEMPERATURE",
                                        "SALINITY", "RELATIVE_HUMIDITY",
                                        "CONDUCTIVITY", "BAROMETRIC_PRESSURE",
                                        "TURBIDITY", "PH",
                                        "SECCHI_DEPTH", "DISSOLVED_OXYGEN",
                                        "NITRATE", "PHOSPHATE",
                                        "AMMONIA",
                                        "SCHOOL", "COLLECTION_DATE", "ENTRY_DATE", "FIELD_NOTES"];
    var html = '<table style="border-collapse:collapse;" cellspacing="2">';
    html += '<tr>';
    html += '<td style="font-weight:bold;text-align:center" colspan="4">';
    html += '<img src="images/info24.png" style="vertical-align:middle" height="16" />';
    html += '&nbsp;Student Observation';
    html += '</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Water Temperature:</td>';
    html += '<td>{WATER_TEMPERATURE} &deg;C</td>';
    html += '<td style="font-weight:bold">Air Temperature:</td>';
    html += '<td>{AIR_TEMPERATURE} &deg;C</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Salinity:</td>';
    html += '<td>{SALINITY} PSU</td>';
    html += '<td style="font-weight:bold">Relative Humidity:</td>';
    html += '<td>{RELATIVE_HUMIDITY} %</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Conductivity:</td>';
    html += '<td>{CONDUCTIVITY} NTU</td>';
    html += '<td style="font-weight:bold">Barometric Pressure:</td>';
    html += '<td>{BAROMETRIC_PRESSURE} mbar</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Turbidity:</td>';
    html += '<td>{TURBIDITY} NTU</td>';
    html += '<td style="font-weight:bold">pH:</td>';
    html += '<td>{PH}</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Secchi Depth:</td>';
    html += '<td>{SECCHI_DEPTH} cm</td>';
    html += '<td style="font-weight:bold">Oxygen:</td>';
    html += '<td>{DISSOLVED_OXYGEN} mg/L</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Nitrate:</td>';
    html += '<td>{NITRATE} mg/L</td>';
    html += '<td style="font-weight:bold">Phosphate:</td>';
    html += '<td>{PHOSPHATE} mg/L</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="padding-bottom:4px;font-weight:bold">Ammonia:</td>';
    html += '<td style="padding-bottom:4px" colspan="3">{AMMONIA} mg/L</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="border-top:thin ridge;padding-top:4px;font-weight:bold">School Name:</td>';
    html += '<td style="border-top:thin ridge;padding-top:4px" colspan="3">{SCHOOL}</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="font-weight:bold">Collected:</td>';
    html += '<td>{COLLECTION_DATE}</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="padding-bottom:4px;font-weight:bold">Entered:</td>';
    html += '<td style="padding-bottom:4px">{ENTRY_DATE}</td>';
    html += '</tr>';
    html += '<tr>';
    html += '<td style="border-top:thin ridge;padding-top:4px;font-weight:bold;vertical-align:top">Field Notes:</td>';
    html += '<td style="border-top:thin ridge;padding-top:4px" colspan="3" rowspan="2" >';
    html += '<div style="max-width:200px">{FIELD_NOTES}</div>';
    html += '</td>';
    html += '</tr>';
    html += '</table>';
    observationsProvider.infoWindow = html;
    this.layers.observations = new FieldScope.AsyncLayerController(new FieldScope.GAsyncLayer(this.map, observationsProvider),
                                                                     "Student Observations",
                                                                     "FieldScope.Layer[observations]",
                                                                     '<img src="images/beaker.gif" style="height:16px" />');
    this.layers.observations.SetVisible(savedState ? savedState.observationsVisible : false);

    // Watershed boundary layer
    var studyAreaUrl = this.urlPrefix + "/ArcGIS/rest/services/fieldscope_cb_1/watersheds/MapServer/0";
    var studyAreaProvider = new FieldScope.ArcGISServer.GDataProvider(this.mapExtension, studyAreaUrl);
    studyAreaProvider.fillStyle = { color: "#0000FF", opacity: 0.0 };
    studyAreaProvider.lineStyle = { color: "#0000FF", opacity: 0.75, weight: 2 };
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
          [{ name: "Chesapeake History",
             id: "FieldScope.LayerGroup[thenAndNow]",
             visible: savedState ? savedState.thenAndNowOpen : false },
            this.layers.then,
            this.layers.now,
            this.layers.smithtrail],
          [{ name: "Boundaries",
             id: "FieldScope.LayerGroup[boundaries]",
             visible: savedState ? savedState.boundariesOpen : true },
            this.layers.studyArea,
            this.layers.watersheds,
            this.layers.states,
            this.layers.physiography],
          [{ name: "Land Use",
              id: "FieldScope.LayerGroup[landuse]",
            visible: savedState ? savedState.landuseOpen : true },
            this.layers.landcover,
            this.layers.permeability,
            this.layers.impervious,
            this.layers.agriculture,
            this.layers.nutrients],
          [{ name: "Basemap",
             id: "FieldScope.LayerGroup[basemap]",
             visible: savedState ? savedState.basemapOpen : true },
            this.layers.streets,
            this.layers.bathymetry,
            this.layers.satellite,
            this.layers.terrain]
        ];

    //
    // Setup mouse modes
    //
    this.mouseModes.navigate = new FieldScope.NavigateMouseMode();
    this.mouseModes.placeObservation = new FieldScope.Observation.MouseMode(this.layers.observations.asyncLayer,
                                                                            this.urlPrefix + "/ArcGIS/services/fieldscope_cb_1/observations",
                                                                            "observations");
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
    this.UpdateMapType();

  } else {
    //
    //TODO: provide information about how to enable Javascript, what
    // browsers are supported, etc...
    //
    mapDiv.innerHTML = "Sorry, your browser is not compatable with Google Maps. Make sure Javascript is enabled.";
  }

  this.GetState = function() {
    return {
      centerLatitude: this.map.getCenter().lat(),
      centerLongitude: this.map.getCenter().lng(),
      zoomLevel: this.map.getZoom(),
      terrainVisible: this.layers.terrain.IsVisible(),
      satelliteVisible: this.layers.satellite.IsVisible(),
      streetsVisible: this.layers.streets.IsVisible(),
      landcoverVisible: this.layers.landcover.IsVisible(),
      permeabilityVisible: this.layers.permeability.IsVisible(),
      imperviousVisible: this.layers.impervious.IsVisible(),
      watershedsVisible: this.layers.watersheds.IsVisible(),
      nutrientsVisible: this.layers.nutrients.IsVisible(),
      bathymetryVisible: this.layers.bathymetry.IsVisible(),
      agricultureVisible: this.layers.agriculture.IsVisible(),
      statesVisible: this.layers.states.IsVisible(),
      thenVisible: this.layers.then.IsVisible(),
      nowVisible: this.layers.now.IsVisible(),
      photosVisible: this.layers.photos.IsVisible(),
      cbibsVisible: this.layers.cbibs.IsVisible(),
      observationsVisible: this.layers.observations.IsVisible(),
      studyAreaVisible: this.layers.studyArea.IsVisible(),
      physiographyVisible: this.layers.physiography.IsVisible(),
      smithtrailVisible: this.layers.smithtrail.IsVisible(),
      thenAndNowOpen: FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[thenAndNow]")),
      boundariesOpen: FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[boundaries]")),
      landuseOpen: FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[landuse]")),
      basemapOpen: FieldScope.DomUtils.visible($get("FieldScope.LayerGroup[basemap]"))
    };
  };
};

FieldScope.Application.registerClass('FieldScope.Application');

// ----------------------------------------------------------------------------
if (typeof(Sys) !== "undefined") { Sys.Application.notifyScriptLoaded(); }