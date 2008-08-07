<%@ WebHandler Language="C#" Class="DownloadChartProxy" %>

using System;
using System.Net;
using System.Web;
using System.Web.Caching;

public class DownloadChartProxy : IHttpHandler {

  static readonly TimeSpan CACHE_DURATION = TimeSpan.FromMinutes(30);

  public void ProcessRequest (HttpContext context) {

    string query = HttpUtility.UrlDecode(context.Request.QueryString["query"]);
    string url = "http://chart.apis.google.com/chart" + query;

    // Force client to download instead of displaying
    context.Response.AppendHeader("Content-Disposition", "attachment; filename=FieldScope_Chart.png");
    
    // We don't want to buffer because we want to save memory
    context.Response.Buffer = false;

    // Serve from cache if available
    if (context.Cache[url] != null) {
      context.Response.ContentType = "image/png";
      context.Response.BinaryWrite(context.Cache[url] as byte[]);
      context.Response.Flush();
      return;
    }

    using (WebClient client = new WebClient()) {

      client.Headers["Accept-Encoding"] = "gzip";
      client.Headers["Accept"] = "*/*";
      client.Headers["Accept-Language"] = "en-US";
      client.Headers["User-Agent"] = "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6";

      byte[] data = client.DownloadData(url);

      context.Cache.Insert(url, data, null,
                           Cache.NoAbsoluteExpiration,
                           CACHE_DURATION,
                           CacheItemPriority.Normal,
                           null);

      if (!context.Response.IsClientConnected) {
        return;
      }

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
      context.Response.Cache.SetCacheability(HttpCacheability.Public);
      context.Response.Cache.SetExpires(DateTime.Now.Add(CACHE_DURATION));
      context.Response.Cache.AppendCacheExtension("must-revalidate, proxy-revalidate");
      context.Response.Cache.SetMaxAge(CACHE_DURATION);

      // Transmit the exact bytes downloaded
      context.Response.OutputStream.Write(data, 0, data.Length);
      context.Response.Flush();
    }
  }

  public bool IsReusable {
    get {
      return true;
    }
  }

}