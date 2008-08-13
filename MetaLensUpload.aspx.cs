using System;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;

public partial class MetaLensUpload : System.Web.UI.Page {

    const string USERNAME = "fieldscope_user";

    const string PASSWORD = "123321";

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
            if ((!Request.Cookies.AllKeys.Contains("MetaLens_Cookie")) ||
                (MetaLens.Service.CheckLogin(server, Request.Cookies["MetaLens_Cookie"].Value) == null)) {
                HttpCookie cookie = new HttpCookie("MetaLens_Cookie", MetaLens.Service.Login(server, USERNAME, PASSWORD));
                cookie.Expires = DateTime.Now.AddMinutes(60);
                Response.SetCookie(cookie);
            }
        }
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
            string school = null;
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if (user != null) {
                school = user.Organization;
            }
            string result = MetaLens.Service.PostAsset(server, cookie, input, lat, lon, name, caption, description, school);
            //string result = "complete";
            FieldScope_MetaLens_Message.Text = "Result: " + result;
            if (result == "complete") {
                ClientScript.RegisterStartupScript(typeof(Page),
                                                   "FieldScopeMetaLensUploadComplete",
                                                   // Use setTimeout here so the load handler on the iframe 
                                                   // (defined in js/MetaLens.js) has a chance to set the 
                                                   // FieldScopeMetaLensUploadComplete property on the 
                                                   // document before we try to call it
                                                   @"window.setTimeout(function () { document.FieldScopeMetaLensUploadComplete(); }, 100);",
                                                   true);
            }
        } else {
            FieldScope_MetaLens_Message.Text = "No File Selected";
        }
    }
}
