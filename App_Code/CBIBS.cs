using System;
using System.Globalization;
using System.Text;
using CookComputing.XmlRpc;

namespace CBIBS {

    sealed class API {
        public const string Key = "6433ca99b5c48593a7a254200aa70bdc97a010d0";
        public const string DateTimeFormat = "yyyy-MM-dd HH:mm:ss";
    }

    public class Platform {

        private readonly string _constellation;
        private readonly string _name;
        private readonly string _id;

        public string Constellation { get { return _constellation; } }
        public string Name { get { return _name; } }
        public string Id { get { return _id; } }

        public Platform (string constellation, string id) : this(constellation, id, "") { }

        public Platform (string constellation, string id, string name) {
            _constellation = constellation;
            _name = name;
            _id = id;
        }

        public override string ToString () {
            return string.Format("{{Constellation:{0},Id:{1},Name:{2}}}", _constellation, _id, _name);
        }
    }

    public class Measurement {

        private readonly string _name;
        private readonly double _value;
        private readonly string _units;
        private readonly DateTime _time;

        public string Name { get { return _name; } }
        public double Value { get { return _value; } }
        public string Units { get { return _units; } }
        public DateTime Time { get { return _time; } }

        public Measurement (string name, double value, string units, string time) {
            _name = name;
            _value = value;
            _units = units;
            _time = DateTime.ParseExact(time, API.DateTimeFormat, DateTimeFormatInfo.InvariantInfo, DateTimeStyles.AssumeUniversal);
        }

        public override string ToString () {
            return string.Format("{0} = {1} {2} at {3}", _name, _value, _units, _time);
        }
    }

    public class PlatformMeasurements {

        private readonly Platform _platform;
        private readonly Measurement[] _measurements;

        public Platform Platform { get { return _platform; } }
        public Measurement[] Measurements { get { return _measurements; } }

        public PlatformMeasurements (Platform platform, Measurement[] measurements) {
            _platform = platform;
            _measurements = measurements;
        }

        public override string ToString () {
            StringBuilder result = new StringBuilder();
            result.Append("Platform ");
            result.Append(_platform);
            result.Append("\r\n");
            foreach (Measurement m in _measurements) {
                result.Append(" ");
                result.Append(m.ToString());
                result.Append("\r\n");
            }
            return result.ToString();
        }
    }

    public struct PlatformList {
        public string[] cn;
        public string[] id;
    }

    public struct MeasurementList {
        public string constellation;
        public string station;
        public string[] measurement;
        public string[] time;
        public double[] value;
        public string[] units;
    }

    public struct ValueSet {
        public string[] time;
        public double[] value;
    }

    public struct QueryResponse {
        public string measurement;
        public string units;
        public ValueSet values;
    }

    [XmlRpcUrl("http://devmw.buoybay.org/studs/studs_cdrh/xmlrpc_cdrh/server.php")]
    public interface IBuoyProxy : IXmlRpcProxy {

        [XmlRpcMethod("xmlrpc_cdrh.Test")]
        string TestKey (string apiKey);

        [XmlRpcMethod("xmlrpc_cdrh.ListConstellations")]
        string[] ListConstellations (string apiKey);

        [XmlRpcMethod("xmlrpc_cdrh.ListPlatforms")]
        PlatformList ListPlatforms (string constellation, string apiKey);

        [XmlRpcMethod("xmlrpc_cdrh.ListParameters")]
        string[] ListParameters (string constellation, string platformId, string apiKey);

        [XmlRpcMethod("xmlrpc_cdrh.RetrieveCurrentReadings")]
        MeasurementList RetrieveCurrentReadings (string constellation, string platformId, string apiKey);

        [XmlRpcMethod("xmlrpc_cdrh.QueryData")]
        QueryResponse QueryData (string constellation, string platformId, string measurement, string beginDate, string endDate, string apiKey);
    }

    public class Service {

        private static IBuoyProxy proxy = XmlRpcProxyGen.Create<IBuoyProxy>();
        /*
        static Service () {
            RequestResponseLogger dumper = new RequestResponseLogger();
            dumper.Directory = @"C:\Documents and Settings\Russell\My Documents\xml-rpc-logs";
            dumper.Attach(proxy);
        }
        */
        public static void ListMethods () {
            try {
                string[] methodNames = proxy.SystemListMethods();
                foreach (string name in methodNames) {
                    Console.WriteLine(name);
                    Console.WriteLine("help:");
                    Console.WriteLine(" " + proxy.SystemMethodHelp(name));
                    Console.WriteLine("signature:");
                    object[] signatures = proxy.SystemMethodSignature(name);
                    foreach (string[] signature in signatures) {
                        for (int i = 1; i < signature.Length; i += 1) {
                            Console.WriteLine(" param[" + i + "]: " + signature[i]);
                        }
                        if (signature.Length > 0) {
                            Console.WriteLine("  returns: " + signature[0]);
                        }
                    }
                }
            } catch (XmlRpcFaultException fex) {
                Console.WriteLine(fex.FaultString);
            }
        }

        public static void TestKey () {
            Console.WriteLine(proxy.TestKey(API.Key));
        }

        public static string[] ListConstellations () {
            return proxy.ListConstellations(API.Key);
        }

        public static Platform[] ListPlatforms (string constellation) {
            PlatformList platforms = proxy.ListPlatforms(constellation, API.Key);
            int count = Math.Min(platforms.cn.Length, platforms.id.Length);
            Platform[] result = new Platform[count];
            for (int i = 0; i < count; i += 1) {
                result[i] = new Platform(constellation, platforms.id[i], platforms.cn[i]);
            }
            return result;
        }

        public static string[] ListParameters (Platform platform) {
            return proxy.ListParameters(platform.Constellation, platform.Id, API.Key);
        }

        public static Measurement[] RetrieveCurrentReadings (Platform platform) {
            MeasurementList measurements = proxy.RetrieveCurrentReadings(platform.Constellation, platform.Id, API.Key);
            int count = Math.Min(Math.Min(measurements.measurement.Length, measurements.time.Length),
                                 Math.Min(measurements.value.Length, measurements.units.Length));
            Measurement[] result = new Measurement[count];
            for (int i = 0; i < count; i += 1) {
                result[i] = new Measurement(measurements.measurement[i],
                                            measurements.value[i],
                                            measurements.units[i],
                                            measurements.time[i]);
            }
            return result;
        }

        public static PlatformMeasurements[] GetAllCurrentReadings (string constellation) {
            Platform[] platforms = ListPlatforms(constellation);
            PlatformMeasurements[] result = new PlatformMeasurements[platforms.Length];
            for (int i = 0; i < platforms.Length; i += 1) {
                result[i] = new PlatformMeasurements(platforms[i], RetrieveCurrentReadings(platforms[i]));
            }
            return result;
        }

        public static Measurement[] QueryData (Platform platform, string variable, DateTime begin, DateTime end) {
            QueryResponse data = proxy.QueryData(platform.Constellation,
                                                 platform.Id,
                                                 variable,
                                                 begin.ToUniversalTime().ToString(API.DateTimeFormat, DateTimeFormatInfo.InvariantInfo),
                                                 end.ToUniversalTime().ToString(API.DateTimeFormat, DateTimeFormatInfo.InvariantInfo),
                                                 API.Key);
            int count = Math.Min(data.values.time.Length, data.values.value.Length);
            Measurement[] result = new Measurement[count];
            for (int i = 0; i < count; i += 1) {
                result[i] = new Measurement(data.measurement,
                                            data.values.value[i],
                                            data.units,
                                            data.values.time[i]);
            }
            return result;
        }
    }
}
