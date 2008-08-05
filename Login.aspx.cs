using System;
using System.Collections;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Xml.Linq;

public partial class Login : System.Web.UI.Page {

    protected void Page_Load (object sender, EventArgs e) { }

    protected void LoginButton_Click (object sender, EventArgs e) {
        FieldScope_Login_Message.Visible = false;
        string username = FieldScope_Username.Text;
        string password = FieldScope_Password.Text;
        string cookie = SqlServer.Service.CheckLogin(username, password);
        if (cookie != null) {
            Session["FieldScope_Cookie"] = cookie;
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
