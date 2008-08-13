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
    <form id="form1" runat="server" defaultbutton="FieldScope_Observation_SubmitButton">
      <div>
        <table cellspacing="1" cellpadding="0" width="100%" style="font-size:small">
          <tr style="vertical-align:top">
            <td colspan="5" style="font-size:medium;font-weight:bold">
              Enter Student Observation
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Water Temperature:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Temperature" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_Temperature_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Temperature value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Temperature" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Temperature_Units" runat="server">
                <asp:ListItem Text="&deg;C" Value="C" />
                <asp:ListItem Text="&deg;F" Value="F" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold">
              School Name:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_School" runat="server" Columns="24" />
              <asp:RequiredFieldValidator ID="FieldScope_Observation_School_Validator" 
                                          runat="server" 
                                          ControlToValidate="FieldScope_Observation_School" 
                                          ErrorMessage="<br />Please enter your school name" 
                                          Display="Dynamic" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Salinity:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Salinity" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_Salinity_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Salinity value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Salinity" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Salinity_Units" runat="server">
                <asp:ListItem Text="ppt" Value="ppt" />
                <asp:ListItem Text="ppm" Value="ppm" />
                <asp:ListItem Text="psu" Value="psu" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold">
              Date
            </td>
            <td>
              <asp:Label ID="FieldScope_Observation_Date_Label" runat="server" />
              <asp:Button ID="FieldScope_Observation_Date_Button" 
                          runat="server" 
                          Text="..."
                          OnClick="Edit_Date" 
                          CausesValidation="False" />
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
              <asp:CustomValidator ID="FieldScope_Observation_Turbidity_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Turbidity value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Turbidity" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Turbidity_Units" runat="server">
                <asp:ListItem Text="NTU" Value="NTU" />
                <asp:ListItem Text="FTU" Value="FTU" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold">
              Time:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Time" runat="server" Columns="8"/>
              <asp:RequiredFieldValidator ID="FieldScope_Observation_Time_Validator" 
                                          runat="server" 
                                          ControlToValidate="FieldScope_Observation_Time" 
                                          ErrorMessage="<br />Please enter the observation time" 
                                          Display="Dynamic" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Dissolved Oxygen:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Oxygen" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_Oxygen_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Dissolved oxygen value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Oxygen" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Oxygen_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="OXYGEN[mg/L]" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold">
              Field Notes:
            </td>
            <td rowspan="5">
              <asp:TextBox ID="FieldScope_Observation_Notes" 
                           runat="server" 
                           TextMode="MultiLine" 
                           Rows="8" 
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
              <asp:CustomValidator ID="FieldScope_Observation_Nitrogen_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Nitrogen value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Nitrogen" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Nitrogen_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="NITROGEN[mg/L]" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Phosphorous:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Phosphorous" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_Phosphorous_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Phosphorous value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Phosphorous" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Phosphorous_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="PHOSPHOROUS[mg/L]" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              pH:
            </td>
            <td colspan="2">
              <asp:TextBox ID="FieldScope_Observation_pH" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_pH_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />pH value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_pH" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td style="font-weight:bold">
              Conductivity:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Observation_Conductivity" runat="server" Columns="6" />
              <asp:CustomValidator ID="FieldScope_Observation_Conductivity_Validator" 
                                   runat="server" 
                                   ErrorMessage="<br />Conductivity value is not empty and is not a number" 
                                   ControlToValidate="FieldScope_Observation_Conductivity" 
                                   OnServerValidate="Validate_Number_Or_Empty" 
                                   Display="Dynamic" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Conductivity_Units" runat="server">
                <asp:ListItem Text="&micro;S/cm" Value="mS/cm" />
                <asp:ListItem Text="mho/cm " Value="mho/cm" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr style="vertical-align:top">
            <td colspan="5" align="right" style="border-top:thin ridge;padding-top:4px">
              <asp:Button id="FieldScope_Observation_SubmitButton" 
                          Text="Save" 
                          OnClick="SaveButton_Click" 
                          runat="server"/>
            </td>
          </tr>
        </table>
      </div>
    </form>
  </body>
</html>
