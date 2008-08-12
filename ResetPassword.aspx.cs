using System;
using System.Drawing;
using System.Web;
using System.Net;
using System.Net.Mail;

public partial class ResetPassword : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }

    protected void ResetPasswordButton_Click (object sender, EventArgs e) {
        string searchText = FieldScope_Identity.Text;
        SqlServer.UserInfo user = SqlServer.Service.FindUser(searchText);
        if (user != null) {
            string newPassword = String.Format("fsp{0:000}", DateTime.Now.Millisecond);
            SqlServer.Service.SetPassword(user.Username, newPassword);
            MailMessage mail = new MailMessage("noreply@geode1.sesp.northwestern.edu", user.Email);
            mail.Subject = "FieldScope Password Reset";
            mail.Body = "Your FieldScope username is \"" +
                        user.Username +
                        "\" and your password has been reset to \"" +
                        newPassword +
                        "\". <a href=\"http://geode1.sesp.northwestern.edu/cbmap/\">Log In</a>";
            SmtpClient mailClient = new SmtpClient("geode1.sesp.northwestern.edu");
            mailClient.UseDefaultCredentials = false;
            mailClient.Credentials = new NetworkCredential("smtp_user", "ches$by1");
            mailClient.Port = 25;
            mailClient.Send(mail);
            FieldScope_ResetPassword_Message.ForeColor = Color.DarkGreen;
            FieldScope_ResetPassword_Message.Text = "New password sent to \"" + user.Email + "\". Check your mailbox for the new password";
            FieldScope_ResetPassword_Message.Visible = true;
            FieldScope_ResetPassword_Button.Visible = false;
        } else {
            FieldScope_ResetPassword_Message.ForeColor = Color.Red;
            FieldScope_ResetPassword_Message.Text = "Username or email not found";
            FieldScope_ResetPassword_Message.Visible = true;
        }
    }
}
