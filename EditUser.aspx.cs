using System;
using System.Drawing;
using System.Linq;
using System.Web.UI;

public partial class EditUser : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { 
        if (!Page.IsPostBack) {
            FieldScope_Username.Text = "";
            FieldScope_Organization.Text = "";
            FieldScope_Email.Text = "";
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if (user != null) {
                FieldScope_Username.Text = user.Username;
                FieldScope_Organization.Text = user.Organization;
                FieldScope_Email.Text = user.Email;
            } else {
                Response.Redirect("Login.aspx");
            }
        }
    }

    protected void PasswordCheckbox_Click (object sender, EventArgs e) {
        bool changePw = FieldScope_Password_CheckBox.Checked;
        FieldScope_Password_1.Enabled = changePw;
        FieldScope_Password_1.ReadOnly = (!changePw);
        FieldScope_Password_1.BackColor = changePw ? Color.White : Color.LightGray;
        FieldScope_Password_2.Enabled = changePw;
        FieldScope_Password_2.ReadOnly = (!changePw);
        FieldScope_Password_2.BackColor = changePw ? Color.White : Color.LightGray;
    }

    protected void SaveUserButton_Click (object sender, EventArgs e) {
        FieldScope_EditUser_ErrorMessage.Visible = false;

        string username = FieldScope_Username.Text;
        
        string organization = FieldScope_Organization.Text;
        if (organization.Length == 0) {
            FieldScope_EditUser_ErrorMessage.Text = "Please Enter Your School or Organization";
            FieldScope_EditUser_ErrorMessage.Visible = true;
            return;
        }

        string email = FieldScope_Email.Text;
        if (!Utilities.Regexp.EMAIL.IsMatch(email)) {
            FieldScope_EditUser_ErrorMessage.Text = "Please Enter A Valid Email Address";
            FieldScope_EditUser_ErrorMessage.Visible = true;
            return;
        }
        
        string password1 = FieldScope_Password_1.Text;
        string password2 = FieldScope_Password_2.Text;
        if (FieldScope_Password_CheckBox.Checked) {
            if (!password1.Equals(password2)) {
                FieldScope_EditUser_ErrorMessage.Text = "Passwords Don't Match";
                FieldScope_EditUser_ErrorMessage.Visible = true;
                return;
            } else if (password1.Length == 0) {
                FieldScope_EditUser_ErrorMessage.Text = "Please Enter A Non-Empty Password";
                FieldScope_EditUser_ErrorMessage.Visible = true;
                return;
            }
            SqlServer.Service.SetPassword(username, password1);
        }

        SqlServer.Service.UpdateUser(username, organization, email);

        ClientScript.RegisterStartupScript(typeof(Page),
                                           "FieldScopeEditUserComplete",
                                           // Use setTimeout here so that Set_Popup_Delegates
                                           // (defined in Default.aspx) has a chance to set the 
                                           // FieldScopeSaveUserComplete property on the document
                                           // before we try to call it
                                           @"window.setTimeout(function () { document.FieldScopeEditUserComplete(); }, 100);",
                                           true);
    }
}
