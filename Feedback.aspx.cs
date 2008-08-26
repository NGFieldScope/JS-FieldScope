using System;
using System.Text;
using System.Web.UI;

public partial class Feedback : System.Web.UI.Page {
    
    protected void Page_Load (object sender, EventArgs e) { }

    protected void SubmitButton_Click (object sender, EventArgs e) {
        StringBuilder msg = new StringBuilder();
        SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
        if (user != null) {
            msg.Append("Fieldscope Account Information: ");
            msg.AppendLine();
            msg.Append("    username: ");
            msg.Append(user.Username);
            msg.AppendLine();
            msg.Append("    email: ");
            msg.Append(user.Email);
            msg.AppendLine();
            msg.Append("    organization: ");
            msg.Append(user.Organization);
            msg.AppendLine();
        }
        msg.Append("Name: ");
        msg.Append(FieldScope_Name.Text);
        msg.AppendLine();
        msg.Append("Role: ");
        msg.Append(FieldScope_Role.SelectedItem.Text);
        msg.AppendLine();
        msg.Append("Message: ");
        msg.AppendLine();
        msg.Append(FieldScope_Feedback.Text);
        
        Utilities.Email.Send(new string[] { "soconnor@ngs.org", "ERussell@ngs.org" },
                             "FieldScope Feedback",
                             msg.ToString());
        
        ClientScript.RegisterStartupScript(typeof(Page),
                                           "FieldScopeFeedbackComplete",
                                           // Use setTimeout here so that Set_Popup_Delegates
                                           // (defined in Default.aspx) has a chance to set the 
                                           // FieldScopeSaveUserComplete property on the document
                                           // before we try to call it
                                           @"window.setTimeout(function () { document.FieldScopeFeedbackComplete(); }, 100);",
                                           true);
    }
}
