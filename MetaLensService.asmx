<%@ WebService Language="C#" Class="MetaLensService" %>

using System.Collections.Generic;
using System.Web.Script.Services;
using System.Web.Services;

[WebService(Namespace = "http://focus.metalens.org/dataservice")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class MetaLensService : System.Web.Services.WebService {

  static MetaLens.Service _service = new MetaLens.Service("http://focus.metalens.org");
  
  public MetaLensService () { }

  [WebMethod(Description = "Get clustered  points based on the  bounds and size")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public List<MetaLens.Pin> GetPoints (double left, double right, double bottom, double top, double width, double height) {
    return _service.GetPoints(left, right, bottom, top, width, height);
  }

  [WebMethod(Description = "Get the full details for a specific asset")]
  [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
  public MetaLens.AssetDescription GetDescription (string assetId) {
    return _service.GetDescription(assetId);
  }
}
