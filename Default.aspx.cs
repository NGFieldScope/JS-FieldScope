using System;
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
                if (user.AuthLevel == SqlServer.AuthLevel.Guest) {
                    FieldScope_Cookie.Value = "";
                    ClientScript.RegisterStartupScript(
                            typeof(Page),
                            "DisableUserFeatures",
                            @"$get('FieldScope_EditUser').style.display='none';
                              $get('FieldScope_Feedback').style.display='none';",
                            true
                        );
                } else {
                    FieldScope_Cookie.Value = user.Cookie;
                }
                if (user.AuthLevel != SqlServer.AuthLevel.Admin) {
                    ClientScript.RegisterStartupScript(
                            typeof(Page),
                            "DisableAdminFeatures",
                            @"$get('FieldScope_NewUser').style.display='none';",
                            true
                        );
                }
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
