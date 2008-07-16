<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MetaLensUpload.aspx.cs" Inherits="MetaLensUpload" smartnavigation="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>MetaLens Upload</title>
  </head>
  <body>
    <form id="FieldScope_MetaLens_Form" runat="server">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
        Upload Photo To MetaLens:<br />
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
              <asp:TextBox id="FieldScope_MetaLens_Description" runat="server" TextMode="Multiline" Rows="3" Width="200px" />
            </td>
          </tr>
        </table>
        <table width="98%">
          <tr>
            <td align="left" style="font-size:8pt">
              Logged in as 
              <asp:Label id="FieldScope_MetaLens_Username" runat="server" Text="" />
              <asp:LinkButton ID="FieldScope_MetaLens_Logout" runat="server" OnClick="LogoutButton_Click" Visible="false">
                logout
              </asp:LinkButton>
            </td>
            <td align="right" style="font-size:9pt">
              <asp:Button id="FieldScope_MetaLens_UploadButton" 
                          Text="Upload File" 
                          OnClick="UploadButton_Click" 
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
