using System;
using System.Web;

public partial class RequestSubmitted : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }

    protected void LoginAsGuest (object sender, EventArgs e) {
        HttpCookie c = new HttpCookie("FieldScope_Cookie", SqlServer.UserInfo.GUEST.Cookie);
        c.Expires = DateTime.Now.AddMinutes(60);
        Response.SetCookie(c);
        Response.Redirect("Default.aspx");
    }
}
