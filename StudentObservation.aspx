<%@ Page Language="C#" AutoEventWireup="true" CodeFile="StudentObservation.aspx.cs" Inherits="StudentObservation" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>Enter Student Observation</title>
    <style type="text/css">
      .notesTextBox {
        font-family: sans-serif
      }
    </style>
  </head>
  <body>
    <form id="form1" runat="server">
      <div>
        <table cellspacing="1" cellpadding="0" width="100%" style="font-size:small">
          <tr style="vertical-align:top">
            <td colspan="4" style="font-size:medium;font-weight:bold">
              Enter Student Observation
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Water Temperature:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Temperature" runat="server" Columns="6" />
            </td>
            <td style="font-weight:bold">
              School Name:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_School" runat="server" Columns="24" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Salinity:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Salinity" runat="server" Columns="6" />
            </td>
            <td style="font-weight:bold">
              Date
            </td>
            <td>
              <asp:Label ID="FieldScope_Observation_Date_Label" runat="server" />
              <asp:Button ID="FieldScope_Observation_Date_Button" 
                          runat="server" 
                          Text="..."
                          OnClick="Edit_Date" />
              <asp:Calendar ID="FieldScope_Observation_Date" 
                            runat="server" 
                            Font-Size="XX-Small" 
                            SelectionMode="Day"
                            OnSelectionChanged="Date_Changed"
                            CellPadding="1"
                            CellSpacing="0"
                            Visible="false" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Turbidity:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Turbidity" runat="server" Columns="6" />
            </td>
            <td style="font-weight:bold">
              Time:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Time" runat="server" Columns="8"/>
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Dissolved Oxygen:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Oxygen" runat="server" Columns="6" />
            </td>
            <td style="font-weight:bold">
              Field Notes:
            </td>
            <td rowspan="3">
              <asp:TextBox ID="FieldScope_Observation_Notes" 
                           runat="server" 
                           TextMode="MultiLine" 
                           Rows="4" 
                           Columns="32" 
                           Font-Size="Smaller" 
                           CssClass="notesTextBox" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Nitrogen:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Nitrogen" runat="server" Columns="6" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Phosphorous:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Phosphorous" runat="server" Columns="6" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td colspan="4" align="right" style="border-top:thin ridge;padding-top:4px">
              <asp:Button id="FieldScope_Observation_SubmitButton" 
                          Text="Save" 
                          OnClick="SaveButton_Click" 
                          runat="server"/>
            </td>
          </tr>
          <tr>
            <td>
              <asp:Label id="Label1" runat="server" Text="" />
            </td>
          </tr>
        </table>
      </div>
    </form>
  </body>
</html>
