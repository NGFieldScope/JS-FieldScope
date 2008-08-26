<%@ Page Language="C#" AutoEventWireup="true" CodeFile="EditUser.aspx.cs" Inherits="EditUser" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>Edit User</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
	      <table width="100%">
	        <tr>
            <td align="right" style="font-weight:bold">
              Username:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Username" runat="server" width="225px" ReadOnly="True" Enabled="False" />
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
            <td colspan="2" style="font-weight:bold">
              <asp:CheckBox ID="FieldScope_Password_CheckBox" 
                            runat="server" 
                            Text="Change Password" 
                            OnCheckedChanged="PasswordCheckbox_Click" 
                            AutoPostBack="True" />
  		       </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              New Password:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Password_1" 
                           runat="server" 
                           width="170px" 
                           textmode="Password" 
                           Enabled="False" 
                           ReadOnly="True" 
                           BackColor="silver" />
            </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              Re-Type Password:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Password_2" 
                           runat="server" 
                           width="170px" 
                           textmode="Password" 
                           Enabled="False" 
                           ReadOnly="True" 
                           BackColor="silver" />
            </td>
  		    </tr>
		      <tr>
            <td align="right" colspan="2">
              <asp:Label id="FieldScope_EditUser_ErrorMessage" runat="server" Visible="False" ForeColor="Red" />
              &nbsp;
              <asp:Button id="FieldScope_EditUser_Button" runat="server" text="Save" OnClick="SaveUserButton_Click" />
            </td>
          </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
