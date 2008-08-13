using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml;

public partial class StudentObservation : System.Web.UI.Page {

    delegate double UnitConverter (double value);
    static readonly UnitConverter IDENTITY = delegate (double value) { return value; };
    static readonly Dictionary<string,UnitConverter> UNIT_CONVERTERS = new Dictionary<string,UnitConverter>();
    static StudentObservation () {
        UNIT_CONVERTERS.Add("C", IDENTITY);
        UNIT_CONVERTERS.Add("F", delegate(double value) { return (value - 32.0) * (100.0 / (212.0 - 32.0)); });
        UNIT_CONVERTERS.Add("psu", IDENTITY);
        UNIT_CONVERTERS.Add("ppt", IDENTITY);
        UNIT_CONVERTERS.Add("ppm", delegate(double value) { return value / 1000.0; });
        UNIT_CONVERTERS.Add("NTU", IDENTITY);
        UNIT_CONVERTERS.Add("FTU", IDENTITY);
        UNIT_CONVERTERS.Add("OXYGEN[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("NITROGEN[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("PHOSPHOROUS[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("mS/cm", IDENTITY);
        UNIT_CONVERTERS.Add("mho/cm", IDENTITY);
    }
    
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
            SqlServer.UserInfo user = Utilities.User.GetCurrentUser(Request);
            if (user != null) {
                FieldScope_Observation_School.Text = user.Organization;
            }
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

    protected void Validate_Number_Or_Empty (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                double.Parse(args.Value);
                args.IsValid = true;
            } catch (FormatException e) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void SaveButton_Click (object sender, EventArgs evt) {
        if (IsValid) {
            string server = (string)Session["FieldScope_Obs_Server"];
            string service = (string)Session["FieldScope_Obs_Service"];
            string lat = (string)Session["FieldScope_Obs_Lat"];
            string lon = (string)Session["FieldScope_Obs_Lon"];
            string wfs = server + "/ArcGIS/services/" + service + "/GeoDataServer/WFSServer";
            Dictionary<string, string> values = new Dictionary<string, string>();

            string temperature = FieldScope_Observation_Temperature.Text;
            if (temperature.Length > 0) {
                string temperatureUnits = FieldScope_Observation_Temperature_Units.SelectedItem.Value;
                values.Add("TEMPERATURE", UNIT_CONVERTERS[temperatureUnits](double.Parse(temperature)).ToString());
            }
            string salinity = FieldScope_Observation_Salinity.Text;
            if (salinity.Length > 0) {
                string salinityUnits = FieldScope_Observation_Salinity_Units.SelectedItem.Value;
                values.Add("SALINITY", UNIT_CONVERTERS[salinityUnits](double.Parse(salinity)).ToString());
            }
            string turbidity = FieldScope_Observation_Turbidity.Text;
            if (turbidity.Length > 0) {
                string turbidityUnits = FieldScope_Observation_Turbidity_Units.SelectedItem.Value;
                values.Add("TURBIDITY", UNIT_CONVERTERS[turbidityUnits](double.Parse(turbidity)).ToString());
            }
            string oxygen = FieldScope_Observation_Oxygen.Text;
            if (oxygen.Length > 0) {
                string oxygenUnits = FieldScope_Observation_Oxygen_Units.SelectedItem.Value;
                values.Add("OXYGEN", UNIT_CONVERTERS[oxygenUnits](double.Parse(oxygen)).ToString());
            }
            string nitrogen = FieldScope_Observation_Nitrogen.Text;
            if (nitrogen.Length > 0) {
                string nitrogenUnits = FieldScope_Observation_Nitrogen_Units.SelectedItem.Value;
                values.Add("NITROGEN", UNIT_CONVERTERS[nitrogenUnits](double.Parse(nitrogen)).ToString());
            }
            string phosphorous = FieldScope_Observation_Phosphorous.Text;
            if (phosphorous.Length > 0) {
                string phosphorousUnits = FieldScope_Observation_Phosphorous_Units.SelectedItem.Value;
                values.Add("PHOSPHOROUS", UNIT_CONVERTERS[phosphorousUnits](double.Parse(phosphorous)).ToString());
            }
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
}
