<%@ WebService Language="C#" Class="WFSService" %>

using System.Collections.Generic;
using System.Web.Script.Services;
using System.Web.Services;

[WebService(Namespace = "http://geode1.sesp.northwestern.edu/WFS")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class WFSService : System.Web.Services.WebService {

  static WFS.Service _service = new WFS.Service();

  public WFSService () { }

  [WebMethod(Description = "Get clustered  points based on the  bounds and size")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public string InsertPoint (string wfsUrl, string entryName, string geometryName, WFS.LatLng point, Dictionary<string, string> values) {
    return _service.InsertPoint(wfsUrl, entryName, geometryName, point, values);
  }
}
