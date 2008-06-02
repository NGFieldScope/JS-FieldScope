<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>
<%@ Register Assembly="System.Web.Extensions, Version=1.0.61025.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35" Namespace="System.Web.UI" TagPrefix="asp" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>National Geographic</title>
    <style type="text/css">
      @import "http://localhost/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "http://localhost/dojo-1.1.1/dojo/resources/dojo.css";
      .handIcon {
        background-image: url(images/Hand24.gif);
        background-repeat: no-repeat; 
        width: 24px;
        height: 24px;
      };
      .pointIcon {
        background-image: url(images/CreatePoint24.gif);
        background-repeat: no-repeat; 
        width: 24px;
        height: 24px;
      };
      div.myList {
        margin: 4px 2px 2px 2px;
        border:1px inset gray;
      };
      p.header {
        font-weight: bold;
        margin-top: 0px;
        margin-bottom: 0px;
        padding: 2px;
      };
      p.row {
        margin-top: 0px;
        margin-bottom: 0px;
        border-top: 1px inset gray;
        padding: 2px 2px 2px 6px;
      };
    </style>
    <script type="text/javascript" src="http://dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.1"></script>
    <script type="text/javascript" src="http://localhost/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug: true, parseOnLoad: true"></script>
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
      
      // Setup function
      dojo.addOnLoad(function() {
          map = new VEMap("mapDiv");
          map.LoadMap(new VELatLong(38.05, -76.33), 10, VEMapStyle.Hybrid);
          map.SetMouseWheelZoomToCenter(false);
          map.SetDefaultInfoBoxStyles();
          drawingTool = new VEExtras.DrawingTool(map);
          drawingTool.onFinishShape = function (shape) {
              alert("finished drawing " + shape);
            };
          drawingTool.customIcon = 'images/beaker.gif';
          searchTool = new VEExtras.SearchTool(map, "searchResultsDiv");
          searchTool.onBeginSearch = function () {
              dojo.byId("searchWorkingDiv").style.visibility="visible";
            };
          searchTool.onFinishSearch = function () {
              dojo.byId("searchWorkingDiv").style.visibility="hidden";
            };
          wfsLayer = new WFS.Layer("http://localhost/arcgis/services/cbobs1/GeoDataServer/WFSServer");
          wfsLayer.onBeginLoading = function () {
              dojo.byId("wfsWorkingDiv").style.visibility="visible";
            };
          wfsLayer.onFinishLoading = function () {
              dojo.byId("wfsWorkingDiv").style.visibility="hidden";
            };
          wfsLayer.setFeatureTypeVisible(0, true);
          wfsLayer.customIcon = 'images/beaker.gif';
          wfsLayer.generateDescription = generateDescription;
          wfsLayer.addToMap(map);
          dijit.byId("wfsCheckbox").setValue(wfsLayer.isVisible());
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
      
      function generateDescription (attributes) {
        var result = "<table >";
        result += "<tr>";
        result += "<th style='border:1px outset white;font-weight:bold;padding:2px'>Attribute</th>";
        result += "<th style='border:1px outset white;font-weight:bold;padding:2px'><b>Value</b></th>";
        result += "</tr>";
        for (attrib in attributes) {
          if (attrib != "OBJECTID") {
            result += "<tr>";
            result += "<td style='border:1px outset white;padding:3px'>" + attrib + "</td>";
            result += "<td style='border:1px outset white;padding:3px'>" + attributes[attrib] + "</td>";
            result += "</tr>";
          }
        }
        result += "</table>";
        return result;
      }
    </script>
  </head>
  <body class="tundra">
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager1" runat="server">
        <Scripts>
          <asp:ScriptReference Path="js/Utilities.js" />
          <asp:ScriptReference Path="js/GML.js" />
          <asp:ScriptReference Path="js/WFS.js" />
          <asp:ScriptReference Path="js/VEExtras.js" />
        </Scripts>
        <Services>
          <asp:ServiceReference Path="NGSDataService.asmx" />
        </Services>
      </asp:ScriptManager>
      <div dojoType="dijit.layout.BorderContainer" style="height:550px">
        <div dojoType="dijit.layout.AccordionContainer" duration="200" style="width:200px;height:550px;float:left;overflow:hidden;" region="left">
          <div dojoType="dijit.layout.AccordionPane" id="obs" title="Enter Observations" style="position:relative">
            <div id="wfsWorkingDiv" style="position:absolute;top:2px;right:2px;float:right;visibility:hidden">
              <img src="images/loading.gif" width="24" height="24">
            </div>
            <div id="toolbar1" dojoType="dijit.Toolbar" style="margin: 2px;border-top:1px solid LightGray;">
              <button dojoType="dijit.form.ToggleButton" onclick="onDrawingToolClick(this, null)" name="tool" id="hand" iconClass="handIcon" showLabel="false" checked="true">Navigate</button>
              <button dojoType="dijit.form.ToggleButton" onclick="onDrawingToolClick(this, VEShapeType.Pushpin)" name="tool" id="point" iconClass="pointIcon" showLabel="true">Enter Observation</button>
            </div>
            <div id="wfsDiv"></div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Find a Location" onSelected="onDrawingToolClick(dojo.byId('hand'), null);" style="position:relative">
            <div id="searchWorkingDiv" style="position:absolute;top:2px;right:2px;float:right;visibility:hidden">
              <img src="images/loading.gif" width="24" height="24">
            </div>
            <div style="margin: 4px;text-align:right">
              <input type="text" id="searchInput" style="width:98%;margin-bottom:4px" onkeydown="onSearchKey(event);">
              <input type="button" id="searchButton" value="Search" onclick="onSearchClick();">
              <div class="myList" id="searchResultsDiv" style="text-align:left;visibility:hidden;font-size:smaller"></div>
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Enter Photos/Media" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            MetaLens controls go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Map Layers" onSelected="onDrawingToolClick(dojo.byId('hand'), null);" selected="true">
            Layer controls might look like this:
            <div class="myList">
              <p class="header">GIS Layers:</p>
              <p class="row">
                <input type="checkbox" name="layers" id="wfsCheckbox" value="layer1" dojoType="dijit.form.CheckBox" onclick="onShowHideWfsLayerClick(this)">
                <label for="layer1">Student Observations</label>
              </p>
              <p class="row">
                <input type="checkbox" name="layers" value="layer2" id="layer2" dojoType="dijit.form.CheckBox" disabled="disabled">
                <label for="layer2">GIS Layer 2</label>
              </p>
            </div>
            <div class="myList">
              <p class="header">Basemap:</p>
              <p class="row">
                <input type="radio" name="basemap" value="VE" id="VE" dojoType="dijit.form.RadioButton" checked="checked">
                <label for="VE">Virtual Earth</label>
              </p>
              <p class="row">
                <input type="radio" name="basemap" value="NGS" id="NGS" dojoType="dijit.form.RadioButton" disabled="disabled">
                <label for="NGS">National Geographic Map</label>
              </p>
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Analysis" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            Analysis tools go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" title="Graphs" onSelected="onDrawingToolClick(dojo.byId('hand'), null);">
            Graphing tools go here
          </div>
        </div>
        <div id="mapDiv" dojoType="dijit.layout.ContentPane" style="border:1px inset gray;width:650px;height:548px" region="center">
          Map Goes Here
        </div>
      </div>
    </form>
  </body>
</html>
