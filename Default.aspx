<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" smartnavigation="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>FieldScope Prototype, Version 1.11</title>
    <style type="text/css">
      @import "js/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "js/dojo-1.1.1/dojo/resources/dojo.css";
      @import "css/MetaLensWindow.css";
      @import "css/App.css";
    </style>
  <!-- Mystery key: "ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRT-pF1m860BUFn_yE2HNV-20QsRKhTNLIH1MmOKXzcbTWUjmZ0Js2oTig" -->                                                                 
  
  <!-- development version scripts 
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQ_5rwwWZl7ALhyiRg47ubM-rTOnRSsVfG-QI3g0i2S9uGQsVLtI_DRLg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug:true, parseOnLoad:true, usePlainJson:true"></script>
  -->
  <!-- test version scripts 
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRRj6ZVR02exo3LqN0xouiCenXozOhRg0Oiyt6y6h2mDm3nqmdrdLjxlwg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug:true, parseOnLoad:true, usePlainJson:true"></script>
  -->
  <!-- release version scripts -->
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQ_5rwwWZl7ALhyiRg47ubM-rTOnRSsVfG-QI3g0i2S9uGQsVLtI_DRLg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow_packed.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js" djConfig="parseOnLoad:true, usePlainJson:true"></script>
  
    <script type="text/javascript">
      /*globals dojo dijit $addHandler $get FieldScope application toolButtons */
      dojo.require("dijit.layout.SplitContainer");
      dojo.require("dijit.layout.ContentPane");
      dojo.require("dijit.layout.BorderContainer");
      dojo.require("dijit.form.Button");
      dojo.require("dijit.form.CheckBox");
      dojo.require("dijit.Tooltip");
      dojo.require("dijit.Toolbar");
      dojo.require("dojo.parser");
      
      // Global variables
      application = null;
      toolButtons = [];
      
      function UpdateDataEntryButtons () {
        var currentTool = application.dataEntry.currentTool;
        for (var toolName in application.dataEntryTools) {
          var tool = application.dataEntryTools[toolName];
          if (tool) {
            dijit.byId("FieldScope.Button.Tool[" + toolName + "]").setAttribute("checked", currentTool === tool);
          }
        }
      }
      
      function MakeToolButton (toolName, tool, toolbar) {
        var toolId = "FieldScope.Button.Tool[" + toolName + "]";
        var toolButton = document.createElement("div");
        toolbar.appendChild(toolButton);
        var toggleButton = new dijit.form.ToggleButton({ id:toolId, iconClass:tool.iconClass, showLabel:false }, toolButton);
        toggleButton.setAttribute("checked", tool === application.dataEntry.currentTool);
        var toolInput = $get(toolId);
        $addHandler(toolInput, "click", function (evt) {
            application.SetDataEntryTool(tool);
            window.setTimeout(UpdateDataEntryButtons, 0);
          });
        toolButtons.push(toolInput);
        var tooltip = new dijit.Tooltip({ label: tool.name, connectId: [ toolId ] });
      }
      
      function MakeLayerControl (layerName, layer, layerTable) {
        var layerId = "FieldScope.Checkbox.Layer[" + layerName + "]";
        var row = document.createElement("tr");
        layerTable.appendChild(row);
        var cell0 = document.createElement("td");
        row.appendChild(cell0);
        cell0.align = "center";
        cell0.innerHTML = layer.iconHTML;
        var cell1 = document.createElement("td");
        row.appendChild(cell1);
        var layerButton = document.createElement("div");
        cell1.appendChild(layerButton);
        var checkBox = new dijit.form.CheckBox({ id:layerId }, layerButton);
        checkBox.setAttribute("checked", layer.IsVisible());
        var layerInput = $get(layerId);
        $addHandler(layerInput, "click", function (evt) {
            layer.SetVisible(evt.target.checked);
          });
        var label = document.createElement("label");
        cell1.appendChild(label);
        label.htmlFor = layerId;
        label.appendChild(document.createTextNode(layer.name));
        var cell2 = document.createElement("td");
        row.appendChild(cell2);
        var img = document.createElement("img");
        cell2.appendChild(img);
        img.id = layerId + ".LoadingImg";
        img.src = "images/loading16.gif";
        img.alt = "Loading...";
        img.style.visibility = "hidden";
        layer.loadingIndicator = img;
      }
      
      dojo.addOnLoad(function () {
          application = new FieldScope.App($get("FieldScope.Div.Map"),
                                           function () {
                                             return $get("FieldScope.Input.SearchText").value;
                                           },
                                           function (searchResults) {
                                             var resultsDiv = $get("FieldScope.Div.SearchResults");
                                             resultsDiv.innerHTML = "";
                                             if (searchResults) {
                                               resultsDiv.appendChild(searchResults);
                                               resultsDiv.style.visibility="visible";
                                             } else {
                                               resultsDiv.style.visibility="hidden";
                                             }
                                           });
          
          // Build a button for each of the application's data entry tools
          var toolbar = $get("FieldScope.Div.Toolbar");
          for (var toolName in application.dataEntryTools) {
            var tool = application.dataEntryTools[toolName];
            if (tool) {
              MakeToolButton(toolName, tool, toolbar);
            }
          }
          dijit.Tooltip.defaultPosition=['above', 'below'];
          
          // Build a set of controls for each of the application's data layers
          var layerTable = document.createElement("tbody");
          $get("FieldScope.Table.Layers").appendChild(layerTable);
          for (var layerName in application.layers) {
            var layer = application.layers[layerName];
            if (layer) {
              MakeLayerControl(layerName, layer, layerTable);
            }
          }
        });
      
    </script>
  </head>
  <body class="tundra">
    <form id="form1" runat="server" method="post" enctype="multipart/form-data">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release">
        <Scripts>
          <asp:ScriptReference Path="js/Utilities.js" />
          <asp:ScriptReference Path="js/GAsyncLayer.js" />
          <asp:ScriptReference Path="js/ArcGisServer.js" />
          <asp:ScriptReference Path="js/MetaLens.js" />
          <asp:ScriptReference Path="js/WFS.js" />
          <asp:ScriptReference Path="js/CBIBS.js" />
          <asp:ScriptReference Path="js/GSearch.js" />
          <asp:ScriptReference Path="js/App.js" />
        </Scripts>
        <Services>
          <asp:ServiceReference Path="CBIBSService.asmx" />
          <asp:ServiceReference Path="MetaLensService.asmx" />
          <asp:ServiceReference Path="WFSService.asmx" />
        </Services>
      </asp:ScriptManager>
      <div dojoType="dijit.layout.BorderContainer" 
           design="sidebar" 
           style="width:950px; height:600px">
        <div dojoType="dijit.layout.BorderContainer" 
             design="sidebar" 
             style="width:200px;height:600px" 
             region="left">
          <div dojoType="dijit.layout.ContentPane" 
               region="top"
               style="height:36px;border-bottom-style:ridge">
            <div id="FieldScope.Div.Toolbar" dojoType="dijit.Toolbar">
              Mouse:
            </div>
          </div>
          <div dojoType="dijit.layout.ContentPane" 
               region="center"
               style="height:30%;margin-top:8px">
            Find a Location:
            <div style="margin:2px">
              <input type="text" id="FieldScope.Input.SearchText" style="width:98%;margin-bottom:2px" onkeydown="application.OnSearchKey(event);" />
              <input type="button" value="Search" onclick="application.OnSearchClick(event);" />
              <div id="FieldScope.Div.SearchResults" style="width:98%;text-align:left;visibility:hidden"></div>
            </div>
          </div>
          <div dojoType="dijit.layout.ContentPane" 
               region="bottom"
               style="height:70%;margin-top:8px"
               splitter="true">
            Explore Data Layers:
            <table style="width:98%" id="FieldScope.Table.Layers"> </table>
          </div>
        </div>
        <div dojoType="dijit.layout.ContentPane" 
             region="center"
             style="border:1px inset gray;width:750px;height:598px" 
             id="FieldScope.Div.Map">
          Map Goes Here
        </div>
      </div>
    </form>
  </body>
</html>
