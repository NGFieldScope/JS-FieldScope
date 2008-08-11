using System.Collections.Generic;

/// <summary>
/// Summary description for Utilities
/// </summary>
namespace Utilities {

    public sealed class Regexp {

        public static readonly System.Text.RegularExpressions.Regex EMAIL = new System.Text.RegularExpressions.Regex(@"\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*");
    }

    public sealed class NameMap {

        private readonly Dictionary<string, string> _presentationToInternal;
        private readonly Dictionary<string, string> _internalToPresentation;

        public NameMap () {
            _presentationToInternal = new Dictionary<string, string>();
            _internalToPresentation = new Dictionary<string, string>();
        }

        public void Add (string internalName, string presentationName) {
            _presentationToInternal.Add(presentationName, internalName);
            _internalToPresentation.Add(internalName, presentationName);
        }

        public bool ContainsInternalName (string name) {
            return _internalToPresentation.ContainsKey(name);
        }

        public string PresentationName (string internalName) {
            return _internalToPresentation[internalName];
        }

        public string InternalName (string presentationName) {
            return _presentationToInternal[presentationName];
        }
    }

    public sealed class ByteCache {

        private readonly byte[] _data;
        private readonly string _contentType;

        public byte[] Data { get { return _data; } }
        public string ContentType { get { return _contentType; } }

        public ByteCache (byte[] data, string contentType) {
            _data = data;
            _contentType = contentType;
        }
    }
}
