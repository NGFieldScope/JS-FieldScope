<%@ WebService Language="C#" Class="MetaLensService" %>

using System.Collections.Generic;
using System.Web.Script.Services;
using System.Web.Services;
using MetaLens;

[WebService(Namespace = "http://focus.metalens.org/dataservice")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class MetaLensService : System.Web.Services.WebService {

  public MetaLensService () { }

  [WebMethod(Description = "Get clustered  points based on the  bounds and size")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public List<Pin> GetPoints (double left, double right, double bottom, double top, double width, double height) {
    return Service.GetPoints(left, right, bottom, top, width, height);
  }

  [WebMethod(Description = "Get the full details for a specific asset")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public AssetDescription GetDescription (string assetId) {
    return Service.GetDescription(assetId);
  }
}
