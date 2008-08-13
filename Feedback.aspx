<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Feedback.aspx.cs" Inherits="Feedback" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head id="Head1" runat="server">
    <title>FieldScope Feedback Form</title>
    <style type="text/css">
      .notesTextBox {
        font-family: sans-serif
      }
    </style>
  </head>
  <body>
    <form id="form1" runat="server" defaultbutton="FieldScope_Submit_Button">
      <asp:ScriptManager ID="ScriptManager2" runat="server" ScriptMode="Release"></asp:ScriptManager>
      <div>
	      <table>
	        <tr>
	          <td align="left" colspan="2">
	            FieldScope Feedback Form:
	          </td>
	        </tr>
	        <tr>
            <td align="right" style="font-weight:bold">
              Your Name:
            </td>
            <td>
              <asp:TextBox id="FieldScope_Name" runat="server" width="225px" />
            </td>
  		    </tr>
  		    <tr>
            <td align="right" style="font-weight:bold">
              Your Role:
            </td>
            <td>
              <asp:DropDownList ID="FieldScope_Role" runat="server">
                <asp:ListItem Text="Teacher" Value="Teacher" />
                <asp:ListItem Text="Student" Value="Student" />
                <asp:ListItem Text="Other" Value="Other" />
              </asp:DropDownList>
            </td>
  		    </tr>
  		    
  		    <tr>
            <td align="right" style="font-weight:bold;vertical-align:top">
              Feedback:
            </td>
            <td>
              <asp:TextBox ID="FieldScope_Feedback" 
                           runat="server" 
                           TextMode="MultiLine" 
                           Rows="6" 
                           Columns="48" 
                           Font-Size="Smaller" 
                           CssClass="notesTextBox" />
            </td>
  		    </tr>
		      <tr>
            <td align="right" colspan="2">
              <asp:Button id="FieldScope_Submit_Button" runat="server" text="Submit" OnClick="SubmitButton_Click" />
            </td>
          </tr>
  		  </table>
      </div>
    </form>
  </body>
</html>
