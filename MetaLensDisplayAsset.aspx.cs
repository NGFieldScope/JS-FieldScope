using System;
using System.Web;

public partial class MetaLensDisplayAsset : System.Web.UI.Page {

    /*
     * Setup session variables & check for authentication
     */
    protected void Page_Load (object sender, EventArgs evt) {
        string server = Request.QueryString["server"];
        if (server != null) {
            server = HttpUtility.UrlDecode(server);
        } else {
            server = (string)Session["FieldScope_MetaLens_Server"];
        }
        string assetId = HttpUtility.UrlDecode(Request.QueryString["asset"]);
        
        //TODO: display different asset types differently
        FieldScope_MetaLens_Image.ImageUrl = server + "/assets/" + assetId + "/proxy/hires.cpx";

        MetaLens.AssetDescription asset = MetaLens.Service.GetDescription(server, assetId);
        FieldScope_MetaLens_Name.Text = asset.Name;
        FieldScope_MetaLens_Caption.Text = asset.Caption;
        FieldScope_MetaLens_Description.Text = asset.Description;
        FieldScope_MetaLens_Latitude.Text = asset.Latitude.ToString();
        FieldScope_MetaLens_Longitude.Text = asset.Longitude.ToString();
        FieldScope_MetaLens_Copyright.Text = asset.Copyright;
        FieldScope_MetaLens_Type.Text = asset.Type;
    }
}
