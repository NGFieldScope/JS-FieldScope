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
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
        <table cellspacing="1" cellpadding="0" width="100%" style="font-size:small;vertical-align:top">
          <tr>
            <td colspan="6" style="font-size:medium;font-weight:bold;padding-bottom:8px">
              <asp:Label ID="FieldScope_Observation_EnterLabel" runat="server" Text="Enter Student Observation" />
              <asp:Label ID="FieldScope_Observation_ConfirmLabel" 
                         runat="server" 
                         Text="Confirm Observation:<br />Please double-check and ensure all your information is correct"
                         Visible="False" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Latitude:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Latitude" runat="server" Columns="10" />
              <asp:Label ID="FieldScope_Observation_Latitude_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Latitude_Units" runat="server">
                <asp:ListItem Text="deg" Value="deg" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Longitude:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Longitude" runat="server" Columns="10" />
              <asp:Label ID="FieldScope_Observation_Longitude_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Longitude_Units" runat="server">
                <asp:ListItem Text="deg" Value="deg" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Latitude_Validator" 
                                   runat="server" 
                                   ErrorMessage="Latitude is outisde the expected range of 36&deg; to 43&deg;" 
                                   ControlToValidate="FieldScope_Observation_Latitude" 
                                   OnServerValidate="Validate_Latitude" 
                                   Display="Dynamic" />
            </td>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Longitude_Validator" 
                                   runat="server" 
                                   ErrorMessage="Longitude is outisde the expected range of 74.5&deg; to 80.6&deg; West" 
                                   ControlToValidate="FieldScope_Observation_Longitude" 
                                   OnServerValidate="Validate_Longitude" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Water Temperature:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_WaterTemperature" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_WaterTemperature_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_WaterTemperature_Units" runat="server">
                <asp:ListItem Text="&deg;C" Value="C" />
                <asp:ListItem Text="&deg;F" Value="F" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Air Temperature:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_AirTemperature" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_AirTemperature_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_AirTemperature_Units" runat="server">
                <asp:ListItem Text="&deg;C" Value="C" />
                <asp:ListItem Text="&deg;F" Value="F" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_WaterTemperature_Validator" 
                                   runat="server" 
                                   ErrorMessage="Water Temperature is outisde the expected range of 0&deg; to 45&deg; C" 
                                   ControlToValidate="FieldScope_Observation_WaterTemperature" 
                                   OnServerValidate="Validate_WaterTemperature" 
                                   Display="Dynamic" />
            </td>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_AirTemperature_Validator" 
                                   runat="server" 
                                   ErrorMessage="Air Temperature is outisde the expected range of 0&deg; to 45&deg; C" 
                                   ControlToValidate="FieldScope_Observation_AirTemperature" 
                                   OnServerValidate="Validate_AirTemperature" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Salinity:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Salinity" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Salinity_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Salinity_Units" runat="server">
                <asp:ListItem Text="ppt" Value="ppt" />
                <asp:ListItem Text="ppm" Value="ppm" />
                <asp:ListItem Text="psu" Value="psu" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Conductivity:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Conductivity" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Conductivity_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Conductivity_Units" runat="server">
                <asp:ListItem Text="&micro;S/cm" Value="mS/cm" />
                <asp:ListItem Text="mho/cm " Value="mho/cm" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Salinity_Validator" 
                                   runat="server" 
                                   ErrorMessage="Salinity is outisde the expected range of 0 to 50 ppt" 
                                   ControlToValidate="FieldScope_Observation_Salinity" 
                                   OnServerValidate="Validate_Salinity" 
                                   Display="Dynamic" />
            </td>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Conductivity_Validator" 
                                   runat="server" 
                                   ErrorMessage="Conductivity is outisde the expected range of 0 to 100000 &micro;S/cm" 
                                   ControlToValidate="FieldScope_Observation_Conductivity" 
                                   OnServerValidate="Validate_Conductivity" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Turbidity:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Turbidity" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Turbidity_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Turbidity_Units" runat="server">
                <asp:ListItem Text="NTU" Value="NTU" />
                <asp:ListItem Text="FTU" Value="FTU" />
                <asp:ListItem Text="FAU" Value="FAU" />
              </asp:DropDownList>
            </td>
            
            <td style="font-weight:bold;padding-left:4px">
              Secchi Depth:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_SecchiDepth" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_SecchiDepth_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_SecchiDepth_Units" runat="server">
                <asp:ListItem Text="cm" Value="cm" />
                <asp:ListItem Text="in" Value="in" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Turbidity_Validator" 
                                   runat="server" 
                                   ErrorMessage="Turbidity is outisde the expected range of 0 to 400 NTU" 
                                   ControlToValidate="FieldScope_Observation_Turbidity" 
                                   OnServerValidate="Validate_Turbidity" 
                                   Display="Dynamic" />
            </td>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_SecchiDepth_Validator" 
                                   runat="server" 
                                   ErrorMessage="Secchi Depth is outisde the expected range of 0 to 500 cm" 
                                   ControlToValidate="FieldScope_Observation_SecchiDepth" 
                                   OnServerValidate="Validate_SecchiDepth" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Dissolved Oxygen:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Oxygen" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Oxygen_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Oxygen_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="OXYGEN[mg/L]" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              School Name:
            </td>
            <td colspan="2">
              <asp:TextBox ID="FieldScope_Observation_School" runat="server" Columns="24" />
              <asp:RequiredFieldValidator ID="FieldScope_Observation_School_Validator" 
                                          runat="server" 
                                          ControlToValidate="FieldScope_Observation_School" 
                                          ErrorMessage="<br />Please enter your school name" 
                                          Display="Dynamic" />
              <asp:Label ID="FieldScope_Observation_School_Label" runat="server" Visible="False" />
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Oxygen_Validator" 
                                   runat="server" 
                                   ErrorMessage="Dissolved Oxygen is outisde the expected range of 0 to 20 mg/L" 
                                   ControlToValidate="FieldScope_Observation_Oxygen" 
                                   OnServerValidate="Validate_Oxygen" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Nitrate:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Nitrogen" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Nitrogen_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Nitrogen_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="NITROGEN[mg/L]" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Collection Date:
            </td>
            <td colspan="2">
              <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                <ContentTemplate>
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
                </ContentTemplate>
              </asp:UpdatePanel>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Nitrogen_Validator" 
                                   runat="server" 
                                   ErrorMessage="Nitrate is outisde the expected range of 0 to 8 mg/L" 
                                   ControlToValidate="FieldScope_Observation_Nitrogen" 
                                   OnServerValidate="Validate_Nitrogen" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Phosphate:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Phosphorous" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Phosphorous_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Phosphorous_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="PHOSPHOROUS[mg/L]" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Time:
            </td>
            <td colspan="2">
              <asp:TextBox ID="FieldScope_Observation_Time" runat="server" Columns="8"/>
              <asp:RequiredFieldValidator ID="FieldScope_Observation_Time_Validator" 
                                          runat="server" 
                                          ControlToValidate="FieldScope_Observation_Time" 
                                          ErrorMessage="<br />Please enter the observation time" 
                                          Display="Dynamic" />
              <asp:Label ID="FieldScope_Observation_Time_Label" runat="server" Visible="False" />
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Phosphorous_Validator" 
                                   runat="server" 
                                   ErrorMessage="Phosphate is outisde the expected range of 0 to 8 mg/L" 
                                   ControlToValidate="FieldScope_Observation_Phosphorous" 
                                   OnServerValidate="Validate_Phosphorous" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          
          <tr>
            <td style="font-weight:bold">
              Ammonia:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_Ammonia" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_Ammonia_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_Ammonia_Units" runat="server">
                <asp:ListItem Text="mg/L" Value="AMMONIA[mg/L]" />
              </asp:DropDownList>
            </td>
            <td style="font-weight:bold;padding-left:4px">
              Field Notes:
            </td>
            <td colspan="2" rowspan="7">
              <asp:TextBox ID="FieldScope_Observation_Notes" 
                           runat="server" 
                           TextMode="MultiLine" 
                           Rows="7" 
                           Columns="32" 
                           Font-Size="Smaller" 
                           CssClass="notesTextBox" />
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_Ammonia_Validator" 
                                   runat="server" 
                                   ErrorMessage="Ammonia is outisde the expected range of 0 to 20 mg/L" 
                                   ControlToValidate="FieldScope_Observation_Ammonia" 
                                   OnServerValidate="Validate_Ammonia" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              pH:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_pH" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_pH_Label" runat="server" Visible="False" />
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:RangeValidator ID="FieldScope_Observation_pH_Validator" 
                                  runat="server" 
                                  ErrorMessage="pH is outisde the expected range of 0 to 14" 
                                  ControlToValidate="FieldScope_Observation_pH" 
                                  Type="Double" 
                                  MinimumValue="0"
                                  MaximumValue="14"
                                  Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td style="font-weight:bold">
              Relative Humidity:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_RelativeHumidity" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_RelativeHumidity_Label" runat="server" Visible="False" />
            </td>
            <td>
              %
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:RangeValidator ID="FieldScope_Observation_RelativeHumidity_Validator" 
                                  runat="server" 
                                  ErrorMessage="Relative Humidity is outisde the expected range of 0 to 100 %" 
                                  ControlToValidate="FieldScope_Observation_RelativeHumidity" 
                                  Type="Double" 
                                  MinimumValue="0"
                                  MaximumValue="100"
                                  Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
             <td style="font-weight:bold">
              Barometric Pressure:
            </td>
            <td align="right">
              <asp:TextBox ID="FieldScope_Observation_BarometricPressure" runat="server" Columns="6" />
              <asp:Label ID="FieldScope_Observation_BarometricPressure_Label" runat="server" Visible="False" />
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Observation_BarometricPressure_Units" runat="server">
                <asp:ListItem Text="mbar" Value="mbar" />
                <asp:ListItem Text="inHg" Value="inHg" />
              </asp:DropDownList>
            </td>
          </tr>
          <tr>
            <td colspan="3">
              <asp:CustomValidator ID="FieldScope_Observation_BarometricPressure_Validator" 
                                   runat="server" 
                                   ErrorMessage="Barometric Pressure is outisde the expected range of 100 to 1050 mbar" 
                                   ControlToValidate="FieldScope_Observation_BarometricPressure" 
                                   OnServerValidate="Validate_BarometricPressure" 
                                   Display="Dynamic" />
            </td>
          </tr>
          
          <tr>
            <td colspan="6" align="right" style="border-top:thin ridge;padding-top:4px">
              <asp:Button id="FieldScope_Observation_SubmitButton" 
                          Text="Save" 
                          OnClick="SaveButton_Click" 
                          runat="server" />
              <asp:Button id="FieldScope_Observation_CorrectButton" 
                          Text="Edit" 
                          OnClick="CorrectButton_Click" 
                          Visible="False"
                          runat="server" />
              <asp:Button id="FieldScope_Observation_ConfirmButton" 
                          Text="Confirm" 
                          OnClick="ConfirmButton_Click" 
                          Visible="False"
                          runat="server" />
            </td>
          </tr>
        </table>
      </div>
      <asp:Label ID="FieldScope_Observation_ServiceUrl" runat="server" Visible="False" />
      <asp:Label ID="FieldScope_Observation_ServiceName" runat="server" Visible="False" />
    </form>
  </body>
</html>
