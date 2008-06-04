using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

namespace NGS
{
    /// <summary>
    /// Holds the popup information
    /// </summary>
    public class VEPopup
    {

        private string _title;
        private string _descriptionHtml;

        public VEPopup() { }

        public VEPopup(string title, string descriptionHtml)
        {
            _title = title;
            _descriptionHtml = descriptionHtml;
        }


        public string Title
        {
            get { return _title; }
            set { _title = value; }
        }


        public string DescriptionHtml
        {
            get { return _descriptionHtml; }
            set { _descriptionHtml = value; }
        }



    }
}