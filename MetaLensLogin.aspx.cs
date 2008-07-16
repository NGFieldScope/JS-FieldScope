using System;
using System.Web;

public partial class MetaLensLogin : System.Web.UI.Page {
    
    protected void Page_Load (object sender, EventArgs e) { }

    protected void LoginButton_Click (object sender, EventArgs e) {
        string server = (string)Session["FieldScope_MetaLens_Server"];
        FieldScope_MetaLens_Message.Visible = false;
        string username = FieldScope_MetaLens_Username.Text;
        if (username == "") {
            FieldScope_MetaLens_Message.Text = "Empty Username";
            FieldScope_MetaLens_Message.Visible = true;
        }
        string password = FieldScope_MetaLens_Password.Text;
        string cookie = MetaLens.Service.Login(server, username, password);
        if (cookie == null) {
            FieldScope_MetaLens_Message.Text = "Invalid Login";
            FieldScope_MetaLens_Message.Visible = true;
        } else {
            HttpCookie c = new HttpCookie("MetaLens_Cookie", cookie);
            c.Expires = DateTime.Now.AddMinutes(60);
            Response.SetCookie(c);
            Response.Redirect("MetaLensUpload.aspx");
        }
    }
}
