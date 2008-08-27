using System;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Collections.Generic;

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

    protected void Other_Click (object sender, EventArgs e) {
        bool otherKeyword = CheckBox_Other.Checked;
        TextBox_Other.Enabled = otherKeyword;
        TextBox_Other.ReadOnly = (!otherKeyword);
        TextBox_Other.BackColor = otherKeyword ? Color.White : Color.LightGray;
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
            List<string> keywords = new List<string>();
            keywords.Add("FieldScope");
            keywords.Add("Student");
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if (user != null) {
                keywords.Add(user.Organization);
            }
            foreach (CheckBox cb in new CheckBox[] { CheckBox_PointSource, 
                                                     CheckBox_NonPointSource,
                                                     CheckBox_DegradedEcosystem,
                                                     CheckBox_HealthyEcosystem,
                                                     CheckBox_AlgalBloom,
                                                     CheckBox_Erosion,
                                                     CheckBox_Wetlands,
                                                     CheckBox_RiparianBuffer,
                                                     CheckBox_PlantSpecies,
                                                     CheckBox_AnimalSpecies }) {
                if (cb.Checked) {
                    keywords.Add(cb.Text);
                }
            }
            if (CheckBox_Other.Checked) {
                keywords.Add(TextBox_Other.Text);
            }
            string result = MetaLens.Service.PostAsset(server, cookie, input, lat, lon, name, caption, description, keywords.ToArray());
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
