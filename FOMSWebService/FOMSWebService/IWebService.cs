using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Web;
using System.Text;

namespace FOMSWebService
{
    // NOTE: You can use the "Rename" command on the "Refactor" menu to change the interface name "IService1" in both code and config file together.
    [ServiceContract]
    public interface IWebService
    {

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EventData> GetRecentEventList(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        PositionData GetVesselLatestDistance(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        PositionData GetVesselLatestPosition(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        EngineData GetEngineTotalAndEstConsumption(int vesselId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<PositionData> GenerateMapFromQueryTime(int vesselId, string queryTime);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEngineTypes(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json)]
        Message GetEngineChartByEngineType(int vesselId, double timezone, string engineType);


        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Message GetEngineLiveChartPoint(int vesselId, double timezone, string timeOfLastPoint, string engineType);

    }


    // Use a data contract as illustrated in the sample below to add composite types to service operations.
    [DataContract]
    public class ResultData
    {
        private string key;
        private string result;

        [DataMember]
        public string Result
        {
            get { return result; }
            set { result = value; }
        }


        [DataMember]
        public string Key
        {
            get { return key; }
            set { key = value; }
        }

    }

    [DataContract]
    public class EventData
    {
        private string datetime;
        private string eventType;
        private string eventDesc;

        [DataMember]
        public string EventDesc
        {
            get { return eventDesc; }
            set { eventDesc = value; }
        }


        [DataMember]
        public string EventType
        {
            get { return eventType; }
            set { eventType = value; }
        }


        [DataMember]
        public string Datetime
        {
            get { return datetime; }
            set { datetime = value; }
        }

    }

    [DataContract]
    public class PositionData
    {
        private string wgs84Lat;
        private string wgs84Lon;
        private string totalDistance;
        private string avgLitrePerNm;
        private string sog;
        private string cog;
        private string latitude;
        private string longitude;

        [DataMember]
        public string Longitude
        {
            get { return longitude; }
            set { longitude = value; }
        }


        [DataMember]
        public string Latitude
        {
            get { return latitude; }
            set { latitude = value; }
        }


        [DataMember]
        public string Cog
        {
            get { return cog; }
            set { cog = value; }
        }


        [DataMember]
        public string Sog
        {
            get { return sog; }
            set { sog = value; }
        }


        [DataMember]
        public string AvgLitrePerNm
        {
            get { return avgLitrePerNm; }
            set { avgLitrePerNm = value; }
        }


        [DataMember]
        public string TotalDistance
        {
            get { return totalDistance; }
            set { totalDistance = value; }
        }


        [DataMember]
        public string Wgs84Lon
        {
            get { return wgs84Lon; }
            set { wgs84Lon = value; }
        }

        [DataMember]
        public string Wgs84Lat
        {
            get { return wgs84Lat; }
            set { wgs84Lat = value; }
        }

    }

    [DataContract]
    public class EngineData
    {
        private string totalCons;
        private string estCons;
        private string userStartDatetime;

        [DataMember]
        public string UserStartDatetime
        {
            get { return userStartDatetime; }
            set { userStartDatetime = value; }
        }


        [DataMember]
        public string EstCons
        {
            get { return estCons; }
            set { estCons = value; }
        }


        [DataMember]
        public string TotalCons
        {
            get { return totalCons; }
            set { totalCons = value; }
        }

    }
}
