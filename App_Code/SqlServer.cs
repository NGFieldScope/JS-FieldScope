using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.Security;

namespace SqlServer {

    public class UserInfo {

        private readonly string _username;
        private readonly string _state;
        private readonly bool _isAdmin;

        public string Username { get { return _username; } }
        public string State { get { return _state; } }
        public bool Admin { get { return _isAdmin; } }

        public UserInfo (string username, string state, bool admin) {
            _username = username.TrimEnd();
            _state = state.TrimEnd();
            _isAdmin = admin;
        }

        public override string ToString () {
            return string.Format("{{User:{0},State:{1},Admin:{2}}}", _username, _state, _isAdmin);
        }
    }

    public class Service {

        static SqlConnection conn = new SqlConnection(@"Data Source=GEODE1\SQLEXPRESS;Initial Catalog=chesapeake_users;Integrated Security=True");

        public static int AddUser (string username, string password) {
            string cookie = FormsAuthentication.HashPasswordForStoringInConfigFile(username, "SHA1");
            string hashedPw = FormsAuthentication.HashPasswordForStoringInConfigFile(password, "SHA1");
            SqlCommand command = new SqlCommand("INSERT INTO users (username, cookie, password) VALUES (@Username, @Cookie, @Password)", conn);
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            command.Parameters.Add("@Cookie", SqlDbType.VarChar, 50).Value = cookie;
            command.Parameters.Add("@Password", SqlDbType.VarChar, 50).Value = hashedPw;
            conn.Open();
            try {
                return command.ExecuteNonQuery();
            } finally {
                conn.Close();
            }
        }

        public static string CheckLogin (string username, string password) {
            string hashedPw = FormsAuthentication.HashPasswordForStoringInConfigFile(password, "SHA1");
            SqlCommand command = new SqlCommand("SELECT cookie FROM users WHERE username = @Username AND password = @Password", conn);
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            command.Parameters.Add("@Password", SqlDbType.VarChar, 50).Value = hashedPw;
            conn.Open();
            SqlDataReader reader = command.ExecuteReader();
            try {
                if (reader.Read()) {
                    return (string)reader[0];
                } else {
                    return null;
                }
            } finally {
                conn.Close();
            }
        }

        public static UserInfo CheckLogin (string cookie) {
            SqlCommand command = new SqlCommand("SELECT username,state,admin FROM users WHERE cookie = @Cookie", conn);
            command.Parameters.Add("@Cookie", SqlDbType.VarChar, 50).Value = cookie;
            conn.Open();
            SqlDataReader reader = command.ExecuteReader();
            try {
                if (reader.Read()) {
                    return new UserInfo((string)reader[0], (reader[1] is string) ? (string)reader[1] : "", (bool)reader[2]);
                } else {
                    return null;
                }
            } finally {
                conn.Close();
            }
        }

        public static int StoreState (string cookie, string state) {
            SqlCommand command = new SqlCommand("UPDATE users SET state = @State WHERE cookie = @Cookie", conn);
            command.Parameters.Add("@State", SqlDbType.Text).Value = state;
            command.Parameters.Add("@Cookie", SqlDbType.VarChar, 50).Value = cookie;
            conn.Open();
            try {
                return command.ExecuteNonQuery();
            } finally {
                conn.Close();
            }
        }
    }
}
