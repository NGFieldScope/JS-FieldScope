using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Xml;

namespace MetaLens {

    public class NS {
        public const string ASSET = "http://schemas.clearpathlabs.com/explorer/1.0/REST/Assets.xsd";
        public const string QUERY = "http://schemas.clearpathlabs.com/explorer/1.0/REST/QueryAssetParams.xsd";
    }

    public class AssetLocation {

        public readonly string AssetID;
        public readonly double Latitude;
        public readonly double Longitude;

        public AssetLocation (XmlNode root) {
            foreach (XmlNode n in root) {
                if (n.LocalName.Equals("id", StringComparison.OrdinalIgnoreCase)) {
                    this.AssetID = n.InnerText.TrimStart('0');
                } else if (n.LocalName.Equals("Longitude", StringComparison.OrdinalIgnoreCase)) {
                    this.Longitude = Double.Parse(n.InnerText);
                } else if (n.LocalName.Equals("Latitude", StringComparison.OrdinalIgnoreCase)) {
                    this.Latitude = Double.Parse(n.InnerText);
                }
            }
        }
    }

    public class AssetDescription {

        private string _assetid;
        private double _latitude;
        private double _longitude;
        private string _name;
        private string _caption;
        private string _description;
        private string _copyright;
        private string _type;

        public AssetDescription (XmlNode root) {
            foreach (XmlNode n in root) {
                if (n.LocalName.Equals("id", StringComparison.OrdinalIgnoreCase)) {
                    _assetid = n.InnerText.TrimStart('0');
                } else if (n.LocalName.Equals("Longitude", StringComparison.OrdinalIgnoreCase)) {
                    _longitude = Double.Parse(n.InnerText);
                } else if (n.LocalName.Equals("Latitude", StringComparison.OrdinalIgnoreCase)) {
                    _latitude = Double.Parse(n.InnerText);
                } else if (n.LocalName.Equals("Name", StringComparison.OrdinalIgnoreCase)) {
                    _name = n.InnerText;
                } else if (n.LocalName.Equals("Caption", StringComparison.OrdinalIgnoreCase)) {
                    _caption = n.InnerText;
                } else if (n.LocalName.Equals("Description", StringComparison.OrdinalIgnoreCase)) {
                    _description = n.InnerText;
                } else if (n.LocalName.Equals("Copyright", StringComparison.OrdinalIgnoreCase)) {
                    _copyright = n.InnerText;
                } else if (n.LocalName.Equals("PrimaryType", StringComparison.OrdinalIgnoreCase)) {
                    _type = n.InnerText;
                }
            }
        }

        public string Id { get { return _assetid; } }

        public double Latitude { get { return _latitude; } }

        public double Longitude { get { return _longitude; } }

        public string Name { get { return _name; } }

        public string Caption { get { return _caption; } }

        public string Description { get { return _description; } }

        public string Copyright { get { return _copyright; } }

        public string Type { get { return _type; } }

        public override string ToString () {
            return string.Format("{{Id:{0},Latitude:{1},Longitude:{2},Name:{3},Caption:{4},Description:{5},Copyright:{6},Type:{7}}}",
                                 _assetid, _latitude, _longitude, _name, _caption, _description, _copyright, _type);
        }
    }

    public class Pin {

        private string[] _assetids;
        private double _latitude;
        private double _longitude;

        public Pin (LinkedList<AssetLocation> assets) {
            int count = assets.Count();
            _assetids = new string[count];
            _latitude = 0.0;
            _longitude = 0.0;
            int index = 0;
            foreach (AssetLocation a in assets) {
                _assetids[index++] = a.AssetID;
                _latitude += a.Latitude;
                _longitude += a.Longitude;
            }
            _latitude /= (double)count;
            _longitude /= (double)count;
        }

        public string[] AssetIds { get { return _assetids; } }

        public double Latitude { get { return _latitude; } }

        public double Longitude { get { return _longitude; } }

        public override string ToString () {
            StringBuilder result = new StringBuilder();
            result.Append("Cluster at {");
            result.Append(_longitude);
            result.Append(", ");
            result.Append(_latitude);
            result.Append("}: ");
            foreach (string id in _assetids) {
                result.Append(id);
                result.Append(",");
            }
            return result.ToString();
        }
    }

    public class Service {

        private readonly string _url;

        public Service (string url) {
            _url = url;
        }

        public List<Pin> GetPoints (double left, double right, double bottom, double top, double width, double height) {
            HttpWebResponse resp = null;
            try {
                HttpWebRequest queryRequest = (HttpWebRequest)WebRequest.Create(_url + "/assets.cpx");
                queryRequest.Method = "POST";
                queryRequest.ContentType = "text/xml";
                queryRequest.CookieContainer = new CookieContainer();

                XmlWriterSettings querySettings = new XmlWriterSettings();
                querySettings.Encoding = Encoding.UTF8;
                querySettings.Indent = false;
                querySettings.CheckCharacters = false;

                Stream requestStream = queryRequest.GetRequestStream();
                XmlWriter buildQuery = XmlWriter.Create(requestStream, querySettings);
                buildQuery.WriteStartDocument();
                buildQuery.WriteStartElement("QueryAssetParams", NS.QUERY);
                buildQuery.WriteStartElement("Options");
                buildQuery.WriteElementString("maxrows", "500");
                buildQuery.WriteElementString("typeofsearch", "simple");
                buildQuery.WriteElementString("shownullslast", "true");
                buildQuery.WriteElementString("detail", "assetid");
                buildQuery.WriteElementString("currentview", "POLYGON((" + left + " " + top + "," + right + " " + top + "," + right + " " + bottom + "," + left + " " + bottom + "))");
                buildQuery.WriteEndElement();
                buildQuery.WriteEndElement();
                buildQuery.WriteEndDocument();
                buildQuery.Close();
                requestStream.Close();

                resp = (HttpWebResponse)queryRequest.GetResponse();

                XmlReaderSettings responseSettings = new XmlReaderSettings();
                responseSettings.ConformanceLevel = ConformanceLevel.Fragment;
                responseSettings.IgnoreWhitespace = true;
                responseSettings.IgnoreComments = true;
                XmlReader responseReader = XmlReader.Create(resp.GetResponseStream(), responseSettings);
                XmlDocument doc = new XmlDocument();

                LinkedList<AssetLocation> assets = new LinkedList<AssetLocation>();
                if (responseReader.ReadToFollowing("asset")) {
                    while (responseReader.Name.Equals("asset", StringComparison.OrdinalIgnoreCase)) {
                        assets.AddLast(new AssetLocation(doc.ReadNode(responseReader)));
                    }
                }

                int rows = (int)(width / 24);
                int columns = (int)(height / 24);
                double cellWidth = (right - left) / columns;
                double cellHeight = (top - bottom) / rows;
                Dictionary<Point, LinkedList<AssetLocation>> clusters = new Dictionary<Point, LinkedList<AssetLocation>>();
                foreach (AssetLocation a in assets) {
                    int x = (int)Math.Floor((a.Longitude - left) / cellWidth);
                    int y = (int)Math.Floor((a.Latitude - bottom) / cellHeight);
                    Point key = new Point(x, y);
                    LinkedList<AssetLocation> list;
                    if (clusters.TryGetValue(key, out list)) {
                        list.AddLast(a);
                    } else {
                        list = new LinkedList<AssetLocation>();
                        list.AddLast(a);
                        clusters.Add(key, list);
                    }
                }

                Dictionary<Point, LinkedList<AssetLocation>>.ValueCollection vc = clusters.Values;
                List<Pin> result = new List<Pin>(vc.Count);
                foreach (LinkedList<AssetLocation> cluster in vc) {
                    result.Add(new Pin(cluster));
                }
                return result;

            } finally {
                if (resp != null) {
                    resp.Close();
                    resp = null;
                }
            }
        }

        public AssetDescription GetDescription (string assetId) {
            HttpWebResponse resp = null;
            try {
                // Login into the host using the server's configured authentication scheme
                HttpWebRequest queryRequest = (HttpWebRequest)WebRequest.Create(_url + "/assets/" + assetId.PadLeft(32, '0') + ".cpx");
                queryRequest.Method = "GET";
                queryRequest.ContentType = "text/xml";
                resp = (HttpWebResponse)queryRequest.GetResponse();
                XmlReaderSettings responseSettings = new XmlReaderSettings();
                responseSettings.ConformanceLevel = ConformanceLevel.Fragment;
                responseSettings.IgnoreWhitespace = true;
                responseSettings.IgnoreComments = true;
                XmlReader responseReader = XmlReader.Create(resp.GetResponseStream(), responseSettings);
                XmlDocument doc = new XmlDocument();
                if (responseReader.ReadToFollowing("asset")) {
                    return new AssetDescription(doc.ReadNode(responseReader));
                } else {
                    return null;
                }
            } finally {
                if (resp != null) {
                    resp.Close();
                    resp = null;
                }
            }
        }
    }
}
