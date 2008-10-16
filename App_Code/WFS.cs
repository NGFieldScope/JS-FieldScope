using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text;
using System.Xml;

namespace WFS {
    
    public class Service {

        public static XmlDocument InsertPoint (string wfsUrl,
                                               string entryName,
                                               string geometryName,
                                               string latitude,
                                               string longitude,
                                               Dictionary<string, string> values) {
            HttpWebResponse resp = null;
            try {
                HttpWebRequest queryRequest = (HttpWebRequest)WebRequest.Create(wfsUrl);
                queryRequest.Method = "POST";
                queryRequest.ContentType = "text/xml";

                XmlWriterSettings querySettings = new XmlWriterSettings();
                querySettings.Encoding = Encoding.UTF8;
                querySettings.Indent = false;
                querySettings.CheckCharacters = false;

                Stream requestStream = queryRequest.GetRequestStream();
                XmlWriter request = XmlWriter.Create(requestStream, querySettings);
                request.WriteStartDocument();
                request.WriteStartElement("Transaction", "http://www.opengis.net/wfs");
                request.WriteAttributeString("version", "1.1.0");
                request.WriteAttributeString("service", "WFS");
                request.WriteStartElement("Insert", "http://www.opengis.net/wfs");
                request.WriteStartElement(entryName, wfsUrl);
                request.WriteStartElement(geometryName, wfsUrl);
                request.WriteStartElement("Point", "http://www.opengis.net/gml");
                request.WriteAttributeString("gid", "1");
                request.WriteElementString("pos", "http://www.opengis.net/gml", string.Format("{0} {1}", latitude, longitude));
                request.WriteEndElement(); // Point
                request.WriteEndElement(); // geometryName
                foreach (string key in values.Keys) {
                    request.WriteElementString(key, wfsUrl, values[key]);
                }
                request.WriteEndElement(); // entryName
                request.WriteEndElement(); // insert
                request.WriteEndElement(); // transaction
                request.WriteEndDocument();
                request.Close();
                
                requestStream.Close();

                resp = (HttpWebResponse)queryRequest.GetResponse();

                XmlReaderSettings responseSettings = new XmlReaderSettings();
                responseSettings.ConformanceLevel = ConformanceLevel.Fragment;
                responseSettings.IgnoreWhitespace = true;
                responseSettings.IgnoreComments = true;
                XmlReader responseReader = XmlReader.Create(resp.GetResponseStream(), responseSettings);
                responseReader.MoveToContent();
                XmlDocument doc = new XmlDocument();
                doc.Load(responseReader);
                return doc;

            } finally {
                if (resp != null) {
                    resp.Close();
                    resp = null;
                }
            }
        }
    }
}
