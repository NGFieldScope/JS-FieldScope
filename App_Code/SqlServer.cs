﻿using System;
using System.Data;
using System.Data.SqlClient;
using System.Web.Security;

namespace SqlServer {

    public enum AuthLevel { Guest, User, Admin };

    public class UserInfo {

        public static readonly UserInfo GUEST = new UserInfo();

        private readonly string _username;
        private readonly string _state;
        private readonly AuthLevel _authLevel;
        private readonly string _organization;
        private readonly string _email;
        private readonly string _cookie;

        public string Username { get { return _username; } }
        public string State { get { return _state; } }
        public AuthLevel AuthLevel { get { return _authLevel; } }
        public string Organization { get { return _organization; } }
        public string Email { get { return _email; } }
        public string Cookie { get { return _cookie; } }

        public UserInfo (string cookie,
                         string username,
                         string state,
                         bool admin,
                         string organization,
                         string email) {
            _cookie = cookie.TrimEnd();
            _username = username.TrimEnd();
            _state = state.TrimEnd();
            _authLevel = admin ? AuthLevel.Admin : AuthLevel.User;
            _organization = organization;
            _email = email;
        }

        private UserInfo () {
            _cookie = "0";
            _username = "guest";
            _state = "";
            _authLevel = AuthLevel.Guest;
            _organization = "";
            _email = "";
        }
        
        public override string ToString () {
            return string.Format("{{User:{0},Organization:{1},Email:{2},AuthLevel:{3},State:{4}}}",
                                 _username, _organization, _email, _authLevel, _state);
        }
    }

    public class Service {

        static SqlConnection conn = new SqlConnection(@"Data Source=GEODE1\SQLEXPRESS;Initial Catalog=chesapeake_users;Integrated Security=True");

        public static int AddUser (string username,
                                   string password,
                                   string organization,
                                   string email) {
            string cookie = FormsAuthentication.HashPasswordForStoringInConfigFile(username, "SHA1");
            string hashedPw = FormsAuthentication.HashPasswordForStoringInConfigFile(password, "SHA1");
            SqlCommand command = new SqlCommand("INSERT INTO users (username, cookie, password, organization, email) " +
                                                  "VALUES (@Username, @Cookie, @Password, @Organization, @Email)",
                                                conn);
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            command.Parameters.Add("@Cookie", SqlDbType.VarChar, 50).Value = cookie;
            command.Parameters.Add("@Password", SqlDbType.VarChar, 50).Value = hashedPw;
            command.Parameters.Add("@Organization", SqlDbType.VarChar).Value = organization;
            command.Parameters.Add("@Email", SqlDbType.VarChar).Value = email;
            conn.Open();
            try {
                return command.ExecuteNonQuery();
            } finally {
                conn.Close();
            }
        }

        public static int SetPassword (string username, string password) {
            string hashedPw = FormsAuthentication.HashPasswordForStoringInConfigFile(password, "SHA1");
            SqlCommand command = new SqlCommand("UPDATE users SET password = @Password WHERE username = @Username", conn);
            command.Parameters.Add("@Password", SqlDbType.VarChar, 50).Value = hashedPw;
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            conn.Open();
            try {
                return command.ExecuteNonQuery();
            } finally {
                conn.Close();
            }
        }

        public static bool UsernameExists (string username) {
            SqlCommand command = new SqlCommand("SELECT COUNT(*) FROM users WHERE username = @Username", conn);
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            conn.Open();
            try {
                return (Int32)command.ExecuteScalar() > 0;
            } finally {
                conn.Close();
            }
        }

        public static int UpdateUser (string username,
                                      string organization,
                                      string email) {
            SqlCommand command = new SqlCommand("UPDATE users " +
                                                  "SET organization = @Organization, email = @Email " +
                                                  "WHERE username = @Username",
                                                conn);
            command.Parameters.Add("@Organization", SqlDbType.VarChar).Value = organization;
            command.Parameters.Add("@Email", SqlDbType.VarChar).Value = email;
            command.Parameters.Add("@Username", SqlDbType.VarChar, 12).Value = username;
            conn.Open();
            try {
                return command.ExecuteNonQuery();
            } finally {
                conn.Close();
            }
        }

        public static UserInfo FindUser (string usernameOrPassword) {
            SqlCommand command = new SqlCommand("SELECT cookie,username,state,admin,organization,email FROM users WHERE username = @Search OR email = @Search", conn);
            command.Parameters.Add("@Search", SqlDbType.VarChar).Value = usernameOrPassword;
            conn.Open();
            SqlDataReader reader = command.ExecuteReader();
            try {
                if (reader.Read()) {
                    return new UserInfo((string)reader[0],
                                        (string)reader[1],
                                        (reader[2] is string) ? (string)reader[2] : "",
                                        (bool)reader[3],
                                        (string)reader[4],
                                        (string)reader[5]);
                } else {
                    return null;
                }
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
            if (cookie.Equals(UserInfo.GUEST.Cookie)) {
                return UserInfo.GUEST;
            }
            SqlCommand command = new SqlCommand("SELECT username,state,admin,organization,email FROM users WHERE cookie = @Cookie", conn);
            command.Parameters.Add("@Cookie", SqlDbType.VarChar, 50).Value = cookie;
            conn.Open();
            SqlDataReader reader = command.ExecuteReader();
            try {
                if (reader.Read()) {
                    return new UserInfo(cookie,
                                        (string)reader[0],
                                        (reader[1] is string) ? (string)reader[1] : "",
                                        (bool)reader[2],
                                        (string)reader[3],
                                        (string)reader[4]);
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
