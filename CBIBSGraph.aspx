﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="CBIBSGraph.aspx.cs" Inherits="CBIBSGraph" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>CBIBS Graph</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <div>
        <table cellpadding="2" width="100%">
          <tr style="vertical-align:top">
            <td colspan="3">
              Variable:
              <asp:DropDownList ID="FieldScope_CBIBS_Variable_Menu" runat="server" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td>
              Begin Date:
              <asp:Label ID="FieldScope_CBIBS_Begin_Date_Label" runat="server" Text="" />
              <asp:Button ID="FieldScope_CBIBS_Begin_Date_Button" 
                          runat="server" 
                          Text="..." 
                          OnClick="Edit_BeginDate" />
              <asp:Calendar ID="FieldScope_CBIBS_Begin_Date" 
                            runat="server" 
                            font-size="8pt" 
                            SelectionMode = "Day"
                            OnSelectionChanged="BeginDate_Changed"
                            CellPadding="1"
                            CellSpacing="0"
                            Visible="false" />
            </td>
            <td></td>
            <td>
              End Date:
              <asp:Label ID="FieldScope_CBIBS_End_Date_Label" runat="server" Text="" />
              <asp:Button ID="FieldScope_CBIBS_End_Date_Button" 
                          runat="server" 
                          Text="..."
                          OnClick="Edit_EndDate" />
              <asp:Calendar ID="FieldScope_CBIBS_End_Date" 
                            runat="server" 
                            font-size="8pt" 
                            SelectionMode = "Day"
                            OnSelectionChanged="EndDate_Changed"
                            CellPadding="1"
                            CellSpacing="0"
                            Visible="false" />
            </td>
          </tr>
          <tr>
            <td colspan="3" style="text-align:right;vertical-align:middle">
              <asp:Button id="FieldScope_CBIBS_Generate_Button" runat="server" text="Generate Graph" Enabled="false" OnClick="GenerateGraph_Click" />
            </td>
        </table>
        <asp:Image ID="FieldScope_CBIBS_Chart_Image" runat="server" Visible="false" />
        <br />
        <asp:Label ID="Test1" runat="server" Text="" />
      </div>
    </form>
  </body>
</html>