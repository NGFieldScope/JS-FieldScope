<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MetaLensUpload.aspx.cs" Inherits="MetaLensUpload" smartnavigation="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>MetaLens Upload</title>
  </head>
  <body>
    <form id="FieldScope_MetaLens_Form" runat="server">
      <asp:ScriptManager ID="ScriptManager1" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
        Upload Photo To FieldScope:<br />
        <table width="98%">
          <tr>
            <td colspan="2">
              <asp:FileUpload ID="FieldScope_MetaLens_FileUpload" runat="server" Width="100%" />
            </td>
          </tr>
          <tr>
            <td align="right">
              Photo Caption:
            </td>
            <td>
              <asp:TextBox id="FieldScope_MetaLens_Caption" runat="server" Width="98%" />
            </td>
          </tr>
          <tr>
            <td align="right">
              Photo Description:
            </td>
            <td>
              <asp:TextBox id="FieldScope_MetaLens_Description" runat="server" TextMode="Multiline" Rows="3" Width="325px" />
            </td>
          </tr>
          <tr>
            <td align="right">
              Keywords:
            </td>
            <td style="font-size:small">
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_PointSource" runat="server" Text="Point Source" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_NonPointSource" runat="server" Text="Non-point Source" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_DegradedEcosystem" runat="server" Text="Degraded Ecosystem" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_HealthyEcosystem" runat="server" Text="Healthy Ecosystem" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_AlgalBloom" runat="server" Text="Algal Bloom" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_Erosion" runat="server" Text="Erosion" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_Wetlands" runat="server" Text="Wetlands" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_RiparianBuffer" runat="server" Text="Riparian Buffer" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_PlantSpecies" runat="server" Text="Plant Species" />
              </span>
              <span style="white-space: nowrap">
                <asp:CheckBox ID="CheckBox_AnimalSpecies" runat="server" Text="Animal Species" />
              </span>
              <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                <ContentTemplate>
                  <span style="white-space: nowrap">
                    <!-- Wrap this in an update panel so checking or unchecking the box doesn't clear the FileUpload -->
                    <asp:CheckBox ID="CheckBox_Other" 
                                  runat="server" 
                                  Text="Other:" 
                                  OnCheckedChanged="Other_Click"
                                  AutoPostBack="True" />
                    <asp:TextBox id="TextBox_Other" 
                                 runat="server" 
                                 Enabled="False" 
                                 ReadOnly="True" 
                                 BackColor="silver" />
                  </span>
                </ContentTemplate>
              </asp:UpdatePanel>
            </td>
          </tr>
        </table>
        <table width="98%">
          <tr>
            <td align="left" style="color:#F00">
              <asp:Label id="FieldScope_MetaLens_Message" runat="server" Text="" />
            </td>
            <td align="right" style="font-size:9pt">
              <asp:Button id="FieldScope_MetaLens_UploadButton" 
                          Text="Upload Photo" 
                          OnClick="UploadButton_Click" 
                          runat="server"/>
            </td>
          </tr>
        </table>
      </div>
    </form>
  </body>
</html>
