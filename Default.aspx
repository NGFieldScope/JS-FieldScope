<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" smartnavigation="false" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>Chesapeake Bay FieldScope Prototype 1.19</title>
    <style type="text/css">
      @import "js/dojo-1.1.1/dijit/themes/tundra/tundra.css";
      @import "js/dojo-1.1.1/dojo/resources/dojo.css";
      @import "css/MetaLensWindow.css";
      @import "css/App.css";
    </style>
    
    <script type="text/javascript" src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAWNN8v7R4waUa5Xh7F5YzNRQkzReMT6KcnZeGz7n-Q5b7By3ebRQHjl1BuehZRVJFoqAs85jHN9ZOUg"></script>
    <script type="text/javascript" src="http://serverapi.arcgisonline.com/jsapi/gmaps/?v=1"></script>
  
  <!-- development version scripts -->
    <script type="text/javascript" src="js/extinfowindow/extinfowindow.js"></script>
    <script type="text/javascript" 
            src="js/dojo-1.1.1/dojo/dojo.js.uncompressed.js" 
            djConfig="isDebug:true, parseOnLoad:false, usePlainJson:true"></script>
    <script type="text/javascript" src="js/swfobject/swfobject.js"></script>
  
  <!-- release version scripts 
    <script type="text/javascript" src="js/extinfowindow/extinfowindow_packed.js"></script>
    <script type="text/javascript" 
            src="js/dojo-1.1.1/dojo/dojo.js" 
            djConfig="parseOnLoad:false, usePlainJson:true"></script>
    <script type="text/javascript" src="js/swfobject/swfobject_packed.js"></script>
  -->
  
    <script type="text/javascript">
//<![CDATA[
      /*globals dojo dijit $addHandler $get FieldScope application editUserDialog feedbackDialog */
      dojo.require("dijit.layout.SplitContainer");
      dojo.require("dijit.layout.ContentPane");
      dojo.require("dijit.layout.BorderContainer");
      dojo.require("dijit.form.Button");
      dojo.require("dijit.form.CheckBox");
      dojo.require("dijit.Dialog");
      dojo.require("dijit.Tooltip");
      dojo.require("heroic.PersistTooltip");
      dojo.require("dijit.Toolbar");
      dojo.require("dojo.parser");
      
      // globals
      application = null;
      editUserDialog = null;
      feedbackDialog = null;
      
      function UpdateMouseModeButtons () {
        for (var x = 0; x < application.mouseModeList.length; x += 1) {
          var mode = application.mouseModeList[x];
          var button = dijit.byId(mode.GetId() + ".Button");
          button.setAttribute("checked", mode === application.currentMouseMode);
        }
      }
      
      function MakeMouseModeButtonHtml (mode) {
        var buttonId = mode.GetId() + ".Button";
        var result = '<div dojoType="dijit.form.ToggleButton"';
        result +=        ' id="'+buttonId+'"';
        result +=        ' iconClass="'+mode.GetIconCssClass()+'"';
        result +=        ' showLabel="false">';
        result +=    '</div>';
        result +=    '<span dojoType="dijit.Tooltip"';
        result +=         ' connectId="'+buttonId+'">';
        result +=      mode.GetName();
        result +=    '</span>';
        return result;
      }
      
      function WireMouseModeButton (mode) {
        var button = $get(mode.GetId() + ".Button");
        $addHandler(button, "click", function (evt) {
            application.SetMouseMode(mode);
            window.setTimeout(UpdateMouseModeButtons, 0);
          });
      }
      
      function ToggleVisibility (folder, dom) {
        var img = folder.getElementsByTagName('img')[0];
        var span = folder.getElementsByTagName('span')[0];
        if (FieldScope.DomUtils.visible(dom)) {
          FieldScope.DomUtils.hide(dom);
          if (img) {
            img.src = "images/folder_closed.gif";
          }
          if (span) {
            span.innerHTML = "Show";
          }
        } else {
          FieldScope.DomUtils.show(dom);
          if (img) {
            img.src = "images/folder_open.gif";
          }
          if (span) {
            span.innerHTML = "Hide";
          }
        }
      }
      
      function MakeLayerControlsHtml (layerGroup) {
        var result = '';
        if (layerGroup[0]) {
          result += '<tr>';
          result +=   '<td colspan="3">';
          result +=     '<a style="text-decoration:none" href="javascript:void(0)" onclick="ToggleVisibility(this, $get(\''+layerGroup[0].id+'\'));">';
          result +=       '<img src="images/folder_' + (layerGroup[0].visible ? 'open' : 'closed') + '.gif" style="vertical-align:text-top" />';
          result +=       '&nbsp;';
          result +=       layerGroup[0].name;
          result +=     '</a>';
          result +=   '</td>';
          result += '</tr>';
          result += '<tr id="'+layerGroup[0].id+'"';
          if (!layerGroup[0].visible) {
            result +=  ' style="display:none"';
          }
          result += '>';
          result +=   '<td>&nbsp;&nbsp;</td>';
          result +=   '<td colspan="2">';
          result +=     '<table width="100%">';
        }
        for (var x = 1; x < layerGroup.length; x += 1) {
          result +=     '<tr>';
          if (layerGroup[x] instanceof Array) {
            result += MakeLayerControlsHtml(layerGroup[x]);
          } else {
            var layer = layerGroup[x];
            var checkboxId = layer.id + ".Checkbox";
            var loadingId = layer.id + ".Loading";
            var legendId = layer.id + ".Legend";
            result +=   '<tr>';
            result +=     '<td align="center">';
            result +=       layer.iconHTML;
            result +=     '</td>';
            result +=     '<td>';
            result +=       '<input type="checkbox"';
            result +=             ' id="'+checkboxId+'"';
            if (layer.group) {
              result +=           ' name="'+layer.group+'"';
              result +=           ' dojoType="dijit.form.RadioButton" />';
            } else {
              result +=           ' dojoType="dijit.form.CheckBox" />';
            }
            result +=       '&nbsp;';
            result +=       '<label for="'+checkboxId+'">';
            result +=         layer.name;
            result +=       '</label>';
            result +=     '</td>';
            result +=     '<td align="right">';
            result +=       '<img id="'+loadingId+'" style="display:none" src="images/loading16.gif" alt="Loading..." />';
            if (layer.legendHTML) {
              result +=     '<img id="'+legendId+'" src="images/info16.png" />';
              result +=     '<span dojoType="heroic.PersistTooltip"';
              result +=          ' connectId="'+legendId+'">';
              result +=       layer.legendHTML;
              result +=     '</span>';
            }
            result +=     '</td>';
            result +=   '</tr>';
          }
        }
        if (layerGroup[0]) {
          result +=     '</table>';
          result +=   '</td>';
          result += '</tr>';
        }
        return result;
        
      }
      
      function WireLayerControls (layer) {
        layer.loadingIndicator = $get(layer.id + ".Loading");
        var checkboxId = layer.id + ".Checkbox";
        dijit.byId(checkboxId).setAttribute("checked", layer.IsVisible());
        $addHandler($get(checkboxId), "click", function (evt) {
            layer.SetVisible(evt.target.checked);
          });
      }
      
      dojo.addOnLoad(function () {
          
          var savedState = null;
          try {
            savedState = dojo.fromJson($get("FieldScope_State").value);
          } catch (e) { }
          
          // instantiate the application
          application = new FieldScope.Application(
              savedState,
              $get("FieldScope.Div.Map"),
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
              }
            );
          
          // Build a button for each of the application's mouse modes
          var toolbar = $get("FieldScope.Div.Toolbar");
          for (var x = 0; x < application.mouseModeList.length; x += 1) {
            toolbar.innerHTML += MakeMouseModeButtonHtml(application.mouseModeList[x]);
          }
          
          // Build a tree of controls for the application's data layers
          var layerControlsHtml = '<table cellspacing="1" cellpadding="0" style="width:100%">';
          layerControlsHtml += MakeLayerControlsHtml(application.layerTree);
          layerControlsHtml += "</table>";
          $get("FieldScope.Layers.Controls").innerHTML = layerControlsHtml;
          
          dojo.parser.parse();
          dijit.Tooltip.defaultPosition=['above', 'below'];
          
          UpdateMouseModeButtons();
          
          // Wire up the mouse mode buttons
          for (var y = 0; y < application.mouseModeList.length; y += 1) {
            WireMouseModeButton(application.mouseModeList[y]);
          }
          
          // Wire up the layer controls
          for (var layerName in application.layers) {
            var layer = application.layers[layerName];
            if (layer) {
              WireLayerControls(layer);
            }
          }
        });
      
      function On_Uload () {
        // AAAAAAARGH! Safari Sux!
        // We have to do this synchronously to make it work on Safari,
        // so we do it by posting to an ashx using xhrPost, rather than 
        // using any of the numerous other ways it could be done 
        // asynchronously, most of which I tried unsuccessfully before 
        // coming up with this method.
        var cookie = $get("FieldScope_Cookie").value;
        var state = dojo.toJson(application.GetState());
        dojo.xhrPost({ 
            url: "SaveUserStateService.ashx",
            content : { "cookie" : cookie, "state" : state },
            sync : true
         });
        return false;
        GUnload();
      }
      
      function Edit_User () {
        if (!editUserDialog) {
          var pane = dojo.byId('FieldScope.EditUser.Dialog.Pane');
          editUserDialog = new dijit.Dialog({
	          id : "FieldScope.EditUsers.Dialog",
	          refocus : false,
	          title : "Edit Account Settings"
          }, pane);
        }
        editUserDialog.show();
      }
      
      function Send_Feedback () {
        if (!feedbackDialog) {
          var pane = dojo.byId('FieldScope.Feedback.Dialog.Pane');
          feedbackDialog = new dijit.Dialog({
	          id : "FieldScope.Feedback.Dialog",
	          refocus : false,
	          title : "FieldScope Feedback Form"
          }, pane);
        }
        feedbackDialog.show();
      }
      
      function Set_Popup_Delegates (iframe) {
        var doc = iframe.contentWindow || iframe.contentDocument;
        if (doc.document) {
          doc = doc.document;
        }
        // EditUser.aspx.cs and Feedback.aspx.cs register client scripts 
        // that call these methods
        doc.FieldScopeEditUserComplete = function () {
            editUserDialog.hide();
          };
        doc.FieldScopeFeedbackComplete = function () {
            feedbackDialog.hide();
          };
      }
//]]>
    </script>
  </head>
  <body class="tundra" onunload="On_Uload();">
    <form id="form1" runat="server" method="post" enctype="multipart/form-data">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Debug">
        <Scripts>
          <asp:ScriptReference Path="js/Utilities.js" />
          <asp:ScriptReference Path="js/Mouse.js" />
          <asp:ScriptReference Path="js/GAsyncLayer.js" />
          <asp:ScriptReference Path="js/ArcGisServer.js" />
          <asp:ScriptReference Path="js/MetaLens.js" />
          <asp:ScriptReference Path="js/CBIBS.js" />
          <asp:ScriptReference Path="js/Observation.js" />
          <asp:ScriptReference Path="js/GSearch.js" />
          <asp:ScriptReference Path="js/Application.js" />
        </Scripts>
        <Services>
          <asp:ServiceReference Path="CBIBSService.asmx" />
          <asp:ServiceReference Path="MetaLensService.asmx" />
        </Services>
      </asp:ScriptManager>
      <div dojoType="dijit.layout.BorderContainer" 
           design="sidebar" 
           style="height:600px">
        <div dojoType="dijit.layout.BorderContainer" 
             design="sidebar" 
             style="width:200px;height:600px;border-bottom:1px solid gray" 
             region="left">
          <div dojoType="dijit.layout.ContentPane" 
               region="top"
               style="height:36px;border-bottom-style:ridge">
            <div id="FieldScope.Div.Toolbar" dojoType="dijit.Toolbar">
              <span>Mouse:</span>
            </div>
          </div>
          <div dojoType="dijit.layout.ContentPane" 
               region="center"
               style="height:462px;margin-top:8px">
            <span style="font-weight:bold">Chesapeake Bay:</span>
            <div style="width:100%;font-size:smaller" id="FieldScope.Layers.Controls"></div>
          </div>
          <div dojoType="dijit.layout.ContentPane" 
               region="bottom"
               style="height:100px;margin-top:8px"
               splitter="true">
            <span>Find a Location:</span>
            <div style="margin:2px">
              <input type="text" id="FieldScope.Input.SearchText" style="width:98%;margin-bottom:2px" onkeydown="application.OnSearchKey(event);" />
              <input type="button" value="Search" onclick="application.OnSearchClick(event);" />
              <div id="FieldScope.Div.SearchResults" style="width:98%;text-align:left;visibility:hidden"></div>
            </div>
          </div>
        </div>
        <div dojoType="dijit.layout.ContentPane" 
             region="center"
             style="border:1px inset gray;width:100%;height:598px" 
             id="FieldScope.Div.Map">
          Map
        </div>
      </div>
      <div style="border:2px solid gray">
        <div style="background-color:#DEDEDE;border-bottom:1px solid gray">
          <table width="100%">
            <tr>
              <td align="left">
                <img src="images/clipboard.gif" alt="" style="vertical-align:text-bottom" />
                Graph Pasteboard
              </td>
              <td align="right">
                <a style="text-decoration:none;float:right" 
                   href="javascript:void(0)" 
                   onclick="ToggleVisibility(this, $get('FieldScope_Pasteboard'));">
                  <span>Hide</span>
                  <img src="images/folder_open.gif" alt="" style="vertical-align:text-top" />
                </a>
              </td>
            </tr>
          </table>
        </div>
        <div id="FieldScope_Pasteboard" style="background-color:#F0F0F2;overflow:auto"></div>
      </div>
      <table style="width:100%;margin:2px">
        <tr>
          <td align="left">
            Logged in as 
            <asp:Label id="FieldScope_Username" runat="server" Text="" />
            <asp:LinkButton ID="FieldScope_Logout" runat="server" OnClick="LogoutButton_Click" Visible="false">
              logout
            </asp:LinkButton>
          </td>
          <td align="right"> 
            <a href="javascript:void(0);" onclick="Edit_User();">
              Settings...
            </a>
            &nbsp;
            <a href="javascript:void(0);" onclick="Send_Feedback();">
              Feedback...
            </a>
          </td>
        </tr>
      </table>
      <input id="FieldScope_State" runat="server" type="text" style="display:none" />
      <input id="FieldScope_Cookie" runat="server" type="text" style="display:none" />
    </form>
    
    <div id="FieldScope.EditUser.Dialog.Pane" style="display: none;">
	    <iframe id="FieldScope.EditUser" 
	            name="FieldScope.EditUser" 
	            src="EditUser.aspx"
	            width="450"
	            height="250"
	            frameborder="0"
	            onload="Set_Popup_Delegates(this);">
	    </iframe>
	  </div>
    
    <div id="FieldScope.Feedback.Dialog.Pane" style="display: none;">
	    <iframe id="FieldScope.Feedback" 
	            name="FieldScope.Feedback" 
	            src="Feedback.aspx"
	            width="500"
	            height="240"
	            frameborder="0"
	            onload="Set_Popup_Delegates(this);">
	    </iframe>
	  </div>
    
  </body>
</html>
