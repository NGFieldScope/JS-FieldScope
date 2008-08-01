using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Xml;

public partial class StudentObservation : System.Web.UI.Page {

    protected void Page_Load(object sender, EventArgs e) {
        if (!IsPostBack) {
            FieldScope_Observation_Date.SelectedDate = DateTime.Now.Date;
            FieldScope_Observation_Date_Label.Text = FieldScope_Observation_Date.SelectedDate.ToString("d");
            string server = HttpUtility.UrlDecode(Request.QueryString["server"]);
            string service = HttpUtility.UrlDecode(Request.QueryString["service"]);
            string lat = HttpUtility.UrlDecode(Request.QueryString["lat"]);
            string lon = HttpUtility.UrlDecode(Request.QueryString["lon"]);
            Session["FieldScope_Obs_Server"] = server;
            Session["FieldScope_Obs_Service"] = service;
            Session["FieldScope_Obs_Lat"] = lat;
            Session["FieldScope_Obs_Lon"] = lon;
        }
    }

    protected void Edit_Date (object sender, EventArgs e) {
        FieldScope_Observation_Date.Visible = true;
        FieldScope_Observation_Date_Label.Visible = false;
        FieldScope_Observation_Date_Button.Visible = false;
    }

    protected void Date_Changed (object sender, EventArgs e) {
        FieldScope_Observation_Date_Label.Text = FieldScope_Observation_Date.SelectedDate.ToString("d");
        FieldScope_Observation_Date.Visible = false;
        FieldScope_Observation_Date_Label.Visible = true;
        FieldScope_Observation_Date_Button.Visible = true;
    }

    protected void SaveButton_Click (object sender, EventArgs evt) {
        string server = (string)Session["FieldScope_Obs_Server"];
        string service = (string)Session["FieldScope_Obs_Service"];
        string lat = (string)Session["FieldScope_Obs_Lat"];
        string lon = (string)Session["FieldScope_Obs_Lon"];
        string wfs = server + "/ArcGIS/services/" + service + "/GeoDataServer/WFSServer";
        Dictionary<string, string> values = new Dictionary<string, string>();
        values.Add("TEMPERATURE", FieldScope_Observation_Temperature.Text);
        values.Add("SALINITY", FieldScope_Observation_Salinity.Text);
        values.Add("TURBIDITY", FieldScope_Observation_Turbidity.Text);
        values.Add("OXYGEN", FieldScope_Observation_Oxygen.Text);
        values.Add("NITROGEN", FieldScope_Observation_Nitrogen.Text);
        values.Add("PHOSPHOROUS", FieldScope_Observation_Phosphorous.Text);
        values.Add("SCHOOL_NAME", FieldScope_Observation_School.Text);
        DateTime collectionTime = new DateTime();
        bool parsed = DateTime.TryParse(FieldScope_Observation_Time.Text, out collectionTime);
        values.Add("COLLECTION_DATE", FieldScope_Observation_Date.SelectedDate.ToString("yyyy-MM-dd") + "T" + collectionTime.ToString("HH:mm:ss"));
        values.Add("ENTRY_DATE", DateTime.Now.ToString("s"));
        values.Add("FIELD_NOTES", FieldScope_Observation_Notes.Text);
        XmlDocument result = WFS.Service.InsertPoint(wfs, service, "Shape", lat, lon, values);
        //Label1.Text = "Result: " + HttpUtility.HtmlEncode(result.ToString());
        XmlNamespaceManager xmlns = new XmlNamespaceManager(result.NameTable);
        xmlns.AddNamespace("wfs", "http://www.opengis.net/wfs");
        XmlNodeList total = result.SelectNodes("/wfs:TransactionResponse/wfs:TransactionSummary/wfs:totalInserted", xmlns);
        int totalInserted = (total.Count > 0) ? Int32.Parse(total.Item(0).InnerText) : 0;
        if (totalInserted > 0) {
            ClientScript.RegisterStartupScript(
                    typeof(Page),
                    "FieldScopeObservationUploadComplete",
                    // Use setTimeout here so the load handler on the iframe 
                    // (defined in js/Observation.js) has a chance to set the 
                    // FieldScopeObservationUploadComplete property on the 
                    // document before we try to call it
                   @"window.setTimeout(function () { document.FieldScopeObservationUploadComplete(); }, 100);",
                   true
                );
        }
    }
}
