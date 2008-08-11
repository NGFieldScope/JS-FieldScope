using System;
using System.Web;

public partial class NewUser : System.Web.UI.Page {

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
        
        string password1 = FieldScope_Password_1.Text;
        string password2 = FieldScope_Password_2.Text;
        if (!password1.Equals(password2)) {
            FieldScope_NewUser_ErrorMessage.Text = "Passwords Don't Match";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        } else if (password1.Length == 0) {
            FieldScope_NewUser_ErrorMessage.Text = "Please Choose A Non-Empty Password";
            FieldScope_NewUser_ErrorMessage.Visible = true;
            return;
        }
        
        if (SqlServer.Service.AddUser(username, password1, organization, email) == 1) {
            string cookie = SqlServer.Service.CheckLogin(username, password1);
            if (cookie != null) {
                HttpCookie c = new HttpCookie("FieldScope_Cookie", cookie);
                c.Expires = DateTime.Now.AddMinutes(60);
                Response.SetCookie(c);
                Response.Redirect("Default.aspx");
            } else {
                FieldScope_NewUser_ErrorMessage.Text = "Unable To Create Account";
                FieldScope_NewUser_ErrorMessage.Visible = true;
            }
        } else {
            FieldScope_NewUser_ErrorMessage.Text = "Unknown Error";
            FieldScope_NewUser_ErrorMessage.Visible = true;
        }
    }
}
