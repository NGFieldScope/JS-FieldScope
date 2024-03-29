﻿<%@ WebService Language="C#" Class="CBIBSService" %>

using System.Collections.Generic;
using System.Web.Script.Services;
using System.Web.Services;

[WebService(Namespace = "http://geode1.sesp.northwestern.edu/CBIBS")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
[ScriptService]
public class CBIBSService : System.Web.Services.WebService {
  
  public CBIBSService () { }

  [WebMethod]
  [ScriptMethod(UseHttpGet = true)]
  public CBIBS.PlatformMeasurements[] GetAllCurrentReadings () {
    return CBIBS.Service.GetAllCurrentReadings("CBIBS");
  }
}
