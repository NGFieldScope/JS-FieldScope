using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;

public partial class _Default : System.Web.UI.Page  {

    protected void Page_Load (object sender, EventArgs evt) {
        if (!Page.IsPostBack) {
            bool authorized = false;
            FieldScope_Username.Text = "";
            FieldScope_Logout.Visible = false;
            if (Request.Cookies.AllKeys.Contains("FieldScope_Cookie")) {
                // NOTE: DO NOT check that (Request.Cookies["FieldScope_Cookie"] == null), 
                // because this will not only always return false, it will also create 
                // an empty cookie named FieldScope_Cookie
                string cookie = Request.Cookies["FieldScope_Cookie"].Value;
                SqlServer.UserInfo user = SqlServer.Service.CheckLogin(cookie);
                if (user != null) {
                    authorized = true;
                    FieldScope_Username.Text = user.Username;
                    FieldScope_Logout.Visible = true;
                    FieldScope_State.Value = user.State;
                }
            }
            if (!authorized) {
                Response.Redirect("Login.aspx");
            }
        }
    }

    protected void SaveButton_Click (object sender, EventArgs evt) {
        string state = FieldScope_State.Value;
        string cookie = (string)Session["FieldScope_Cookie"];
        SqlServer.Service.StoreState(cookie, state);
    }

    protected void LogoutButton_Click (object sender, EventArgs evt) {
        Session["FieldScope_Cookie"] = Request.Cookies["FieldScope_Cookie"].Value;
        HttpCookie c = new HttpCookie("FieldScope_Cookie", "");
        c.Expires = DateTime.Now.AddMinutes(-1);
        Response.SetCookie(c);
        Response.Redirect("Default.aspx");
    }
}
