<%@ WebService Language="C#" Class="MetaLensService" %>

using System.Collections.Generic;
using System.Web.Script.Services;
using System.Web.Services;

[WebService(Namespace = "http://geode1.sesp.northwestern.edu/MetaLens")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class MetaLensService : System.Web.Services.WebService {
  
  public MetaLensService () { }
  
  [WebMethod(Description = "Get clustered  points based on the  bounds and size")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public List<MetaLens.Pin> GetPoints (string url, double left, double right, double bottom, double top, double width, double height) {
    return MetaLens.Service.GetPoints(url, left, right, bottom, top, width, height);
  }

  [WebMethod(Description = "Get the full details for a specific asset")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public MetaLens.AssetDescription GetDescription (string url, string assetId) {
    return MetaLens.Service.GetDescription(url, assetId);
  }
}
