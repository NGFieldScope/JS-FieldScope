<%@ Page Language="C#" AutoEventWireup="true" CodeFile="MetaLensLogin.aspx.cs" Inherits="MetaLensLogin" smartnavigation="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>MetaLens Login Form</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
	      <table width="100%">
	        <tr>
	          <td align="left" colspan="2">
	            MetaLens login:
	          </td>
	        </tr>
	        <tr>
            <td align="right" style="font-weight:bold">
              Username:
            </td>
            <td>
              <asp:TextBox id="FieldScope_MetaLens_Username" runat="server" width="170px" />
            </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              Password:
            </td>
            <td>
              <asp:TextBox id="FieldScope_MetaLens_Password" runat="server" width="170px" textmode="Password" />
            </td>
  		    </tr>
		      <tr>
            <td align="right" colspan="2" style="color:#F00">
              <asp:Label id="FieldScope_MetaLens_Message" runat="server" Visible="False" />
              <asp:Button id="FieldScope_MetaLens_Login" runat="server" text="Login" OnClick="LoginButton_Click" />
            </td>
          </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
