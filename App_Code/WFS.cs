using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Xml;

namespace WFS {

    public class LatLng {

        private double _latitude;
        private double _longitude;

        public double Latitude {
            get { return _latitude; }
            set { _latitude = value; }
        }
        public double Longitude {
            get { return _longitude; }
            set { _longitude = value; }
        }
    }

    public class Service {

        public String InsertPoint (String wfsUrl,
                                   String entryName,
                                   String geometryName,
                                   LatLng point,
                                   Dictionary<String, String> values) {
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
                request.WriteElementString("pos", "http://www.opengis.net/gml", String.Format("{0} {1}", point.Latitude, point.Longitude));
                request.WriteEndElement(); // Point
                request.WriteEndElement(); // geometryName
                foreach (String key in values.Keys) {
                    request.WriteElementString(key, wfsUrl, values[key]);
                }
                request.WriteEndElement(); // entryName
                request.WriteEndElement(); // insert
                request.WriteEndElement(); // transaction
                request.WriteEndDocument();
                request.Close();


                requestStream.Close();

                resp = (HttpWebResponse)queryRequest.GetResponse();

                StreamReader str = new StreamReader(resp.GetResponseStream());
                String line = str.ReadLine();
                while (line != null) {
                    Console.WriteLine(line);
                    line = str.ReadLine();
                }
                return "";
            } finally {
                if (resp != null) {
                    resp.Close();
                    resp = null;
                }
            }
        }
    }
}
