using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Web;

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

    public sealed class User {

        public static SqlServer.UserInfo GetCurrentUser (HttpRequest request) {
            if (request.Cookies.AllKeys.Contains("FieldScope_Cookie")) {
                // NOTE: DO NOT check that (Request.Cookies["FieldScope_Cookie"] == null), 
                // because this will not only always return false, it will also create 
                // an empty cookie named FieldScope_Cookie
                string cookie = request.Cookies["FieldScope_Cookie"].Value;
                return SqlServer.Service.CheckLogin(cookie);
            }
            return null;
        }
    }

    public sealed class Email {

        public static void Send (string[] to, string subject, string message) {
            MailMessage mail = new MailMessage();
            mail.From = new MailAddress("FieldScope <noreply@geode1.sesp.northwestern.edu>");
            foreach (string recipient in to) {
                mail.To.Add(recipient);
            }
            mail.Subject = subject;
            mail.Body = message;
            SmtpClient mailClient = new SmtpClient("geode1.sesp.northwestern.edu");
            mailClient.UseDefaultCredentials = false;
            mailClient.Credentials = new NetworkCredential("smtp_user", "ches$by1");
            mailClient.Port = 25;
            mailClient.Send(mail);
        }
    }
}
