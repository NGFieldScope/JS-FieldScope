<%@ WebHandler Language="C#" Class="RegularProxy" %>

using System;
using System.Web;
using System.Web.Caching;
using System.Net;
using ProxyHelpers;
public class RegularProxy : IHttpHandler {
        
    public void ProcessRequest (HttpContext context) {
        string url = context.Request["url"];
        int cacheDuration = Convert.ToInt32(context.Request["cache"] ?? "0");
        string contentType = context.Request["type"];

        // We don't want to buffer because we want to save memory
        context.Response.Buffer = false;
            
        // Serve from cache if available
        if (cacheDuration > 0)
        {
            if (context.Cache[url] != null)
            {
                context.Response.BinaryWrite(context.Cache[url] as byte[]);
                context.Response.Flush();
                return;
            }
        }

        using (new TimedLog("RegularProxy\t" + url))                
        using (WebClient client = new WebClient())
        {
            if (!string.IsNullOrEmpty(contentType))
                client.Headers["Content-Type"] = contentType;
            
            client.Headers["Accept-Encoding"] = "gzip";
            client.Headers["Accept"] = "*/*";
            client.Headers["Accept-Language"] = "en-US";
            client.Headers["User-Agent"] = "Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6";

            byte[] data;
            using( new TimedLog("RegularProxy\tDownload Sync") )
            {
                data = client.DownloadData(url);
            }

            if( cacheDuration > 0 ) {
                context.Cache.Insert(url, data, null,
                        Cache.NoAbsoluteExpiration,
                        TimeSpan.FromMinutes(cacheDuration),
                        CacheItemPriority.Normal, null); 
            }
            
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

            if (cacheDuration > 0) {
                HttpHelper.CacheResponse(context, cacheDuration);
            } else {
                HttpHelper.DoNotCacheResponse(context);
            }
            
            // Transmit the exact bytes downloaded
            using (new TimedLog("RegularProxy\tResponse Write " + data.Length))
            {
                context.Response.OutputStream.Write(data, 0, data.Length);
                context.Response.Flush();
            }
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }
}