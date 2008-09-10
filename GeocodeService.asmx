<%@ WebService Language="C#" Class="GeocodeService" %>

using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Web.Script.Services;

[WebService(Namespace = "http://geode1.sesp.northwestern.edu/Geocode")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class GeocodeService : System.Web.Services.WebService {
  
    public GeocodeService () { }
  
    [WebMethod(Description = "Geocode the given address using the SOAP interface of the given geocoder")]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public ArcGIS.GeocodeResult Geocode (string address, string server) {
      return ArcGIS.GeocodeService.Geocode(server, address);
    }
}
