using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;

public partial class MetaLensUpload : System.Web.UI.Page {
    
    /*
     * Setup session variables & check for authentication
     */
    protected void Page_Load (object sender, EventArgs evt) {
        if (!Page.IsPostBack) {
            string server = Request.QueryString["server"];
            if (server != null) {
                server = HttpUtility.UrlDecode(server);
                Session["FieldScope_MetaLens_Server"] = server;
            } else {
                server = (string)Session["FieldScope_MetaLens_Server"];
            }
            string lat = Request.QueryString["lat"];
            if (lat != null) {
                lat = HttpUtility.UrlDecode(lat);
                Session["FieldScope_MetaLens_Latitude"] = lat;
            } else {
                lat = (string)Session["FieldScope_MetaLens_Latitude"];
            }
            string lon = Request.QueryString["lon"];
            if (lon != null) {
                lon = HttpUtility.UrlDecode(lon);
                Session["FieldScope_MetaLens_Longitude"] = lon;
            } else {
                lon = (string)Session["FieldScope_MetaLens_Longitude"];
            }
            bool authorized = false;
            FieldScope_MetaLens_Username.Text = "";
            FieldScope_MetaLens_Logout.Visible = false;
            if (Request.Cookies.AllKeys.Contains("MetaLens_Cookie")) {
                // NOTE: DO NOT check that (Request.Cookies["MetaLens_Cookie"] == null), 
                // because this will not only always return false, it will also create 
                // an empty cookie named MetaLens_Cookie
                string username = MetaLens.Service.CheckLogin(server, Request.Cookies["MetaLens_Cookie"].Value);
                if (username != "") {
                    authorized = true;
                    FieldScope_MetaLens_Username.Text = username;
                    FieldScope_MetaLens_Logout.Visible = true;
                }
            }
            if (!authorized) {
                Response.Redirect("MetaLensLogin.aspx");
            }
        }
    }

    protected void LogoutButton_Click (object sender, EventArgs evt) {
        HttpCookie c = new HttpCookie("MetaLens_Cookie", "");
        c.Expires = DateTime.Now.AddMinutes(-1);
        Response.SetCookie(c);
        Response.Redirect("MetaLensUpload.aspx");
    }

    protected void UploadButton_Click (object sender, EventArgs evt) {
        if (FieldScope_MetaLens_FileUpload.HasFile) {
            string server = (string)Session["FieldScope_MetaLens_Server"];
            string cookie = Request.Cookies["MetaLens_Cookie"].Value;
            Stream input = FieldScope_MetaLens_FileUpload.PostedFile.InputStream;
            string lat = (string)Session["FieldScope_MetaLens_Latitude"];
            string lon = (string)Session["FieldScope_MetaLens_Longitude"];
            string name = FieldScope_MetaLens_FileUpload.FileName;
            string caption = FieldScope_MetaLens_Caption.Text;
            string description = FieldScope_MetaLens_Description.Text;
            string result = MetaLens.Service.PostAsset(server, cookie, input, lat, lon, name, caption, description);
            Label1.Text = "Result: " + result;
            if (result == "complete") {
                ClientScript.RegisterStartupScript(typeof(Page),
                                                   "FieldScopeMetaLensUploadComplete",
                                                   // Use setTimeout here so the load handler on the iframe 
                                                   // (defined in js/MetaLens.js) has a chance to set the 
                                                   // FieldScopeMetaLensUploadComplete property on the 
                                                   // document before we try to call it
                                                   "window.setTimeout(function () { document.FieldScopeMetaLensUploadComplete(); }, 0);",
                                                   true);
            }
        } else {
            Label1.Text = "No File Selected";
        }
    }
}
