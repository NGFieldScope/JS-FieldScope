<%@ WebHandler Language="C#" Class="DownloadChartProxy" %>

using System;
using System.Net;
using System.Web;

public class DownloadChartProxy : IHttpHandler {
  
  public void ProcessRequest (HttpContext context) {
    
    string query = HttpUtility.UrlDecode(context.Request.QueryString["query"]);
    string url = "http://chart.apis.google.com/chart" + query;
    
    // We don't want to buffer because we want to save memory
    context.Response.Buffer = false;
    
    using (WebClient client = new WebClient()) {

      client.Headers["Accept-Encoding"] = "gzip";
      client.Headers["Accept"] = "*/*";
      client.Headers["Accept-Language"] = "en-US";
      client.Headers["User-Agent"] = "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6";

      byte[] data = client.DownloadData(url);

      if (context.Response.IsClientConnected) {
        // Force client to download instead of displaying
        context.Response.AppendHeader("Content-Disposition", "attachment; filename=FieldScope_Chart.png");
        // Deliver content type, encoding and length as it is received from the external URL
        context.Response.ContentType = client.ResponseHeaders["Content-Type"];
        string contentEncoding = client.ResponseHeaders["Content-Encoding"];
        string contentLength = client.ResponseHeaders["Content-Length"];
        if (!string.IsNullOrEmpty(contentEncoding)) {
          context.Response.AppendHeader("Content-Encoding", contentEncoding);
        }
        if (!string.IsNullOrEmpty(contentLength)) {
          context.Response.AppendHeader("Content-Length", contentLength);
        }
        // Transmit the downloaded image
        context.Response.OutputStream.Write(data, 0, data.Length);
      }
    }
  }

  public bool IsReusable {
    get {
      return true;
    }
  }

}