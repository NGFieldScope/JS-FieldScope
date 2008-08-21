using System;
using System.Text;
using System.Web;

public partial class CBIBSGraph : System.Web.UI.Page {

    static string COMPLEX_ENCODING_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.";

    static Utilities.NameMap NAMES = new Utilities.NameMap();
    static CBIBSGraph () {
        // Water quality variables
        NAMES.Add("concentration_of_chlorophyll_in_sea_water", "Chlorophyll A");
        NAMES.Add("concentration_of_oxygen_in_sea_water", "Dissolved Oxygen");
        NAMES.Add("simple_turbidity", "Turbidity");
        NAMES.Add("sea_water_electrical_conductivity", "Water Conductivity");
        NAMES.Add("sea_water_salinity", "Water Salinity");
        NAMES.Add("sea_water_temperature", "Water Temperature");
        // Atmospheric parameters
        NAMES.Add("air_pressure", "Air Pressure");
        NAMES.Add("air_temperature", "Air Temperature");
        NAMES.Add("relative_humidity", "Relative Humidity");
        NAMES.Add("wind_speed", "Wind Speed");
    }
    
    static void encode (double value, double min, double max, StringBuilder sb) {
        if (min == max) {
            // sanity check: sometimes we get bad values
            sb.Append("AA");
        } else {
            int iValue = (int)((value - min) / ((max - min) / 4095.0));
            sb.Append(COMPLEX_ENCODING_ALPHABET[(int)Math.Floor(iValue / 64.0)]);
            sb.Append(COMPLEX_ENCODING_ALPHABET[iValue % 64]);
        }
    }

    protected void Page_Load(object sender, EventArgs e) {
        if (!IsPostBack) {
            FieldScope_CBIBS_End_Date.SelectedDate = DateTime.Now.Date;
            FieldScope_CBIBS_End_Date_Label.Text = FieldScope_CBIBS_End_Date.SelectedDate.ToString("d");
            FieldScope_CBIBS_Begin_Date.SelectedDate = DateTime.Now.AddDays(-1).Date;
            FieldScope_CBIBS_Begin_Date_Label.Text = FieldScope_CBIBS_Begin_Date.SelectedDate.ToString("d");
            FieldScope_CBIBS_Variable_Menu.Items.Add("");
            string platformId = Request.QueryString["platform"];
            string platformName = Request.QueryString["name"];
            if (platformId != null) {
                Session["FieldScope_CBIBS_Platform"] = platformId;
                Session["FieldScope_CBIBS_Name"] = platformName;
                CBIBS.Platform p = new CBIBS.Platform("CBIBS", platformId);
                foreach (string variable in CBIBS.Service.ListParameters(p)) {
                    if (NAMES.ContainsInternalName(variable)) {
                        FieldScope_CBIBS_Variable_Menu.Items.Add(NAMES.PresentationName(variable));
                    }
                }
                FieldScope_CBIBS_Variable_Menu.SelectedIndex = 0;
            }
        }
    }

    protected void Edit_BeginDate (object sender, EventArgs e) {
        FieldScope_CBIBS_Begin_Date.Visible = true;
        FieldScope_CBIBS_Begin_Date_Label.Visible = false;
        FieldScope_CBIBS_Begin_Date_Button.Visible = false;
    }

    protected void BeginDate_Changed (object sender, EventArgs e) {
        if (FieldScope_CBIBS_End_Date.SelectedDate <= FieldScope_CBIBS_Begin_Date.SelectedDate) {
            DateTime newDate = FieldScope_CBIBS_Begin_Date.SelectedDate.AddDays(1);
            FieldScope_CBIBS_End_Date.SelectedDate = newDate.Date;
            FieldScope_CBIBS_End_Date.VisibleDate = newDate.Date;
            FieldScope_CBIBS_End_Date_Label.Text = FieldScope_CBIBS_End_Date.SelectedDate.ToString("d");
        }
        FieldScope_CBIBS_Begin_Date_Label.Text = FieldScope_CBIBS_Begin_Date.SelectedDate.ToString("d");
        FieldScope_CBIBS_Begin_Date.Visible = false;
        FieldScope_CBIBS_Begin_Date_Label.Visible = true;
        FieldScope_CBIBS_Begin_Date_Button.Visible = true;
        GenerateGraph();
    }

    protected void Edit_EndDate (object sender, EventArgs e) {
        FieldScope_CBIBS_End_Date.Visible = true;
        FieldScope_CBIBS_End_Date_Label.Visible = false;
        FieldScope_CBIBS_End_Date_Button.Visible = false;
    }

    protected void EndDate_Changed (object sender, EventArgs e) {
        if (FieldScope_CBIBS_Begin_Date.SelectedDate >= FieldScope_CBIBS_End_Date.SelectedDate) {
            DateTime newDate = FieldScope_CBIBS_End_Date.SelectedDate.AddDays(-1);
            FieldScope_CBIBS_Begin_Date.SelectedDate = newDate.Date;
            FieldScope_CBIBS_Begin_Date.VisibleDate = newDate.Date;
            FieldScope_CBIBS_Begin_Date_Label.Text = FieldScope_CBIBS_Begin_Date.SelectedDate.ToString("d");
        }
        FieldScope_CBIBS_End_Date_Label.Text = FieldScope_CBIBS_End_Date.SelectedDate.ToString("d");
        FieldScope_CBIBS_End_Date.Visible = false;
        FieldScope_CBIBS_End_Date_Label.Visible = true;
        FieldScope_CBIBS_End_Date_Button.Visible = true;
        GenerateGraph();
    }

    protected void Variable_Changed (object sender, EventArgs e) {
        GenerateGraph();
    }
    
    protected void GenerateGraph () {
        if (FieldScope_CBIBS_Variable_Menu.SelectedIndex < 1) {
            return;
        }
        string platform = (string)Session["FieldScope_CBIBS_Platform"];
        string platformName = (string)Session["FieldScope_CBIBS_Name"];
        if (platformName == null) {
            platformName = "";
        } else {
            platformName = " at " + platformName;
        }
        string presentationName = FieldScope_CBIBS_Variable_Menu.SelectedItem.Text;
        string variableName = NAMES.InternalName(presentationName);
        CBIBS.Measurement[] measurements = CBIBS.Service.QueryData(new CBIBS.Platform("CBIBS", platform),
                                                                   variableName,
                                                                   FieldScope_CBIBS_Begin_Date.SelectedDate,
                                                                   FieldScope_CBIBS_End_Date.SelectedDate);
        StringBuilder sb = new StringBuilder();
        sb.Append("http://chart.apis.google.com/chart?");
        // Chart type
        sb.Append("cht=lxy");
        // Chart size
        sb.Append("&chs=375x250");
        // Chart title
        sb.Append("&chtt=");
        sb.Append(HttpUtility.UrlEncode(presentationName + platformName));
        // chart data
        sb.Append("&chd=e:");
        double firstTime = measurements[0].Time.ToFileTime();
        double lastTime = measurements[measurements.Length - 1].Time.ToFileTime();
        double minValue = Double.MaxValue;
        double maxValue = Double.MinValue;
        double stride = (measurements.Length < 100) ? 1.0 : (measurements.Length / 100.0);
        for (double i = 0; i < measurements.Length; i += stride) {
            CBIBS.Measurement m = measurements[(int)Math.Floor(i)];
            // output the time
            encode(m.Time.ToFileTime(), firstTime, lastTime, sb);
            // Locate the min and max values while we're at it
            if (m.Value < minValue) {
                minValue = m.Value;
            }
            if (m.Value > maxValue) {
                maxValue = m.Value;
            }
        }
        sb.Append(",");
        minValue -= (maxValue - minValue) * 0.1;
        maxValue += (maxValue - minValue) * 0.1;
        for (double i = 0; i < measurements.Length; i += stride) {
            CBIBS.Measurement m = measurements[(int)Math.Floor(i)];
            encode(m.Value, minValue, maxValue, sb);
        }
        // Axis types
        sb.Append("&chxt=x,y");
        // Axis ranges
        sb.Append("&chxr=0,0,");
        sb.Append((measurements[measurements.Length - 1].Time.ToFileTime() - firstTime) / 600000000);
        sb.Append("|1,");
        sb.Append(minValue);
        sb.Append(",");
        sb.Append(maxValue);
        // Axis labels
        sb.Append("&chxl=0:|");
        sb.Append(measurements[0].Time.ToString());
        sb.Append("|");
        sb.Append(measurements[measurements.Length - 1].Time.ToString());
        sb.Append("|");
        string units = measurements[0].Units;
        sb.Append("1:||");
        sb.Append(minValue.ToString("G3") + " " + units);
        sb.Append("||||");
        sb.Append((minValue + ((maxValue - minValue) / 2.0)).ToString("G3") + " " + units);
        sb.Append("||||");
        sb.Append(maxValue.ToString("G3") + " " + units);
        sb.Append("|");
        sb.Append("&chm=d,ff9900,0,-1,8");

        FieldScope_CBIBS_Chart_Image.ImageUrl = sb.ToString();
        FieldScope_CBIBS_Chart_Image.Visible = true;
    }
}
