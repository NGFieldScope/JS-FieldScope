<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MetaLensDisplayAsset.aspx.cs" Inherits="MetaLensDisplayAsset" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>Untitled Page</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <div>
        <asp:Image ID="FieldScope_MetaLens_Image" runat="server" style="float:left" />
        <table>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Name:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Name" runat="server" Text="Label" />
            </td>
          </tr>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Caption:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Caption" runat="server" Text="Label" />
            </td>
          </tr>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Description:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Description" runat="server" Text="Label" />
            </td>
          </tr>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Lat/Lon:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Latitude" runat="server" Text="Label" />, 
              <asp:Label ID="FieldScope_MetaLens_Longitude" runat="server" Text="Label" />
            </td>
          </tr>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Copyright:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Copyright" runat="server" Text="Label" />
            </td>
          </tr>
          <tr>
            <td style="text-align:right;vertical-align:top;font-weight:bold">
              Type:
            </td>
            <td>
              <asp:Label ID="FieldScope_MetaLens_Type" runat="server" Text="Label" />
            </td>
          </tr>
        </table>
      </div>
    </form>
  </body>
</html>
