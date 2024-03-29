﻿<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Login.aspx.cs" Inherits="Login" smartnavigation="false" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>FieldScope Login Form</title>
  </head>
  <body>
    <form id="form1" runat="server" defaultbutton="FieldScope_Login_Button">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
	      <table>
	        <tr>
	          <td align="left" colspan="2">
	            Log in to FieldScope:
	          </td>
	        </tr>
	        <tr>
	          <td colspan="2">
              <asp:RadioButton ID="FieldScope_LoginAs_Guest" 
                               runat="server" 
                               groupname="LoginAs" 
                               OnCheckedChanged="LoginAs_Click"
                               AutoPostBack="True"
                               text="As guest user" 
                               checked="true"/>
	          </td>
	        </tr>
	        <tr>
	          <td colspan="2">
              <asp:RadioButton ID="FieldScope_LoginAs_User" 
                               runat="server" 
                               groupname="LoginAs" 
                               OnCheckedChanged="LoginAs_Click"
                               AutoPostBack="True"
                               text="As registered user" />
	            <table>
	              <tr>
                  <td align="right" style="font-weight:bold">
                    Username:
                  </td>
                  <td>
                    <asp:TextBox id="FieldScope_Username" 
                                 runat="server" 
                                 width="170px" 
                                 Enabled="False" 
                                 ReadOnly="True" 
                                 BackColor="silver"/>
                  </td>
  		          </tr>
  		          <tr>
                  <td align="right" style="font-weight:bold">
                    Password:
                  </td>
                  <td>
                    <asp:TextBox id="FieldScope_Password" 
                                 runat="server" 
                                 width="170px" 
                                 Enabled="False" 
                                 ReadOnly="True" 
                                 BackColor="silver" 
                                 textmode="Password" />
                  </td>
  		          </tr>
  		        </table>
	          </td>
	        </tr>
          <tr>
            <td align="left" style="color:#F00">
              <asp:Label id="FieldScope_Login_Message" runat="server" Visible="False" />
            </td>
            <td align="right">
              <asp:Button id="FieldScope_Login_Button" runat="server" text="Login" OnClick="LoginButton_Click" />
            </td>
          </tr>
          <tr>
            <td align="left">
              <a href="RequestAccount.aspx">New User...</a>
            </td>
            <td align="right">
              <a href="ResetPassword.aspx">Forgot Password?</a>
            </td>
          </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
