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

        public AssetLocation (XmlReader reader) {
            //NOTE: this depends on the order of elements in the response. That could be
            // a problem in the future.
            reader.ReadToFollowing("id");
            this.AssetID = reader.ReadElementContentAsString();
            reader.ReadToFollowing("Longitude");
            this.Longitude = reader.ReadElementContentAsDouble();
            //reader.ReadToFollowing("Latitude");
            this.Latitude = reader.ReadElementContentAsDouble();
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

        public AssetDescription (XmlReader reader) {
            //NOTE: this depends on the order of elements in the response. That could be
            // a problem in the future.
            reader.ReadToFollowing("id");
            _assetid = reader.ReadElementContentAsString();
            reader.ReadToNextSibling("Longitude");
            _longitude = reader.ReadElementContentAsDouble();
            //reader.ReadToNextSibling("Latitude");
            _latitude = reader.ReadElementContentAsDouble();
            reader.ReadToNextSibling("Name");
            _name = reader.ReadElementContentAsString();
            //reader.ReadToNextSibling("Caption");
            _caption = reader.ReadElementContentAsString();
            //reader.ReadToNextSibling("Description");
            _description = reader.ReadElementContentAsString();
            if (reader.ReadToNextSibling("Copyright")) {
                _copyright = reader.ReadElementContentAsString();
                reader.ReadToNextSibling("PrimaryType");
                _type = reader.ReadElementContentAsString();
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

        private const double CLUSTER_SIZE = 32;

        public static List<Pin> GetPoints (double left, double right, double bottom, double top, double width, double height) {
            HttpWebResponse resp = null;
            try {
                HttpWebRequest queryRequest = (HttpWebRequest)WebRequest.Create("http://focus.metalens.org/assets.cpx");
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

                LinkedList<AssetLocation> assets = new LinkedList<AssetLocation>();
                while (responseReader.ReadToFollowing("asset")) {
                    assets.AddLast(new AssetLocation(responseReader));
                }

                int rows = (int)(width / CLUSTER_SIZE);
                int columns = (int)(height / CLUSTER_SIZE);
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

        public static AssetDescription GetDescription (string assetId) {
            HttpWebResponse resp = null;
            try {
                // Login into the host using the server's configured authentication scheme
                HttpWebRequest queryRequest = (HttpWebRequest)WebRequest.Create("http://focus.metalens.org/assets/" + assetId + ".cpx");
                queryRequest.Method = "GET";
                queryRequest.ContentType = "text/xml";
                resp = (HttpWebResponse)queryRequest.GetResponse();
                XmlReaderSettings responseSettings = new XmlReaderSettings();
                responseSettings.ConformanceLevel = ConformanceLevel.Fragment;
                responseSettings.IgnoreWhitespace = true;
                responseSettings.IgnoreComments = true;
                XmlReader responseReader = XmlReader.Create(resp.GetResponseStream(), responseSettings);
                if (responseReader.ReadToFollowing("asset")) {
                    return new AssetDescription(responseReader);
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
