using System;
using System.Drawing;
using System.Web;

public partial class Login : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }
    
    protected void LoginAs_Click (object sender, EventArgs e) {
        bool loginAsUser = FieldScope_LoginAs_User.Checked;
        FieldScope_Username.Enabled = loginAsUser;
        FieldScope_Username.ReadOnly = (!loginAsUser);
        FieldScope_Username.BackColor = loginAsUser ? Color.White : Color.LightGray;
        FieldScope_Password.Enabled = loginAsUser;
        FieldScope_Password.ReadOnly = (!loginAsUser);
        FieldScope_Password.BackColor = loginAsUser ? Color.White : Color.LightGray;
    }

    protected void LoginButton_Click (object sender, EventArgs e) {
        FieldScope_Login_Message.Visible = false;
        if (FieldScope_LoginAs_User.Checked) {
            string username = FieldScope_Username.Text;
            string password = FieldScope_Password.Text;
            string cookie = SqlServer.Service.CheckLogin(username, password);
            if (cookie != null) {
                HttpCookie c = new HttpCookie("FieldScope_Cookie", cookie);
                c.Expires = DateTime.Now.AddHours(4);
                Response.SetCookie(c);
                Response.Redirect("Default.aspx");
            } else {
                FieldScope_Login_Message.Text = "Invalid Login";
                FieldScope_Login_Message.Visible = true;
            }
        } else {
            HttpCookie c = new HttpCookie("FieldScope_Cookie", SqlServer.UserInfo.GUEST.Cookie);
            c.Expires = DateTime.Now.AddMinutes(60);
            Response.SetCookie(c);
            Response.Redirect("Default.aspx");
        }
    }
}
