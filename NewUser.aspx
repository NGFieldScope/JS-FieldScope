﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="NewUser.aspx.cs" Inherits="NewUser" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>New FieldScope User</title>
  </head>
  <body>
    <form id="form1" runat="server" defaultbutton="FieldScope_NewUser_Button">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
	      <table>
	        <tr>
	          <td align="left" colspan="2">
	            New FieldScope User Account:
	          </td>
	        </tr>
	        <tr>
            <td align="right" style="font-weight:bold">
              Username:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Username" runat="server" width="225px" />
            </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              School/Organization:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Organization" runat="server" width="225px" />
            </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              Email Address:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Email" runat="server" width="225px" />
            </td>
  		    </tr>
		      <tr>
            <td align="right" colspan="2">
              <asp:Label id="FieldScope_NewUser_Message" runat="server" Visible="False" ForeColor="Red" />
              &nbsp;
              <asp:Button id="FieldScope_NewUser_Button" runat="server" text="Create User" OnClick="NewUserButton_Click" />
            </td>
          </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
