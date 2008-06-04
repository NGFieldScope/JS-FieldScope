<%@ WebService Language="C#" Class="NGSDataService" %>
using System;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Collections;
using System.Collections.Generic;
using System.Web.Script.Services;
using NGS.Services;
using NGS;


    /// <summary>
    /// Summary description for NGSDataService
    /// </summary>
    [WebService(Namespace = "http://focus.metalens.org/dataservice")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ScriptService]
    public class NGSDataService : System.Web.Services.WebService
    {
        private NGS.Services.NGSDataManager _dataProvider;
        
        private const string CPXURL = @"http://focus.metalens.org/";        


        /// <summary>
        /// Initializes a new instance of the <see cref="NGSDataService"/> class.
        /// </summary>
        public NGSDataService()
        {
            //create the data manager that does all the work
            _dataProvider = new NGS.Services.NGSDataManager(CPXURL);
        }

        /// <summary>
        /// Gets the asset points.
        /// </summary>
        /// <param name="criteria">The criteria.</param>
        /// <param name="bounds">The bounds.</param>
        /// <returns></returns>
        [WebMethod(Description = "Get clustered  points based on the  bounds")]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public List<NGS.VEPoint> GetPoints(string bbox, int zoomLevel)
        {
            try
            {
                //Just proxy back to the WME class lib                
                List<NGS.VEPoint> result = _dataProvider.GetClusteredPoints(bbox, zoomLevel);
                return result;
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        

        /// <summary>
        /// Gets the point popup.
        /// </summary>
        /// <param name="pointLocationId">The asset id.</param>
        /// <returns></returns>
        [WebMethod(Description = "Get the pop-up details for a specific point")]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public VEPointPopup GetPointPopup(int assetId)
        {
            return _dataProvider.GetPointPopup(assetId);
        }
    }
