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
        UNIT_CONVERTERS.Add("FAU", IDENTITY);
        UNIT_CONVERTERS.Add("cm", IDENTITY);
        UNIT_CONVERTERS.Add("in", delegate(double value) { return value * 2.54; });
        UNIT_CONVERTERS.Add("mbar", IDENTITY);
        UNIT_CONVERTERS.Add("inHg", delegate(double value) { return value * 33.8653; });
        UNIT_CONVERTERS.Add("OXYGEN[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("NITROGEN[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("PHOSPHOROUS[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("AMMONIA[mg/L]", IDENTITY);
        UNIT_CONVERTERS.Add("mS/cm", IDENTITY);
        UNIT_CONVERTERS.Add("mho/cm", delegate(double value) { return value * 1000000.0; });
    }
    
    protected void Page_Load(object sender, EventArgs e) {
        if (!IsPostBack) {
            FieldScope_Observation_Date.SelectedDate = DateTime.Now.Date;
            FieldScope_Observation_Date_Label.Text = FieldScope_Observation_Date.SelectedDate.ToString("d");
            FieldScope_Observation_ServiceUrl.Text = HttpUtility.UrlDecode(Request.QueryString["service"]);
            FieldScope_Observation_ServiceName.Text = HttpUtility.UrlDecode(Request.QueryString["name"]);
            string lat = HttpUtility.UrlDecode(Request.QueryString["lat"]) ?? "";
            if (lat.Length > 10) {
                lat = lat.Substring(0, 10);
            }
            FieldScope_Observation_Latitude.Text = lat;
            string lon = HttpUtility.UrlDecode(Request.QueryString["lon"]) ?? "";
            if (lon.Length > 10) {
                lon = lon.Substring(0, 10);
            }
            FieldScope_Observation_Longitude.Text = lon;
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
    
    protected void Validate_Latitude (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                double value = double.Parse(args.Value);
                args.IsValid = ((value >= 36.0) && (value <= 43.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_Longitude (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                double value = Math.Abs(double.Parse(args.Value));
                args.IsValid = ((value >= 74.5) && (value <= 80.6));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_WaterTemperature (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string temperatureUnits = FieldScope_Observation_WaterTemperature_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[temperatureUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 45.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_AirTemperature (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string temperatureUnits = FieldScope_Observation_AirTemperature_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[temperatureUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 45.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_Salinity (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string salinityUnits = FieldScope_Observation_Salinity_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[salinityUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 50.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_Conductivity (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string conductivityUnits = FieldScope_Observation_Conductivity_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[conductivityUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 100000.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_Turbidity (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string turbidityUnits = FieldScope_Observation_Turbidity_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[turbidityUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 400.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_SecchiDepth (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string secchiDepthUnits = FieldScope_Observation_SecchiDepth_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[secchiDepthUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 500.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_Oxygen (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string oxygenUnits = FieldScope_Observation_Oxygen_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[oxygenUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 20.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_Nitrogen (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string nitrogenUnits = FieldScope_Observation_Nitrogen_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[nitrogenUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 8.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void Validate_Phosphorous (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string phosphorousUnits = FieldScope_Observation_Phosphorous_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[phosphorousUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 8.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_Ammonia (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string ammoniaUnits = FieldScope_Observation_Ammonia_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[ammoniaUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 0.0) && (value <= 20.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }

    protected void Validate_BarometricPressure (object sender, ServerValidateEventArgs args) {
        if (args.Value.Length > 0) {
            try {
                string pressureUnits = FieldScope_Observation_BarometricPressure_Units.SelectedItem.Value;
                double value = UNIT_CONVERTERS[pressureUnits](double.Parse(args.Value));
                args.IsValid = ((value >= 100.0) && (value <= 1050.0));
            } catch (FormatException) {
                args.IsValid = false;
            }
        } else {
            args.IsValid = true;
        }
    }
    
    protected void SaveButton_Click (object sender, EventArgs evt) {
        if (IsValid) {
            FieldScope_Observation_EnterLabel.Visible = false;
            FieldScope_Observation_Latitude.Visible = false;
            FieldScope_Observation_Longitude.Visible = false;
            FieldScope_Observation_WaterTemperature.Visible = false;
            FieldScope_Observation_AirTemperature.Visible = false;
            FieldScope_Observation_Salinity.Visible = false;
            FieldScope_Observation_Conductivity.Visible = false;
            FieldScope_Observation_Turbidity.Visible = false;
            FieldScope_Observation_SecchiDepth.Visible = false;
            FieldScope_Observation_Oxygen.Visible = false;
            FieldScope_Observation_School.Visible = false;
            FieldScope_Observation_Nitrogen.Visible = false;
            FieldScope_Observation_Date_Button.Visible = false;
            FieldScope_Observation_Phosphorous.Visible = false;
            FieldScope_Observation_Time.Visible = false;
            FieldScope_Observation_Ammonia.Visible = false;
            FieldScope_Observation_pH.Visible = false;
            FieldScope_Observation_RelativeHumidity.Visible = false;
            FieldScope_Observation_BarometricPressure.Visible = false;
            FieldScope_Observation_SubmitButton.Visible = false;

            FieldScope_Observation_Latitude_Label.Text = FieldScope_Observation_Latitude.Text;
            FieldScope_Observation_Longitude_Label.Text = FieldScope_Observation_Longitude.Text;
            FieldScope_Observation_WaterTemperature_Label.Text = FieldScope_Observation_WaterTemperature.Text;
            FieldScope_Observation_AirTemperature_Label.Text = FieldScope_Observation_AirTemperature.Text;
            FieldScope_Observation_Salinity_Label.Text = FieldScope_Observation_Salinity.Text;
            FieldScope_Observation_Conductivity_Label.Text = FieldScope_Observation_Conductivity.Text;
            FieldScope_Observation_Turbidity_Label.Text = FieldScope_Observation_Turbidity.Text;
            FieldScope_Observation_SecchiDepth_Label.Text = FieldScope_Observation_SecchiDepth.Text;
            FieldScope_Observation_Oxygen_Label.Text = FieldScope_Observation_Oxygen.Text;
            FieldScope_Observation_School_Label.Text = FieldScope_Observation_School.Text;
            FieldScope_Observation_Nitrogen_Label.Text = FieldScope_Observation_Nitrogen.Text;
            FieldScope_Observation_Phosphorous_Label.Text = FieldScope_Observation_Phosphorous.Text;
            DateTime time = new DateTime();
            bool parsed = DateTime.TryParse(FieldScope_Observation_Time.Text, out time);
            FieldScope_Observation_Time_Label.Text = time.ToString("T");
            FieldScope_Observation_Time.Text = time.ToString("T");
            FieldScope_Observation_Ammonia_Label.Text = FieldScope_Observation_Ammonia.Text;
            FieldScope_Observation_pH_Label.Text = FieldScope_Observation_pH.Text;
            FieldScope_Observation_RelativeHumidity_Label.Text = FieldScope_Observation_RelativeHumidity.Text;
            FieldScope_Observation_BarometricPressure_Label.Text = FieldScope_Observation_BarometricPressure.Text;
            
            FieldScope_Observation_WaterTemperature_Units.Enabled = false;
            FieldScope_Observation_AirTemperature_Units.Enabled = false;
            FieldScope_Observation_Latitude_Units.Enabled = false;
            FieldScope_Observation_Longitude_Units.Enabled = false;
            FieldScope_Observation_Salinity_Units.Enabled = false;
            FieldScope_Observation_Conductivity_Units.Enabled = false;
            FieldScope_Observation_Turbidity_Units.Enabled = false;
            FieldScope_Observation_SecchiDepth_Units.Enabled = false;
            FieldScope_Observation_Oxygen_Units.Enabled = false;
            FieldScope_Observation_Nitrogen_Units.Enabled = false;
            FieldScope_Observation_Phosphorous_Units.Enabled = false;
            FieldScope_Observation_Ammonia_Units.Enabled = false;
            FieldScope_Observation_Notes.Enabled = false;
            FieldScope_Observation_BarometricPressure_Units.Enabled = false;

            FieldScope_Observation_ConfirmLabel.Visible = true;
            FieldScope_Observation_Latitude_Label.Visible = true;
            FieldScope_Observation_Longitude_Label.Visible = true;
            FieldScope_Observation_WaterTemperature_Label.Visible = true;
            FieldScope_Observation_AirTemperature_Label.Visible = true;
            FieldScope_Observation_Salinity_Label.Visible = true;
            FieldScope_Observation_Conductivity_Label.Visible = true;
            FieldScope_Observation_Turbidity_Label.Visible = true;
            FieldScope_Observation_SecchiDepth_Label.Visible = true;
            FieldScope_Observation_Oxygen_Label.Visible = true;
            FieldScope_Observation_School_Label.Visible = true;
            FieldScope_Observation_Nitrogen_Label.Visible = true;
            FieldScope_Observation_Phosphorous_Label.Visible = true;
            FieldScope_Observation_Time_Label.Visible = true;
            FieldScope_Observation_Ammonia_Label.Visible = true;
            FieldScope_Observation_pH_Label.Visible = true;
            FieldScope_Observation_RelativeHumidity_Label.Visible = true;
            FieldScope_Observation_BarometricPressure_Label.Visible = true;
            FieldScope_Observation_CorrectButton.Visible = true;
            FieldScope_Observation_ConfirmButton.Visible = true;
        }
    }
    
    protected void CorrectButton_Click (object sender, EventArgs evt) {
        FieldScope_Observation_ConfirmLabel.Visible = false;
        FieldScope_Observation_Latitude_Label.Visible = false;
        FieldScope_Observation_Longitude_Label.Visible = false;
        FieldScope_Observation_WaterTemperature_Label.Visible = false;
        FieldScope_Observation_AirTemperature_Label.Visible = false;
        FieldScope_Observation_Salinity_Label.Visible = false;
        FieldScope_Observation_Conductivity_Label.Visible = false;
        FieldScope_Observation_Turbidity_Label.Visible = false;
        FieldScope_Observation_SecchiDepth_Label.Visible = false;
        FieldScope_Observation_Oxygen_Label.Visible = false;
        FieldScope_Observation_School_Label.Visible = false;
        FieldScope_Observation_Nitrogen_Label.Visible = false;
        FieldScope_Observation_Phosphorous_Label.Visible = false;
        FieldScope_Observation_Time_Label.Visible = false;
        FieldScope_Observation_Ammonia_Label.Visible = false;
        FieldScope_Observation_pH_Label.Visible = false;
        FieldScope_Observation_RelativeHumidity_Label.Visible = false;
        FieldScope_Observation_BarometricPressure_Label.Visible = false;
        FieldScope_Observation_CorrectButton.Visible = false;
        FieldScope_Observation_ConfirmButton.Visible = false;

        FieldScope_Observation_WaterTemperature_Units.Enabled = true;
        FieldScope_Observation_AirTemperature_Units.Enabled = true;
        FieldScope_Observation_Latitude_Units.Enabled = true;
        FieldScope_Observation_Longitude_Units.Enabled = true;
        FieldScope_Observation_Salinity_Units.Enabled = true;
        FieldScope_Observation_Conductivity_Units.Enabled = true;
        FieldScope_Observation_Turbidity_Units.Enabled = true;
        FieldScope_Observation_SecchiDepth_Units.Enabled = true;
        FieldScope_Observation_Oxygen_Units.Enabled = true;
        FieldScope_Observation_Nitrogen_Units.Enabled = true;
        FieldScope_Observation_Phosphorous_Units.Enabled = true;
        FieldScope_Observation_Ammonia_Units.Enabled = true;
        FieldScope_Observation_Notes.Enabled = true;
        FieldScope_Observation_BarometricPressure_Units.Enabled = true;

        FieldScope_Observation_EnterLabel.Visible = true;
        FieldScope_Observation_Latitude.Visible = true;
        FieldScope_Observation_Longitude.Visible = true;
        FieldScope_Observation_WaterTemperature.Visible = true;
        FieldScope_Observation_AirTemperature.Visible = true;
        FieldScope_Observation_Salinity.Visible = true;
        FieldScope_Observation_Conductivity.Visible = true;
        FieldScope_Observation_Turbidity.Visible = true;
        FieldScope_Observation_SecchiDepth.Visible = true;
        FieldScope_Observation_Oxygen.Visible = true;
        FieldScope_Observation_School.Visible = true;
        FieldScope_Observation_Nitrogen.Visible = true;
        FieldScope_Observation_Date_Button.Visible = true;
        FieldScope_Observation_Phosphorous.Visible = true;
        FieldScope_Observation_Time.Visible = true;
        FieldScope_Observation_Ammonia.Visible = true;
        FieldScope_Observation_pH.Visible = true;
        FieldScope_Observation_RelativeHumidity.Visible = true;
        FieldScope_Observation_BarometricPressure.Visible = true;
        FieldScope_Observation_SubmitButton.Visible = true;
    }
    
    protected void ConfirmButton_Click (object sender, EventArgs evt) {
        string service = FieldScope_Observation_ServiceUrl.Text;
        string name = FieldScope_Observation_ServiceName.Text;
        string lat = FieldScope_Observation_Latitude.Text;
        string lon = FieldScope_Observation_Longitude.Text;
        string wfs = service + "/GeoDataServer/WFSServer";
        
        Dictionary<string, string> values = new Dictionary<string, string>();

        values.Add("ENTRY_DATE", DateTime.Now.ToString("s"));

        string waterTemperature = FieldScope_Observation_WaterTemperature.Text;
        if (waterTemperature.Length > 0) {
            string temperatureUnits = FieldScope_Observation_WaterTemperature_Units.SelectedItem.Value;
            values.Add("WATER_TEMPERATURE", UNIT_CONVERTERS[temperatureUnits](double.Parse(waterTemperature)).ToString());
        }
        string airTemperature = FieldScope_Observation_AirTemperature.Text;
        if (airTemperature.Length > 0) {
            string temperatureUnits = FieldScope_Observation_AirTemperature_Units.SelectedItem.Value;
            values.Add("AIR_TEMPERATURE", UNIT_CONVERTERS[temperatureUnits](double.Parse(airTemperature)).ToString());
        }
        
        string salinity = FieldScope_Observation_Salinity.Text;
        if (salinity.Length > 0) {
            string salinityUnits = FieldScope_Observation_Salinity_Units.SelectedItem.Value;
            values.Add("SALINITY", UNIT_CONVERTERS[salinityUnits](double.Parse(salinity)).ToString());
        }
        string conductivity = FieldScope_Observation_Conductivity.Text;
        if (conductivity.Length > 0) {
            string conductivityUnits = FieldScope_Observation_Conductivity_Units.SelectedItem.Value;
            values.Add("CONDUCTIVITY", UNIT_CONVERTERS[conductivityUnits](double.Parse(conductivity)).ToString());
        }
        
        string turbidity = FieldScope_Observation_Turbidity.Text;
        if (turbidity.Length > 0) {
            string turbidityUnits = FieldScope_Observation_Turbidity_Units.SelectedItem.Value;
            values.Add("TURBIDITY", UNIT_CONVERTERS[turbidityUnits](double.Parse(turbidity)).ToString());
        }
        string secchiDepth = FieldScope_Observation_SecchiDepth.Text;
        if (secchiDepth.Length > 0) {
            string secchiDepthUnits = FieldScope_Observation_SecchiDepth_Units.SelectedItem.Value;
            values.Add("SECCHI_DEPTH", UNIT_CONVERTERS[secchiDepthUnits](double.Parse(secchiDepth)).ToString());
        }
        
        string oxygen = FieldScope_Observation_Oxygen.Text;
        if (oxygen.Length > 0) {
            string oxygenUnits = FieldScope_Observation_Oxygen_Units.SelectedItem.Value;
            values.Add("DISSOLVED_OXYGEN", UNIT_CONVERTERS[oxygenUnits](double.Parse(oxygen)).ToString());
        }
        values.Add("SCHOOL", FieldScope_Observation_School.Text);
        
        string nitrogen = FieldScope_Observation_Nitrogen.Text;
        if (nitrogen.Length > 0) {
            string nitrogenUnits = FieldScope_Observation_Nitrogen_Units.SelectedItem.Value;
            values.Add("NITRATE", UNIT_CONVERTERS[nitrogenUnits](double.Parse(nitrogen)).ToString());
        }
        DateTime collectionTime = new DateTime();
        bool parsed = DateTime.TryParse(FieldScope_Observation_Time.Text, out collectionTime);
        
        string phosphorous = FieldScope_Observation_Phosphorous.Text;
        if (phosphorous.Length > 0) {
            string phosphorousUnits = FieldScope_Observation_Phosphorous_Units.SelectedItem.Value;
            values.Add("PHOSPHATE", UNIT_CONVERTERS[phosphorousUnits](double.Parse(phosphorous)).ToString());
        }
        values.Add("COLLECTION_DATE", FieldScope_Observation_Date.SelectedDate.ToString("yyyy-MM-dd") + "T" + collectionTime.ToString("HH:mm:ss"));

        string ammonia = FieldScope_Observation_Ammonia.Text;
        if (ammonia.Length > 0) {
            string ammoniaUnits = FieldScope_Observation_Ammonia_Units.SelectedItem.Value;
            values.Add("AMMONIA", UNIT_CONVERTERS[ammoniaUnits](double.Parse(ammonia)).ToString());
        }
        values.Add("FIELD_NOTES", FieldScope_Observation_Notes.Text);
        
        string pH = FieldScope_Observation_pH.Text;
        if (pH.Length > 0) {
            values.Add("PH", pH);
        }

        string relativeHumidity = FieldScope_Observation_RelativeHumidity.Text;
        if (relativeHumidity.Length > 0) {
            values.Add("RELATIVE_HUMIDITY", relativeHumidity);
        }

        string barometricPressure = FieldScope_Observation_BarometricPressure.Text;
        if (barometricPressure.Length > 0) {
            string pressureUnits = FieldScope_Observation_BarometricPressure_Units.SelectedItem.Value;
            values.Add("BAROMETRIC_PRESSURE", UNIT_CONVERTERS[pressureUnits](double.Parse(barometricPressure)).ToString());
        }
        
        XmlDocument result = WFS.Service.InsertPoint(wfs, name, "Shape", lat, lon, values);
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
