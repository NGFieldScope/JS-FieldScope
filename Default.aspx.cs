using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;

public partial class _Default : System.Web.UI.Page  {
    
    protected void Page_Load (object sender, EventArgs evt) {
        if (!Page.IsPostBack) {
            FieldScope_Username.Text = "";
            FieldScope_Logout.Visible = false;
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if (user != null) {
                FieldScope_Username.Text = user.Username;
                FieldScope_Logout.Visible = true;
                FieldScope_State.Value = user.State;
                FieldScope_Cookie.Value = user.Cookie;
            } else {
                Response.Redirect("Login.aspx");
            }
        }
    }
    
    protected void LogoutButton_Click (object sender, EventArgs evt) {
        HttpCookie c = new HttpCookie("FieldScope_Cookie", "");
        c.Expires = DateTime.Now.AddMinutes(-1);
        Response.SetCookie(c);
        Response.Redirect("Default.aspx");
    }
}
