﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
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

        #region Common Methods

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetUserRelatedCompany(int userId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetUserRelatedFleetAndVessels(int userId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetUserRelatedFleets(int userId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetUserRelatedVessels(int userId, int fleetId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        DateTimeData GetCurrentDatetime(int userId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        DateTimeData GetCurrentDatetime_ForDateTimePicker(int userId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEngineTypesWithoutBunker(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEngineTypesByFleetWithoutBunker(int fleetId);

        #endregion

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EventData> GetRecentEventList(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        PositionData GetVesselLatestDistance(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        PositionData GetVesselLatestPosition(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        ResultData GetLastOperationMode(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        EngineData GetEngineTotalAndEstConsumption(int vesselId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        EngineData GetEngineTotalAndEstConsumptionByFleet(int fleetId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<PositionData> GenerateMapFromQueryTime(int vesselId, double timezone, string queryTime);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEngineTypes(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEngineTypesByFleet(int fleetId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<AnalogData> GetAllAnalog(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EngineData> GetAllEngines(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        BunkerData GetBunkeringByFleet(int fleetId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EventData> GetLatestEventListByFleet(int fleetId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetDistanceAndAvgConsAndReportingVessels(int fleetId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<PositionData> GetFleetCurrentPosition(int fleetId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EngineData> GetCurrentEngineData(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<List<AnalogData>> GetCurrentAnalogData(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetSynchornizedChartByAnalogId(int vesselId, double timezone, int querytime, string analogId, bool includeRefSignal);

        #region Other Signal / IOAlarm Methods

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<IOAlarmData> GetCurrentAlarmStatus(int vesselId, double timezone);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<IOAlarmData> GetIOAlarmByQuery(int vesselId, double timezone, int querytime);

        #endregion

        #region Report Methods

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllAnalogTypes(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<ResultData> GetAllEventTypes(int vesselId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<EventData> GetAllEventsByQuery(int vesselId, double timezone, string startDatetimeStr, string endDatetimeStr);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        List<PositionData> GetPositionByQuery(int vesselId, double timezone, int querytime, string startDatetimeStr, string endDatetimeStr, string eventType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        ResultData CheckReportStatus(int vesselId, int reportId);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        ResultData GenerateReport(int vesselId, double timezone, int userId, int querytime, string startDatetimeStr, string endDatetimeStr, string reportType, string selectMainType);

        #endregion

        #region Chart Related Methods

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetEngineChartByQueryTime(int vesselId, double timezone, double querytime, string startDatetimeStr, string endDatetimeStr, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetAnalogChartByQueryTime(int vesselId, double timezone, int querytime, string startDatetimeStr, string endDatetimeStr, string analogType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetDailyEngineChartByEngineType(int vesselId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetEngineLiveChartPoint(int vesselId, double timezone, string timeOfLastPoint, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetIndividualVesselEngineChartByFleet(int fleetId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetTotalEngineChartByFleet(int fleetId, double timezone, string engineType);

        [OperationContract]
        [WebInvoke(Method = "GET", ResponseFormat = WebMessageFormat.Json)]
        Stream GetSynchornizedChartByEngineId(int vesselId, double timezone, int querytime, string engineId, bool includeRefSignal);

        #endregion

        [OperationContract]
        [WebInvoke(Method = "POST", ResponseFormat = WebMessageFormat.Json, BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        LoginData LoginUser(string userId, string password);

    }


    // Use a data contract as illustrated in the sample below to add composite types to service operations.
    [DataContract]
    public class DateTimeData
    {
        private string startDatetime;
        private string endDatetime;

        [DataMember]
        public string EndDatetime
        {
            get { return endDatetime; }
            set { endDatetime = value; }
        }

        [DataMember]
        public string StartDatetime
        {
            get { return startDatetime; }
            set { startDatetime = value; }
        }

    }

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
        private string vesselName;

        [DataMember]
        public string VesselName
        {
            get { return vesselName; }
            set { vesselName = value; }
        }


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
        private decimal sog;
        private decimal cog;
        private decimal latitude;
        private decimal longitude;
        private string vesselName;
        private string eventDesc;
        private string positionDatetime;
        private string latestDatetime;

        [DataMember]
        public string LatestDatetime
        {
            get { return latestDatetime; }
            set { latestDatetime = value; }
        }


        [DataMember]
        public string PositionDatetime
        {
            get { return positionDatetime; }
            set { positionDatetime = value; }
        }


        [DataMember]
        public string EventDesc
        {
            get { return eventDesc; }
            set { eventDesc = value; }
        }


        [DataMember]
        public string VesselName
        {
            get { return vesselName; }
            set { vesselName = value; }
        }

        [DataMember]
        public decimal Longitude
        {
            get { return longitude; }
            set { longitude = value; }
        }


        [DataMember]
        public decimal Latitude
        {
            get { return latitude; }
            set { latitude = value; }
        }


        [DataMember]
        public decimal Cog
        {
            get { return cog; }
            set { cog = value; }
        }


        [DataMember]
        public decimal Sog
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
        private string runningMins;
        private string engineName;
        private string engineId;
        private string engineType;

        [DataMember]
        public string EngineType
        {
            get { return engineType; }
            set { engineType = value; }
        }


        [DataMember]
        public string EngineId
        {
            get { return engineId; }
            set { engineId = value; }
        }


        [DataMember]
        public string EngineName
        {
            get { return engineName; }
            set { engineName = value; }
        }


        [DataMember]
        public string RunningMins
        {
            get { return runningMins; }
            set { runningMins = value; }
        }


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

    [DataContract]
    public class AnalogData
    {
        private string analogName;
        private string analogValue;
        private string analogUnit;
        private string analogId;
        private string refEngineId;
        private string alarmStatus;
        private string analogType;

        [DataMember]
        public string AnalogType
        {
            get { return analogType; }
            set { analogType = value; }
        }


        [DataMember]
        public string AlarmStatus
        {
            get { return alarmStatus; }
            set { alarmStatus = value; }
        }


        [DataMember]
        public string RefEngineId
        {
            get { return refEngineId; }
            set { refEngineId = value; }
        }


        [DataMember]
        public string AnalogId
        {
            get { return analogId; }
            set { analogId = value; }
        }


        [DataMember]
        public string AnalogUnit
        {
            get { return analogUnit; }
            set { analogUnit = value; }
        }


        [DataMember]
        public string AnalogValue
        {
            get { return analogValue; }
            set { analogValue = value; }
        }


        [DataMember]
        public string AnalogName
        {
            get { return analogName; }
            set { analogName = value; }
        }

    }

    [DataContract]
    public class IOAlarmData
    {
        private int alarmID;
        private string description;
        private bool alarmStatus;
        private string alarmDateTime;
        private string location;

        private string alarmDescription;

        [DataMember]
        public string AlarmDescription
        {
            get { return alarmDescription; }
            set { alarmDescription = value; }
        }


        [DataMember]
        public string Location
        {
            get { return location; }
            set { location = value; }
        }

        [DataMember]
        public string AlarmDateTime
        {
            get { return alarmDateTime; }
            set { alarmDateTime = value; }
        }

        [DataMember]
        public bool AlarmStatus
        {
            get { return alarmStatus; }
            set { alarmStatus = value; }
        }

        [DataMember]
        public string Description
        {
            get { return description; }
            set { description = value; }
        }

        [DataMember]
        public int AlarmID
        {
            get { return alarmID; }
            set { alarmID = value; }
        }

    }

    [DataContract]
    public class LoginData
    {
        private string userId;
        private string timezone;
        private bool loginResult;

        [DataMember]
        public bool LoginResult
        {
            get { return loginResult; }
            set { loginResult = value; }
        }


        [DataMember]
        public string Timezone
        {
            get { return timezone; }
            set { timezone = value; }
        }


        [DataMember]
        public string UserId
        {
            get { return userId; }
            set { userId = value; }
        }

    }

    [DataContract]
    public class BunkerData
    {
        private string bunkerIn;
        private string bunkerOut;

        [DataMember]
        public string BunkerOut
        {
            get { return bunkerOut; }
            set { bunkerOut = value; }
        }


        [DataMember]
        public string BunkerIn
        {
            get { return bunkerIn; }
            set { bunkerIn = value; }
        }

    }
}
