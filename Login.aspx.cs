using System;
using System.Web;

public partial class Login : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }

    protected void LoginButton_Click (object sender, EventArgs e) {
        FieldScope_Login_Message.Visible = false;
        string username = FieldScope_Username.Text;
        string password = FieldScope_Password.Text;
        string cookie = SqlServer.Service.CheckLogin(username, password);
        if (cookie != null) {
            HttpCookie c = new HttpCookie("FieldScope_Cookie", cookie);
            c.Expires = DateTime.Now.AddMinutes(60);
            Response.SetCookie(c);
            Response.Redirect("Default.aspx");
        } else {
            FieldScope_Login_Message.Text = "Invalid Login";
            FieldScope_Login_Message.Visible = true;
        }
    }
}
