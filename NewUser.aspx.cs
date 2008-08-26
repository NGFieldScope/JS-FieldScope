using System;
using System.Drawing;
using System.Text;
using System.Web.UI;

public partial class NewUser : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) {
        if (!Page.IsPostBack) {
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if ((user == null) || (user.AuthLevel != SqlServer.AuthLevel.Admin)) {
                Response.Redirect("Login.aspx");
            }
        }
    }

    protected void NewUserButton_Click (object sender, EventArgs e) {
        FieldScope_NewUser_Message.Visible = false;
        FieldScope_NewUser_Message.ForeColor = Color.Red;

        string username = FieldScope_Username.Text;
        if (username.Length == 0) {
            FieldScope_NewUser_Message.Text = "Empty Username";
            FieldScope_NewUser_Message.Visible = true;
            return;
        } else if (SqlServer.Service.UsernameExists(username)) {
            FieldScope_NewUser_Message.Text = "Username Already Taken";
            FieldScope_NewUser_Message.Visible = true;
            return;
        }

        string organization = FieldScope_Organization.Text;
        if (organization.Length == 0) {
            FieldScope_NewUser_Message.Text = "Please Enter Your School or Organization";
            FieldScope_NewUser_Message.Visible = true;
            return;
        }

        string email = FieldScope_Email.Text;
        if (!Utilities.Regexp.EMAIL.IsMatch(email)) {
            FieldScope_NewUser_Message.Text = "Please Enter A Valid Email Address";
            FieldScope_NewUser_Message.Visible = true;
            return;
        }

        string password = "fieldscope!";

        if (SqlServer.Service.AddUser(username, password, organization, email) == 1) {
            FieldScope_Username.Text = "";
            FieldScope_Organization.Text = "";
            FieldScope_Email.Text = "";
            FieldScope_NewUser_Message.ForeColor = Color.Green;
            FieldScope_NewUser_Message.Text = "Account Successfully Created!";
            FieldScope_NewUser_Message.Visible = true;

            StringBuilder msg = new StringBuilder();
            msg.Append("The FieldScope user account you requested has been created. ");
            msg.Append("Your username is \"");
            msg.Append(username);
            msg.Append("\" and your password is \"");
            msg.Append(password);
            msg.Append("\". Log in to FieldScope at the URL: ");
            msg.Append("http://geode1.sesp.northwestern.edu/cbmap/");
            msg.AppendLine();
            msg.AppendLine();
            msg.AppendLine("--");
            msg.AppendLine("The FieldScope Team");

            Utilities.Email.Send(new string[] { email },
                                 "FieldScope Account Created",
                                 msg.ToString());
            
            ClientScript.RegisterStartupScript(
                    typeof(Page),
                    "FieldScopeFeedbackComplete",
                    // Use setTimeout here so that Set_Popup_Delegates
                    // (defined in Default.aspx) has a chance to set the 
                    // FieldScopeSaveUserComplete property on the document
                    // before we try to call it
                    @"window.setTimeout(function () { document.FieldScopeNewUserComplete(); }, 1000);",
                    true
                );
        } else {
            FieldScope_NewUser_Message.Text = "Unknown Error";
            FieldScope_NewUser_Message.Visible = true;
        }
    }
}
