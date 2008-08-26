<%@ Page Language="C#" AutoEventWireup="true" CodeFile="RequestSubmitted.aspx.cs" Inherits="RequestSubmitted" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">
  <head runat="server">
    <title>Untitled Page</title>
  </head>
  <body>
    <form id="form1" runat="server">
      <div>
        <h3>
          New User Request Submitted!
        </h3>
        <p>
          Your request for a new FieldScope user account was successfully submitted. 
          You should receive an email with the account details within one business 
          day. In the meantime, please log in to FieldScope using 
          <asp:LinkButton ID="FieldScope_GuestLoginButton" OnClick="LoginAsGuest" runat="server">
            the guest account
          </asp:LinkButton>.
        </p>
      </div>
    </form>
  </body>
</html>
