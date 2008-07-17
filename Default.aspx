<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" smartnavigation="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>FieldScope Prototype, Version 1.10</title>
    <style type="text/css">
      @import "js/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "js/dojo-1.1.1/dojo/resources/dojo.css";
      @import "css/MetaLensWindow.css";
      .addPointIcon {
        background-image: url(images/beaker.gif);
        background-repeat: no-repeat; 
        width: 16px;
        height: 16px;
      }
    </style>
  <!-- Mystery key: "ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRT-pF1m860BUFn_yE2HNV-20QsRKhTNLIH1MmOKXzcbTWUjmZ0Js2oTig" -->                                                                 
  
  <!-- development version scripts -->
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQ_5rwwWZl7ALhyiRg47ubM-rTOnRSsVfG-QI3g0i2S9uGQsVLtI_DRLg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug:true, parseOnLoad:true, usePlainJson:true"></script>
  
  <!-- test version scripts 
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRRj6ZVR02exo3LqN0xouiCenXozOhRg0Oiyt6y6h2mDm3nqmdrdLjxlwg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" djConfig="isDebug:true, parseOnLoad:true, usePlainJson:true"></script>
  -->
  <!-- release version scripts 
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQ_5rwwWZl7ALhyiRg47ubM-rTOnRSsVfG-QI3g0i2S9uGQsVLtI_DRLg" type="text/javascript"></script>
    <script src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1" type="text/javascript" ></script>
    <script src="js/extinfowindow/extinfowindow_packed.js" type="text/javascript"></script>
    <script type="text/javascript" src="js/dojo-1.1.1/dojo/dojo.js" djConfig="parseOnLoad:true, usePlainJson:true"></script>
  -->
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
      application = null;
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
          var toolTable = document.createElement("tbody");
          var toolButtons = [];
          $get("FieldScope.Table.Tools").appendChild(toolTable);
          for (var toolName in application.dataEntryTools) {
            var tool = application.dataEntryTools[toolName];
            if (tool) {
              var id = "FieldScope.Button.Tool[" + toolName + "]";
              var row = document.createElement("tr");
              toolTable.appendChild(row);
              var cell1 = document.createElement("td");
              row.appendChild(cell1);
              var button = document.createElement("div");
              cell1.appendChild(button);
              var widget = new dijit.form.ToggleButton({ id : id, iconClass : "dijitRadioIcon" }, button);
              widget.setAttribute("checked", tool == application.dataEntry.currentTool);
              var input = $get(id);
              input.FieldScopeTool = tool;
              input.FieldScopeWidget = widget;
              input.appendChild(document.createTextNode(tool.name));
              $addHandler(input, "click", Function.createDelegate(this, function (evt) {
                  application.SetDataEntryTool(evt.target.FieldScopeTool);
                  window.setTimeout(UpdateDataEntryButtons, 0);
                }));
              toolButtons.push(input);
            }
          }
          
          // Build a set of controls for each of the application's data layers
          var layerTable = document.createElement("tbody");
          $get("FieldScope.Table.Layers").appendChild(layerTable);
          for (var layerName in application.layers) {
            var layer = application.layers[layerName];
            if (layer) {
              var id = "FieldScope.Checkbox.Layer[" + layerName + "]";
              var row = document.createElement("tr");
              layerTable.appendChild(row);
              var cell0 = document.createElement("td");
              row.appendChild(cell0);
              cell0.align = "center";
              cell0.innerHTML = layer.iconHTML;
              var cell1 = document.createElement("td");
              row.appendChild(cell1);
              var button = document.createElement("div");
              cell1.appendChild(button);
              var widget = new dijit.form.CheckBox({ id : id }, button);
              widget.setAttribute("checked", layer.IsVisible());
              var input = $get(id);
              input.FieldScopeLayer = layer;
              $addHandler(input, "click", function (evt) {
                  evt.target.FieldScopeLayer.SetVisible(evt.target.checked);
                });
              var label = document.createElement("label");
              cell1.appendChild(label);
              label.htmlFor = id;
              label.appendChild(document.createTextNode(layer.name));
              var cell2 = document.createElement("td");
              row.appendChild(cell2);
              var img = document.createElement("img");
              cell2.appendChild(img);
              img.id = id + ".LoadingImg";
              img.src = "images/loading16.gif";
              img.alt = "Loading...";
              img.style.visibility = "hidden";
              layer.loadingIndicator = img;
            }
          }
        });
      
      function UpdateDataEntryButtons () {
        var currentTool = application.dataEntry.currentTool;
        for (var toolName in application.dataEntryTools) {
          var tool = application.dataEntryTools[toolName];
          if (tool) {
            dijit.byId("FieldScope.Button.Tool[" + toolName + "]").setAttribute("checked", currentTool === tool);
          }
        }
      }
      
      function OnSelectPane (pane) {
        if (application && (pane.id !== "FieldScope.Pane.SubmitData")) {
          application.SetDataEntryTool(application.dataEntryTools.none); 
          UpdateDataEntryButtons();
        }
      }
      
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
      <div dojoType="dijit.layout.BorderContainer" style="width:950px; height:550px">
        <div dojoType="dijit.layout.AccordionContainer" duration="200" style="width:200px;height:550px;float:left;overflow:hidden;" region="left">
          <div dojoType="dijit.layout.AccordionPane" id="FieldScope.Pane.SubmitData" title="Submit Data or Photos" onSelected="OnSelectPane(this);">
            <table style="width:98%" id="FieldScope.Table.Tools"></table>
          </div>
          <div dojoType="dijit.layout.AccordionPane" id="FieldScope.Pane.FindLocation" title="Find a Location" onSelected="OnSelectPane(this);">
            <div style="margin:2px">
              <input type="text" id="FieldScope.Input.SearchText" style="width:98%;margin-bottom:2px" onkeydown="application.OnSearchKey(event);" />
              <input type="button" value="Search" onclick="application.OnSearchClick(event);" />
              <div id="FieldScope.Div.SearchResults" style="width:98%;text-align:left;visibility:hidden"></div>
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" id="FieldScope.Pane.Layers" title="Explore Data Layers" selected="true" onSelected="OnSelectPane(this);">
            <table style="width:98%" id="FieldScope.Table.Layers"> </table>
          </div>
          <div dojoType="dijit.layout.AccordionPane" id="FieldScope.Pane.Analysis" title="Analyze Data" onSelected="OnSelectPane(this);">
            Analysis tools go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" id="FieldScope.Pane.Graphing" title="Graphing Tool" onSelected="OnSelectPane(this);">
            Graphing tools go here
          </div>
        </div>
        <div id="FieldScope.Div.Map" dojoType="dijit.layout.ContentPane" style="border:1px inset gray;width:750px;height:548px" region="center">
          Map Goes Here
        </div>
      </div>
    </form>
  </body>
</html>
