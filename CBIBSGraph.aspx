<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CBIBSGraph.aspx.cs" Inherits="CBIBSGraph" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>CBIBS Graph</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
        <table cellpadding="2" width="100%" style="font-size:small">
          <tr style="vertical-align:top">
            <td colspan="4">
              Variable:
              <asp:DropDownList ID="FieldScope_CBIBS_Variable_Menu" 
                                runat="server" 
                                AutoPostBack="true"
                                OnSelectedIndexChanged="Variable_Changed" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td>
              Begin Date:
              <asp:Label ID="FieldScope_CBIBS_Begin_Date_Label" runat="server" />
              <asp:Button ID="FieldScope_CBIBS_Begin_Date_Button" 
                          runat="server" 
                          Text="..." 
                          OnClick="Edit_BeginDate" />
              <asp:Calendar ID="FieldScope_CBIBS_Begin_Date" 
                            runat="server" 
                            Font-Size="XX-Small" 
                            SelectionMode = "Day"
                            OnSelectionChanged="BeginDate_Changed"
                            CellPadding="1"
                            CellSpacing="0"
                            Visible="false" />
            </td>
            <td></td>
            <td>
              End Date:
              <asp:Label ID="FieldScope_CBIBS_End_Date_Label" runat="server" />
              <asp:Button ID="FieldScope_CBIBS_End_Date_Button" 
                          runat="server" 
                          Text="..."
                          OnClick="Edit_EndDate" />
              <asp:Calendar ID="FieldScope_CBIBS_End_Date" 
                            runat="server" 
                            Font-Size="XX-Small" 
                            SelectionMode = "Day"
                            OnSelectionChanged="EndDate_Changed"
                            CellPadding="1"
                            CellSpacing="0"
                            Visible="false" />
            </td>
            <td>
              <input id="FieldScope_CBIBS_SaveGraph_Button" 
                     type="button" 
                     value="Save" 
                     onclick="document.FieldScopeCBIBSSaveGraph($get('FieldScope_CBIBS_Chart_Image'));" />
            </td>
          </tr>
        </table>
        <asp:Image ID="FieldScope_CBIBS_Chart_Image" runat="server" Visible="false" />
      </div>
    </form>
  </body>
</html>
