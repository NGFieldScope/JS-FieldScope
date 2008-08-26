using System;
using System.Text;

public partial class RequestAccount : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }

    protected void NewUserButton_Click (object sender, EventArgs e) {
        string username = FieldScope_Username.Text;
        if (username.Length == 0) {
            FieldScope_NewUser_ErrorMessage.Text = "Empty Username";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        } else if (SqlServer.Service.UsernameExists(username)) {
            FieldScope_NewUser_ErrorMessage.Text = "Username Already Taken";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        }

        string organization = FieldScope_Organization.Text;
        if (organization.Length == 0) {
            FieldScope_NewUser_ErrorMessage.Text = "Please Enter Your School or Organization";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        }

        string email = FieldScope_Email.Text;
        if (!Utilities.Regexp.EMAIL.IsMatch(email)) {
            FieldScope_NewUser_ErrorMessage.Text = "Please Enter A Valid Email Address";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        }
        
        StringBuilder msg = new StringBuilder();
        msg.Append("A user has requested a new FieldScope account: ");
        msg.AppendLine();
        msg.Append("      username: ");
        msg.Append(username);
        msg.AppendLine();
        msg.Append("  organization: ");
        msg.Append(organization);
        msg.AppendLine();
        msg.Append("         email: ");
        msg.Append(email);
        msg.AppendLine();
        msg.AppendLine();
        msg.AppendLine("--");
        msg.AppendLine("FieldScope");

        Utilities.Email.Send(new string[] { "soconnor@ngs.org", "ERussell@ngs.org" },
                             "FieldScope Account Request",
                             msg.ToString());
        
        Response.Redirect("RequestSubmitted.aspx");
    }
}
