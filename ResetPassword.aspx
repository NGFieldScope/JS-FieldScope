<%@ Page Language="C#" AutoEventWireup="true" CodeFile="ResetPassword.aspx.cs" Inherits="ResetPassword" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>Reset FieldScope Passwordr</title>
  </head>
  <body>
    <form id="form1" runat="server" defaultbutton="FieldScope_ResetPassword_Button">
      <div>
	      <table>
	        <tr>
	          <td colspan="2" style="font-weight:bold">
	            Reset FieldScope Password:
	          </td>
	        </tr>
	        <tr>
	          <td colspan="2">
	            Enter your username or the email address associated with your account:
	          </td>
	        </tr>
  		    <tr>
            <td align="left">
              <asp:TextBox id="FieldScope_Identity" runat="server" width="225px" />
            </td>
            <td width="100%"></td>
  		    </tr>
  		    <tr>
            <td align="right">
              <asp:Button id="FieldScope_ResetPassword_Button" runat="server" text="Reset Password" OnClick="ResetPasswordButton_Click" />
            </td>
            <td>&nbsp;</td>
  		    </tr>
	        <tr>
	          <td colspan="2">
	            An email with your new password will be sent to the address associated with your account.
	          </td>
	        </tr>
	        <tr>
	          <td colspan="2">
	            <asp:Label id="FieldScope_ResetPassword_Message" runat="server" Visible="False" />
	          </td>
	        </tr>
	        <tr>
	          <td colspan="2">
	            <a href="Login.aspx">Log In...</a>
	          </td>
	        </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
