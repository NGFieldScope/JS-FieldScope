<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" smartnavigation="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>FieldScope Prototype, Version 1.8.1</title>
    <style type="text/css">
      @import "js/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "js/dojo-1.1.1/dojo/resources/dojo.css";
      @import "css/dts.css";
      @import "css/redInfoWindow.css";
      .addPointIcon {
        background-image: url(images/beaker.gif);
        background-repeat: no-repeat; 
        width: 16px;
        height: 16px;
      }
    </style>
  <!-- development version scripts -->
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQ_5rwwWZl7ALhyiRg47ubM-rTOnRSsVfG-QI3g0i2S9uGQsVLtI_DRLg" type="text/javascript"></script>
    <!-- Mystery key: "ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRT-pF1m860BUFn_yE2HNV-20QsRKhTNLIH1MmOKXzcbTWUjmZ0Js2oTig" -->                                                                 
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
          application = new FieldScope.App("mapDiv",
                                           "searchInput",
                                           "searchResultsDiv",
                                           "watershedsLoadingImg",
                                           "metaLensLoadingImg",
                                           "observationsLoadingImg");
        });
      
      function UpdateDataEntryButtons () {
        var tool = application.dataEntry.currentTool;
        dijit.byId("addPointButton").setAttribute("checked",tool  === application.dataEntryTools.observations);
        dijit.byId("addPhotoButton").setAttribute("checked", tool === application.dataEntryTools.photos);
        dijit.byId("stopDataEntryButton").setAttribute("checked", tool === application.dataEntryTools.none);
      }
      
      function OnSelectPane (pane) {
        if (application && (pane.id !== "FieldScope.SubmitDataPane")) {
          application.SetDataEntryTool(application.dataEntryTools.none); 
          UpdateDataEntryButtons();
        }
      }
    </script>
  </head>
  <body class="tundra">
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release">
        <Scripts>
          <asp:ScriptReference Path="js/GAsyncLayer.js" />
          <asp:ScriptReference Path="js/ArcGisServer.js" />
          <asp:ScriptReference Path="js/MetaLens.js" />
          <asp:ScriptReference Path="js/WFS.js" />
          <asp:ScriptReference Path="js/GSearch.js" />
          <asp:ScriptReference Path="js/Utilities.js" />
          <asp:ScriptReference Path="js/App.js" />
        </Scripts>
        <Services>
          <asp:ServiceReference Path="MetaLensService.asmx" />
          <asp:ServiceReference Path="WFSService.asmx" />
        </Services>
      </asp:ScriptManager>
      <div dojoType="dijit.layout.BorderContainer" style="width:950px; height:550px">
        <div dojoType="dijit.layout.AccordionContainer" duration="200" style="width:200px;height:550px;float:left;overflow:hidden;" region="left">
          <div dojoType="dijit.layout.AccordionPane" 
               id="FieldScope.SubmitDataPane" 
               title="Submit Data or Photos"
               onSelected="OnSelectPane(this);">
            <table style="width:98%">
              <tr>
                <td>
                  <button dojoType="dijit.form.ToggleButton" 
                          onclick="application.SetDataEntryTool(application.dataEntryTools.observations); UpdateDataEntryButtons();"
                          id="addPointButton"
                          iconClass="dijitRadioIcon">
                    Place Observation
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button dojoType="dijit.form.ToggleButton" 
                          onclick="application.SetDataEntryTool(application.dataEntryTools.photos); UpdateDataEntryButtons();"  
                          id="addPhotoButton" 
                          iconClass="dijitRadioIcon">
                    Place Photo
                  </button>
                </td>
              </tr>
              <tr>
                <td>
                  <button dojoType="dijit.form.ToggleButton" 
                          onclick="application.SetDataEntryTool(application.dataEntryTools.none); UpdateDataEntryButtons();" 
                          id="stopDataEntryButton" 
                          checked="checked"
                          iconClass ="dijitRadioIcon">
                    Data Entry Off
                  </button>
                </td>
              </tr>
            </table>
          </div>
          <div dojoType="dijit.layout.AccordionPane" 
               id="FieldScope.FindLocationPane" 
               title="Find a Location"
               onSelected="OnSelectPane(this);">
            <div style="margin:2px">
              <input type="text" id="searchInput" style="width:98%;margin-bottom:2px" onkeydown="application.OnSearchKey(event);" />
              <input type="button" id="searchButton" value="Search" onclick="application.OnSearchClick(event)" />
              <div id="searchResultsDiv" style="width:98%;text-align:left;visibility:hidden"></div>
            </div>
          </div>
          <div dojoType="dijit.layout.AccordionPane" 
               id="FieldScope.LayersPane" 
               title="Explore Data Layers" 
               selected="true"
               onSelected="OnSelectPane(this);">
            <table style="width:100%">
              <tr>
                <td>
                  <input type="checkbox" name="layer0" checked="checked" dojoType="dijit.form.CheckBox" onclick="application.SetLayerVisible(0, this.checked);" />
                  <label for="layer0">Student Observations</label>
                </td>
                <td><img id="observationsLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" /></td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" name="layer1" checked="checked" dojoType="dijit.form.CheckBox" onclick="application.SetLayerVisible(1, this.checked);" />
                  <label for="layer1">Photo Locations</label>
                </td>
                <td><img id="metaLensLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" /></td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" name="layer2" checked="checked" dojoType="dijit.form.CheckBox" onclick="application.SetLayerVisible(2, this.checked);" />
                  <label for="layer2">Watershed Boundaries</label>
                </td>
                <td><img id="watershedsLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" /></td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" name="layer3" checked="checked" dojoType="dijit.form.CheckBox" onclick="application.SetLayerVisible(3, this.checked);" />
                  <label for="layer3">Impervious Surfaces</label>
                </td>
                <td><img id="permeabilityLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" /></td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" name="layer4" dojoType="dijit.form.CheckBox" onclick="application.SetLayerVisible(4, this.checked);" />
                  <label for="layer4">Streets & Places</label>
                </td>
                <td><img id="placesLoadingImg" src="images/loading16.gif" style="visibility:hidden" alt="Loading" /></td>
              </tr>
            </table>
          </div>
          <div dojoType="dijit.layout.AccordionPane" 
               id="FieldScope.AnalysisPane" 
               title="Analyze Data"
               onSelected="OnSelectPane(this);">
            Analysis tools go here
          </div>
          <div dojoType="dijit.layout.AccordionPane" 
               id="FieldScope.GraphingPane" 
               title="Graphing Tool"
               onSelected="OnSelectPane(this);">
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
