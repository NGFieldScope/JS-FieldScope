<%@ WebHandler Language="C#" Class="SaveUserStateService" %>

using System;
using System.Web;

public class SaveUserStateService : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
      string cookie = context.Request.Form["cookie"];
      string state = context.Request.Form["state"];
      int result = SqlServer.Service.StoreState(cookie, state);
      context.Response.ContentType = "text/plain";
      context.Response.Write(result.ToString());
    }
 
    public bool IsReusable {
      get {
        return false;
      }
    }
}