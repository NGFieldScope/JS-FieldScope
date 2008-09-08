<%@ WebHandler Language="C#" Class="ArcGISLegendService" %>

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.Caching;

public class ArcGISLegendService : IHttpHandler {

  private static readonly Font FONT = new Font("Helvetica", 9, System.Drawing.FontStyle.Regular);
  
  private static readonly TimeSpan CACHE_DURATION = TimeSpan.FromMinutes(30);

  public void ProcessRequest (HttpContext context) {
    string serviceUri = HttpUtility.UrlDecode(context.Request.Params["srv"]);
    if (serviceUri == null) {
      context.Response.ContentType = "text/plain";
      context.Response.Write("Missing MapServer url parameter 'srv'");
      return;
    }
    string format = context.Request.Params["f"] ?? "bmp";
    string requestUri = context.Request.Url.ToString();
    // Serve from cache if available
    if (context.Cache[requestUri] != null) {
      Utilities.ByteCache cachedImg = context.Cache[requestUri] as Utilities.ByteCache;
      context.Response.ContentType = cachedImg.ContentType;
      context.Response.BinaryWrite(cachedImg.Data);
    } else {
      Bitmap bmp = ArcGIS.MapService.GetLegendImage(serviceUri, 300, -1, 72, FONT, true);
      MemoryStream outStream = new MemoryStream();
      if (string.Equals(format, "bmp", System.StringComparison.OrdinalIgnoreCase)) {
        context.Response.ContentType = "image/bmp";
        bmp.Save(outStream, ImageFormat.Bmp);
      } else if (format.Equals("gif", System.StringComparison.OrdinalIgnoreCase)) {
        context.Response.ContentType = "image/gif";
        bmp.Save(outStream, ImageFormat.Gif);
      } else if (format.Equals("jpg", System.StringComparison.OrdinalIgnoreCase)) {
        context.Response.ContentType = "image/jpeg";
        bmp.Save(outStream, ImageFormat.Jpeg);
      } else if (format.Equals("png", StringComparison.OrdinalIgnoreCase)) {
        context.Response.ContentType = "image/png";
        bmp.Save(outStream, ImageFormat.Png);
      } else {
        context.Response.ContentType = "text/plain";
        context.Response.Write("Image format must be one of: { bmp, gif, jpg, png }");
        return;
      }
      byte[] data = outStream.ToArray();
      context.Cache.Insert(requestUri,
                           new Utilities.ByteCache(data, context.Response.ContentType),
                           null,
                           Cache.NoAbsoluteExpiration,
                           CACHE_DURATION,
                           CacheItemPriority.Normal,
                           null);
      context.Response.Cache.SetCacheability(HttpCacheability.Public);
      context.Response.Cache.SetExpires(DateTime.Now.Add(CACHE_DURATION));
      context.Response.Cache.AppendCacheExtension("must-revalidate, proxy-revalidate");
      context.Response.Cache.SetMaxAge(CACHE_DURATION);
      if (context.Response.IsClientConnected) {
        context.Response.BinaryWrite(data);
      }
    }
  }
  
  public bool IsReusable {
    get {
      return true;
    }
  }
}
