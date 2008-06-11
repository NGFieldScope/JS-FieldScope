<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" smartnavigation="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>Chesapeake Bay Maping Tool Demo, Version 1.4</title>
    <style type="text/css">
      @import "js/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "js/dojo-1.1.1/dojo/resources/dojo.css";
      @import "css/dts.css";
      body {
	      padding: 1em;
      }
      .handIcon {
        background-image: url(images/Hand24.gif);
        background-repeat: no-repeat; 
        width: 24px;
        height: 24px;
      }
      .pointIcon {
        background-image: url(images/CreatePoint24.gif);
        background-repeat: no-repeat; 
        width: 24px;
        height: 24px;
      }
      .myList {
        margin: 4px 2px 2px 2px;
        border:1px inset gray;
      }
      .header {
        font-weight: bold;
        margin-top: 0px;
        margin-bottom: 0px;
        padding: 2px;
      }
      .row {
        margin-top: 0px;
        margin-bottom: 0px;
        border-top: 1px inset gray;
        padding: 2px 2px 2px 6px;
        height: 20px;
        vertical-align: middle;
      }
      .featureLabel {
        font-family: Arial, Helvetica, sans-serif;
        font-size: small;
        font-face bold;
        color: #FF0000;
        text-align: center;
        vertical-align: middle;
        width: 100px;
        cursor: pointer;
      }
    </style>
    <script type="text/javascript" src="http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.1"></script>
    <script type="text/javascript" src="http://serverapi.arcgisonline.com/jsapi/ve/?v=1"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug: true, parseOnLoad: true"></script>
    <script type="text/javascript">
      dojo.require("dijit.layout.AccordionContainer");
      dojo.require("dijit.layout.ContentPane");
      dojo.require("dijit.layout.BorderContainer");
      dojo.require("dijit.form.Button");
      dojo.require("dijit.form.CheckBox");
      dojo.require("dijit.Toolbar");
      dojo.require("dojo.parser");
    </script>
    <script type="text/javascript">
      // Global variables
      var map = null;
      var drawingTool = null;
      var searchTool = null;
      var wfsLayer = null;
      var metaLensLayer = null;
      var watershedsLayer = null;
      var veLayerID = null;
      
      // Setup function
      dojo.addOnLoad(function() {
        
            map = new VEMap("mapDiv");
            map.LoadMap(new VELatLong(38.05, -76.33), 11, VEMapStyle.Hybrid);
            map.SetMouseWheelZoomToCenter(false);
            map.SetDefaultInfoBoxStyles();
            
            // Setup the drawing tool
            drawingTool = new VEExtras.DrawingTool(map);
            drawingTool.onFinishShape = function (shape) {
                alert("finished drawing " + shape);
              };
            drawingTool.customIcon = 'images/beaker.gif';
            
            // Setup the search tool
            searchTool = new VEExtras.SearchTool(map, "searchResultsDiv");
            searchTool.onBeginSearch = function () {
                dojo.byId("searchWorkingDiv").style.visibility="visible";
              };
            searchTool.onFinishSearch = function () {
                dojo.byId("searchWorkingDiv").style.visibility="hidden";
              };
            
            // Setup the MetaLens layer
            metaLensLayer = new AsyncLayer(map, new MetaLens.DataProvider(NGSDataService));
            metaLensLayer.AttachEvent("onbeginloading", function (evt) {
                dojo.byId("metaLensLoadingImg").style.visibility="visible";
              });
            metaLensLayer.AttachEvent("onfinishloading", function (evt) {
                dojo.byId("metaLensLoadingImg").style.visibility="hidden";
              });
            dijit.byId("metaLensCheckbox").setValue(metaLensLayer.isVisible());
            
            
            // ArcGIS server url
            var arcServerUrl = "http://" + StringUtils.removePortNumber(location.host);
            
            // Setup the WFS layer
            var wfsDataProvider = new WFS.DataProvider(arcServerUrl + "/arcgis/services/cbobs1/GeoDataServer/WFSServer");
            wfsDataProvider.capabilities.featureTypes[0].visible = true;
            wfsDataProvider.customIcon = 'images/beaker.gif';
            wfsLayer = new AsyncLayer(map, wfsDataProvider);
            wfsLayer.AttachEvent("onbeginloading", function (evt) {
                dojo.byId("wfsLoadingImg").style.visibility="visible";
              });
            wfsLayer.AttachEvent("onfinishloading", function (evt) {
                dojo.byId("wfsLoadingImg").style.visibility="hidden";
              });
            dijit.byId("wfsCheckbox").setValue(wfsLayer.isVisible());
            
            
            // Setup the watershed boundaries layer
            var watershedDataProvider = new ArcGISServer.DataProvider(arcServerUrl + "/arcgis/rest/services/test/MapServer/0");
            watershedDataProvider.lineColor = new VEColor(255, 255, 255, 0.75); 
            watershedDataProvider.fillColor = new VEColor(255, 255, 255, 0.35);
            watershedDataProvider.labelField = "Name";//"HUC8_Name";
            watershedsLayer = new AsyncLayer(map, watershedDataProvider);
            watershedsLayer.AttachEvent("onbeginloading", function (evt) {
                dojo.byId("watershedsLoadingImg").style.visibility="visible";
              });
            watershedsLayer.AttachEvent("onfinishloading", function (evt) {
                dojo.byId("watershedsLoadingImg").style.visibility="hidden";
              });
            dijit.byId("watershedsCheckbox").setValue(watershedsLayer.isVisible());
            
            // Setup the watershed boundaries layer
            /*
            var agisve_services = new ESRI.ArcGIS.VE.ArcGISLayerFactory();
            agisve_services.CreateLayer(arcServerUrl + "/arcgis/rest/services/cbhuc8/MapServer", 
                                        "HUC_8", 
                                        function (tileSourceSpec, resourceInfo) {
                                            tileSourceSpec.Opacity=0.5;
                                            map.AddTileLayer(tileSourceSpec, true);
                                          });
            */
        });
      
      // Click handler for "tool" buttons
      function onDrawingToolClick (button, drawingMode) {
        if (!map) return;
        widget = dijit.byId(button.id);
        var toggleButtons = dijit.registry.filter(function(widget) { 
            return widget.name == "tool";
          });
        toggleButtons.forEach(function (tb) {
            tb.setAttribute("checked", (tb == widget));
          });
        
        drawingTool.setDrawingMode(drawingMode);
        drawingTool.onFinishShape = function (shape) {
            dojo.byId("wfsWorkingDiv").style.visibility="visible";
            var description = wfsLayer.getFeatureTypeDescription(0);
            var wfsForm = description.getFormDOM();
            var wfsDiv = dojo.byId("wfsDiv");
            wfsForm.onSave = function () {
                dojo.byId("wfsWorkingDiv").style.visibility="visible";
                var record = new GML.Record();
                record.typeName = this.description.typeName;
                record.xmlns = this.description.xmlns;
                record.shapeType = shape.GetType();
                record.attributes = this.getAttributes();
                record.geomName = this.description.geom.name;
                record.shapes.push(new VEShape(shape.GetType(), shape.GetPoints()));
                var serializer = new GML.Serializer();
                WFS.insertAsync(wfsLayer.getTransactionUrl(), 
                                [serializer.serialize(record)], 
                                function () {
                                    dojo.byId("wfsWorkingDiv").style.visibility="hidden";
                                  });
                drawingTool.deleteShape(shape);
                dojo.byId("wfsWorkingDiv").style.visibility="hidden";
                wfsDiv.removeChild(wfsForm);
              };
            wfsForm.onCancel = function () {
                drawingTool.deleteShape(shape);
                wfsDiv.removeChild(wfsForm);
              };
            wfsDiv.appendChild(wfsForm);
            dojo.byId("wfsWorkingDiv").style.visibility="hidden";
            onDrawingToolClick(dojo.byId('hand'), null);
          };
      }
      
      function onSearchKey (event) {
        if (/* backspace */ (event.keyCode == 0x08) || 
            /* ascii */     ((event.keyCode >= 0x20) && (event.keyCode <= 0x7E)) || 
            /* delete */    (event.keyCode == 0x7F) ||
            /* extended */  (event.keyCode >= 0xA0)) { 
          searchTool.clearSearchResults();
        } else if (/* return */ event.keyCode == 0x0D) {
          onSearchClick();
        }
      }
      
      function onSearchClick () {
        searchTool.doSearch(dojo.byId('searchInput').value);
      }
      
      function onShowHideWfsLayerClick (checkbox) {
        wfsLayer.setVisible(checkbox.checked);
      }
      
      function onShowHideMetaLensLayerClick (checkbox) {
        metaLensLayer.setVisible(checkbox.checked);
      }
      
      function onShowHideWatershedsLayerClick (checkbox) {
        watershedsLayer.setVisible(checkbox.checked);
      }
      
      // Dispose of the map when page is unloaded
      function onUnload () {
        if (map) {
          map.Dispose();
          map = null;
        }
      }
      if (window.attachEvent) {
	      window.attachEvent("onunload", onUnload);	
      } else {
	      window.addEventListener("unload", onUnload, false);
      }
      
    </script>
  </head>
  <body class="tundra">
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release">
        <Scripts>
          <asp:ScriptReference Path="js/Utilities.js" />
          <asp:ScriptReference Path="js/GlobalCallQueue.js" />
          <asp:ScriptReference Path="js/VEExtras.js" />
          <asp:ScriptReference Path="js/AsyncLayer.js" />
          <asp:ScriptReference Path="js/GML.js" />
          <asp:ScriptReference Path="js/WFS.js" />
          <asp:ScriptReference Path="js/MetaLens.js" />
          <asp:ScriptReference Path="js/ArcGISServer.js" />
        </Scripts>
        <Services>
          <asp:ServiceReference Path="NGSDataService.asmx" />
        </Services>
      </asp:ScriptManager>
      <div dojoType="dijit.layout.BorderContainer" style="width:950px; height:550px">
        <div dojoType="dijit.layout.AccordionContainer" duration="200" style="width:200px;height:550px;float:left;overflow:hidden;" region="left">
          <div dojoType="dijit.layout.AccordionPane" id="obs" title="Submit Data" style="position:relative">
            <div id="wfsWorkingDiv" style="position:absolute;top:2px;right:2px;float:right;visibility:hidden">
              <img src="images/loading24.gif">
            </div>
            <div id="toolbar1" dojoType="dijit.Toolbar" style="margin: 2px;border-top:1px solid LightGray;">
              <button dojoType="dijit.form.ToggleButton" onclick="onDrawingToolClick(this, null)" name="tool" id="hand" iconClass="handIcon" showLabel="false" checked="true">Navigate</button>
              <button dojoType="dijit.form.ToggleButton" onclick="onDrawingToolClick(this, VEShapeType.Pushpin)" name="tool" id="point" iconClass="pointIcon" showLabel="true">Enter Observation</button>
            </div>
            <div id="wfsDiv"></div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Upload Photos" style="position:relative" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            MetaLens controls go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Find a Location" onSelected="onDrawingToolClick(dojo.byId('hand'), null);" style="position:relative">
            <div id="searchWorkingDiv" style="position:absolute;top:2px;right:2px;float:right;visibility:hidden">
              <img src="images/loading24.gif">
            </div>
            <div style="margin: 4px;text-align:right">
              <input type="text" id="searchInput" style="width:98%;margin-bottom:4px" onkeydown="onSearchKey(event);">
              <input type="button" id="searchButton" value="Search" onclick="onSearchClick();">
              <div class="myList" id="searchResultsDiv" style="text-align:left;visibility:hidden;font-size:smaller"></div>
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Explore Data Layers" onSelected="onDrawingToolClick(dojo.byId('hand'), null);" selected="true">
            <div class="myList">
              <div class="header">Student Data:</div>
              
            <!-- GIS layer controls -->
            
              <div class="row">
                <div style="float:left">
                  <input type="checkbox" name="layers" id="wfsCheckbox" value="layer1" dojoType="dijit.form.CheckBox" onclick="onShowHideWfsLayerClick(this);" />
                  <label for="layer1">Student Observations</label>
                </div>
                <div style="float:right">
                  <img id="wfsLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" />
                </div>
              </div>
              <div class="row">
                <div style="float:left">
                  <input type="checkbox" name="layers" id="metaLensCheckbox" value="layer2" dojoType="dijit.form.CheckBox" onclick="onShowHideMetaLensLayerClick(this);" />
                  <label for="layer2">Photo Locations</label>
                </div>
                <div style="float:right">
                  <img id="metaLensLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" />
                </div>
              </div>
            </div>
            
            <div class="myList">
              <div class="header">Basemap:</div>
              
              
              <div class="row">
                <div style="float:left">
                  <input type="checkbox" name="layers" id="watershedsCheckbox" value="layer3" dojoType="dijit.form.CheckBox" onclick="onShowHideWatershedsLayerClick(this);" />
                  <label for="layer3">Watershed Boundaries</label>
                </div>
                <div style="float:right">
                  <img id="watershedsLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" />
                </div>
              </div>
              
              <div class="row">
                <input type="checkbox" name="layers" value="VE" id="VE" dojoType="dijit.form.CheckBox" checked="checked" disabled="disabled" />
                <label for="VE">Virtual Earth</label>
              </div>
              
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Analyze Data" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            Analysis tools go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Graphing Tool" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            Graphing tools go here
          </div>
        </div>
        <div id="mapDiv" dojoType="dijit.layout.ContentPane" style="border:1px inset gray;width:750px;height:548px" region="center">
          Map Goes Here
        </div>
      </div>
    </form>
  </body>
</html>
