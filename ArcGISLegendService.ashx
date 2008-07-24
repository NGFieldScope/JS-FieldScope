<%@ WebHandler Language="C#" Class="ArcGISLegendService" %>

using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;

public class ArcGISLegendService : IHttpHandler {

  private static readonly Font FONT = new Font("Helvetica", 9, System.Drawing.FontStyle.Regular);

  public void ProcessRequest (HttpContext context) {
    string serviceUri = HttpUtility.UrlDecode(context.Request.Params["srv"]);
    if (serviceUri == null) {
      context.Response.ContentType = "text/plain";
      context.Response.Write("Missing MapServer url parameter 'srv'");
      return;
    }
    string format = context.Request.Params["f"];
    if (format == null) {
      format = "bmp";
    }
    Bitmap bmp = ArcGIS.MapService.GetLegendImage(serviceUri, 150, -1, 72, FONT, true);
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
    context.Response.BinaryWrite(outStream.ToArray());
  }

  public bool IsReusable {
    get {
      return true;
    }
  }
}
