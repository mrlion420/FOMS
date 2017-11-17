using BLL.FMCC.BLL;
using Common;
using CommonHelper;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Channels;
using System.ServiceModel.Web;
using System.ServiceModel.Activation;
using System.Text;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Globalization;
using System.Security.Cryptography;

namespace FOMSWebService
{
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class FOMSWebService : IWebService
    {
        // Logger Initialization 
        Logger log = new Logger(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + @"\log.txt");
        #region Common Methods

        public List<ResultData> GetUserRelatedCompany(int userId)
        {
            List<ResultData> companyList = new List<ResultData>();
            try
            {
                User currentUser = User.GetByUserId(userId);
                // If User is admin
                if(currentUser.UserRoleCode == 2)
                {
                    List<Company> allCompanyList = Company.GetAll();
                    
                    foreach(Company company in allCompanyList)
                    {
                        ResultData resultCompany = new ResultData();
                        resultCompany.Result = company.CompanyName;
                        resultCompany.Key = company.CompanyId.ToString();
                        companyList.Add(resultCompany);
                    }
                }
                // If User is not admin
                else
                {
                    Company company = Company.GetByCompanyId(currentUser.CompanyId);
                    ResultData resultCompany = new ResultData();
                    resultCompany.Result = company.CompanyName;
                    resultCompany.Key = company.CompanyId.ToString();
                    companyList.Add(resultCompany);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return companyList;
        }

        public List<List<ResultData>> GetUserRelatedFleetsAndVessels(int userId)
        {
            List<List<ResultData>> fleetAndVesselsList = new List<List<ResultData>>(); 
            try
            {
                List<FleetVessel> fleetVesselList = new List<FleetVessel>();
                List<Fleet> fleetList = new List<Fleet>();
                List<Vessel> vesselList = new List<Vessel>();
                
                User.GetFleetVesselByUserID(userId, ref fleetVesselList, ref fleetList, ref vesselList);
                // Resulting fleet list 
                List<ResultData> resultFleetList = new List<ResultData>();
                foreach(Fleet fleet in fleetList)
                {
                    ResultData resultFleet = new ResultData();
                    resultFleet.Result = fleet.FleetName;
                    resultFleet.Key = fleet.FleetId.ToString();
                    resultFleetList.Add(resultFleet);
                }
                // Resulting Vessel list
                List<ResultData> resultVesselList = new List<ResultData>();
                foreach(Vessel vessel in vesselList)
                {
                    ResultData resultVessel = new ResultData();
                    resultVessel.Result = vessel.VesselName;
                    resultVessel.Key = vessel.VesselId.ToString();
                    resultVesselList.Add(resultVessel);
                }

                fleetAndVesselsList.Add(resultFleetList);
                fleetAndVesselsList.Add(resultVesselList);
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return fleetAndVesselsList;
        }

        public List<ResultData> GetUserRelatedFleets(int userId)
        {
            List<ResultData> fleetResultList = new List<ResultData>();
            try
            {
                List<FleetVessel> fleetVesselList = new List<FleetVessel>();
                List<Fleet> fleetList = new List<Fleet>();
                List<Vessel> vesselList = new List<Vessel>();

                bool isSuccessful = User.GetFleetVesselByUserID(userId, ref fleetVesselList, ref fleetList, ref vesselList);

                var source = new Dictionary<string, string>();

                if (fleetList.Count > 0 && isSuccessful)
                {
                    // Sort all the fleet in alphabetical order
                    fleetList.Sort(delegate (Fleet fleetA, Fleet fleetB)
                    {

                        return string.Compare(fleetA.FleetName, fleetB.FleetName);
                    });
                   
                    foreach (Fleet fleet in fleetList)
                    {
                        ResultData fleetItem = new ResultData();
                        fleetItem.Key = fleet.FleetId.ToString();
                        fleetItem.Result = fleet.FleetName;
                        fleetResultList.Add(fleetItem);
                    }

                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return fleetResultList;
        }

        public List<ResultData> GetUserRelatedVessels(int userId, int fleetId)
        {
            List<ResultData> vesselResultList = new List<ResultData>();
            try
            {
                List<FleetVessel> fleetVesselList = new List<FleetVessel>();
                List<Fleet> fleetList = new List<Fleet>();
                List<Vessel> vesselList = new List<Vessel>();

                bool isSuccessful = User.GetFleetVesselByUserID(userId, ref fleetVesselList, ref fleetList, ref vesselList);

                List<Vessel> vesselDataList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselDataList)
                {
                    ResultData vesselItem = new ResultData();
                    vesselItem.Key = vessel.VesselId.ToString();
                    vesselItem.Result = vessel.VesselName;
                    vesselResultList.Add(vesselItem);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return vesselResultList;
        }

        #endregion

        #region Login Page Methods

        public ResultData LoginUser(string userId, string password)
        {
            ResultData result = new ResultData();
            //var passwordString = "abc";
            //var salt = "ac6.tdJm#n/sr3xd#%m+EU3mHv<1s#[w--vg6B-u|,jl3V*UHM-L79fc2FyO%z)";
            //var finalPassword = passwordString + salt;
            //var data = Encoding.UTF8.GetBytes(finalPassword);

            //using (SHA512 shaM = new SHA512Managed())
            //{
            //    var hash = shaM.ComputeHash(data);
            //    var sb = new StringBuilder();
            //    foreach (byte b in hash)
            //    {
            //        var hex = b.ToString("x2");
            //        sb.Append(hex);
            //    }
            //    string hexString = sb.ToString();
            //}
            try
            {
                User currentUser = User.ValidateUser(userId, password);
                if(currentUser == null)
                {
                    result.Result = false.ToString();
                }
                else
                {
                    
                    result.Result = true.ToString();
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return result;
        }

        #endregion

        #region Vessel Page Methods

        public List<EventData> GetRecentEventList(int vesselId, double timezone)
        {
            List<EventData> eventDataList = new List<EventData>();

            try
            {
                //double timezone = getUserTimezone();
                //DateTime dateTimeStart = DateTime.Parse("01-Jan-2011");
                DateTime datetimeStart = DateTime.UtcNow.AddDays(-14);
                DateTime dateTimeEnd = DateTime.UtcNow;

                DataTable eventListDataTable = new DataTable();
                List<EventList> eventList = EventList.GetAll(vesselId, datetimeStart, dateTimeEnd, BLL_Enum._EVENT_TYPE.All);
                //eventListDataTable = EventList.GetEventDisplayDetailByPeriod(dateTimeStart, dateTimeEnd, BLL_Enum._EVENT_TYPE.All, 20);

                foreach(EventList eventItem in eventList)
                {
                    DateTime eventDateTime = Convert.ToDateTime(eventItem.EventDateTime).AddHours(timezone);

                    EventData eventData = new EventData();
                    eventData.Datetime = DateTimeExtension.DisplayDateWithoutYear(eventDateTime);
                    eventData.EventType = eventItem.EventTypeDesc;
                    eventData.EventDesc = eventItem.EventDescription;

                    eventDataList.Add(eventData);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return eventDataList;
        }

        public PositionData GetVesselLatestDistance(int vesselId, double timezone)
        {
            PositionData position = new PositionData();
            try
            {
                double totalFlow = 0;
                DateTime startDatetime = DateTimeExtension.CalculateUserTodayDateStartTime(timezone);
                DateTime endDatetime = DateTime.UtcNow;
                // Calculate the total Distance
                double totalDistance = Position.GetTotalDistance(vesselId, startDatetime, endDatetime);
                // Get all the possible engine enums that exist in the system
                List<SystemCode> engineCodeList = SystemCode.GetSysCodeList(BLL_Enum._SYS_CODE_TYPE.ENGINE);
                foreach(SystemCode systemCode in engineCodeList)
                {
                    BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), systemCode.SysCodeId);
                    if(engineCodeEnum != BLL_Enum._ENGINE.Bunker)
                    {
                        totalFlow += EngineReading.GetTotalFlowByEngineCode(vesselId, engineCodeEnum, startDatetime, endDatetime);
                    }
                    
                }
                
                if (totalDistance == 0)
                {
                    totalDistance = 1;
                }

                double avgLitrePerNm = Convert.ToDouble(totalFlow) / totalDistance;

                position.TotalDistance = totalDistance.ToString();
                position.AvgLitrePerNm = avgLitrePerNm.ToString();
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return position;
        }

        public PositionData GetVesselLatestPosition(int vesselId)
        {
            PositionData positionData = new PositionData();
            try
            {
                Position positionItem = Position.GetLatest(vesselId);

                decimal latitude = positionItem.Latitude;
                string wgs84Latitude = positionItem.Wgs84Latitude;

                decimal longitude = positionItem.Longitude;
                string wgs84Longitude = positionItem.Wgs84Longitude;
                string cog = positionItem.Cog.ToString();
                string sog = positionItem.Sog.ToString();

                positionData.Latitude = latitude;
                positionData.Longitude = longitude;
                positionData.Wgs84Lat = wgs84Latitude;
                positionData.Wgs84Lon = wgs84Longitude;
                positionData.Cog = cog;
                positionData.Sog = sog;
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return positionData;
        }

        public ResultData GetLastOperationMode(int vesselId, double timezone)
        {
            ResultData result = new ResultData();
            try
            {
                
                EventOperationMode latestOperation = EventOperationMode.GetLatest(vesselId);
                DateTime startDateTime = latestOperation.StartDatetime.AddHours(timezone);

                int systemCodeEventType = Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.OPERATION_MODE);
                string currentOperationCode = Convert.ToString(latestOperation.OperationModeCode);

                string operationDesc = SystemCode.GetBySysCodeTypeIdSysCodeId(systemCodeEventType, currentOperationCode).SysCodeDesc;
                result.Key = DateTimeExtension.DisplayDateWithUTC(startDateTime, timezone);
                result.Result = operationDesc;
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return result;
        }

        public List<ResultData> GetAllEngineTypes(int vesselId)
        {
            List<ResultData> resultDataList = new List<ResultData>();
            try
            {
                HashSet<short> engineCodeHS = new HashSet<short>();
                List<Engine> engineList = Engine.GetAll(vesselId);
                foreach (Engine engine in engineList)
                {
                    short engineCode = engine.EngineCode.GetValueOrDefault();
                    if (engineCode == 3)
                    {
                        engineCode = 2;
                    }
                    engineCodeHS.Add(engineCode);
                }

                foreach (short engineCode in engineCodeHS)
                {
                    ResultData result = new ResultData();
                    string engineType = SystemCode.GetBySysCodeTypeIdSysCodeId(Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ENGINE), engineCode.ToString()).SysCodeDesc;
                    if (engineCode != 2)
                    {
                        result.Key = engineCode.ToString();
                        result.Result = engineType;
                    }
                    else
                    {
                        result.Key = engineCode.ToString();
                        result.Result = "Thursters";
                    }
                    resultDataList.Add(result);
                }
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return resultDataList;
        }

        public EngineData GetEngineTotalAndEstConsumption(int vesselId, double timezone, string engineType)
        {
            EngineData engineData = new EngineData();
            try
            {
                BLL_Enum._ENGINE engineEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                DateTime startDatetime = DateTimeExtension.CalculateUserTodayDateStartTime(timezone);
                DateTime endDatetime = DateTime.UtcNow;

                double totalFlow = EngineReading.GetTotalFlowByEngineCode(vesselId, engineEnum, startDatetime, endDatetime);
                double totalHour = (endDatetime - startDatetime).TotalHours; // Get the difference in hours
                double estCons = Convert.ToDouble(totalFlow) / totalHour;
                engineData.TotalCons = totalFlow.ToString();
                engineData.EstCons = estCons.ToString();
                engineData.UserStartDatetime = DateTimeExtension.DisplayDateAddTimezoneWithUTC(startDatetime, timezone);
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return engineData;
        }

        public List<PositionData> GenerateMapFromQueryTime(int vesselId, string queryTime)
        {
            List<PositionData> positionDataList = new List<PositionData>();
            try
            {
                double querytimeDouble = Convert.ToDouble(queryTime);
                DateTime start, end;
                // Minus the requested querytime 
                DateTime startTime = DateTime.UtcNow.AddHours(-querytimeDouble).AddDays(-3);
                start = new DateTime(startTime.Year, startTime.Month, startTime.Day, startTime.Hour,0, 0);
                DateTime today = DateTime.UtcNow;
                end = new DateTime(today.Year, today.Month, today.Day, today.Hour, 0, 0);
                //PositionList positionList = Position.GetByQueryPeriod(startTime, today, BLL_Enum._SORT_ORDER.ASC);
                DataSet positionDS = Position.GetView(vesselId, BLL_Enum._EVENT_TYPE.All, BLL_Enum._VIEW_INTERVAL.Live, start, end);
                
                foreach(DataTable positionTable in positionDS.Tables)
                {
                    foreach(DataRow positionRow in positionTable.Rows)
                    {
                        PositionData positionData = new PositionData();
                        //latitude = position.Latitude;
                        //longitude = position.Longitude;
                        //positionData.Latitude = latitude.ToString();
                        //positionData.Longitude = longitude.ToString();
                        positionData.Latitude = Convert.ToDecimal(positionRow["LATITUDE"].ToString());
                        positionData.Longitude = Convert.ToDecimal(positionRow["LONGITUDE"].ToString());
                        positionDataList.Add(positionData);
                    }
                }
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return positionDataList;
        }

        #endregion

        #region Fleet Page Methods

        public EngineData GetEngineTotalAndEstConsumptionByFleet(int fleetId, double timezone, string engineType)
        {
            EngineData engineData = new EngineData();
            try
            {
                BLL_Enum._ENGINE engineEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                DateTime startDatetime = DateTimeExtension.CalculateUserTodayDateStartTime(timezone);
                DateTime endDatetime = DateTime.UtcNow;
                double totalFlow = 0;
                double totalHour = 0;
                double estCons = 0;
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselList)
                {
                    totalFlow += EngineReading.GetTotalFlowByEngineCode(vessel.VesselId, engineEnum, startDatetime, endDatetime);
                    totalHour += (endDatetime - startDatetime).TotalHours; // Get the difference in hours
                    estCons += Convert.ToDouble(totalFlow) / totalHour;
                }
                engineData.TotalCons = totalFlow.ToString();
                engineData.EstCons = estCons.ToString();
                engineData.UserStartDatetime = DateTimeExtension.DisplayDateAddTimezoneWithUTC(startDatetime, timezone);

            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return engineData;
        }

        public List<ResultData> GetAllEngineTypesByFleet(int fleetId)
        {
            List<ResultData> resultDataList = new List<ResultData>();
            try
            {
                HashSet<short> engineCodeHS = new HashSet<short>();
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselList)
                {
                    List<Engine> engineList = Engine.GetAll(vessel.VesselId);
                    foreach (Engine engine in engineList)
                    {
                        short engineCode = engine.EngineCode.GetValueOrDefault();
                        if (engineCode == 3)
                        {
                            engineCode = 2;
                        }
                        engineCodeHS.Add(engineCode);
                    }
                }
                
                foreach (short engineCode in engineCodeHS)
                {
                    ResultData result = new ResultData();
                    string engineType = SystemCode.GetBySysCodeTypeIdSysCodeId(Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ENGINE), engineCode.ToString()).SysCodeDesc;
                    if (engineCode != 2)
                    {
                        result.Key = engineCode.ToString();
                        result.Result = engineType;
                    }
                    else
                    {
                        result.Key = engineCode.ToString();
                        result.Result = "Thursters";
                    }
                    resultDataList.Add(result);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return resultDataList;
        }

        public BunkerData GetBunkeringByFleet(int fleetId, double timezone)
        {
            BunkerData bunker = new BunkerData();
            try
            {
                DateTime startTime = DateTimeExtension.CalculateUserTodayDateStartTime(timezone);
                DateTime endTime = DateTime.UtcNow;
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                double totalBunkerIn = 0;
                double totalBunkerOut = 0;

                foreach(Vessel vessel in vesselList)
                {
                    totalBunkerIn += EventBunkering.GetTotalFlowByBunkeringCode(vessel.VesselId, BLL_Enum._BUNKERING.Bunker_In, startTime, endTime);
                    totalBunkerOut += EventBunkering.GetTotalFlowByBunkeringCode(vessel.VesselId, BLL_Enum._BUNKERING.Bunker_Out_cons_machine, startTime, endTime);
                    totalBunkerOut += EventBunkering.GetTotalFlowByBunkeringCode(vessel.VesselId, BLL_Enum._BUNKERING.Bunker_Out_day_tank, startTime, endTime);
                    totalBunkerOut += EventBunkering.GetTotalFlowByBunkeringCode(vessel.VesselId, BLL_Enum._BUNKERING.Bunker_Out_other_vessel, startTime, endTime);
                }

                bunker.BunkerIn = totalBunkerIn.ToString();
                bunker.BunkerOut = totalBunkerOut.ToString();
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return bunker;
        }

        public List<EventData> GetLatestEventListByFleet(int fleetId, double timezone)
        {
            List<EventData> eventDataList = new List<EventData>();

            try
            {
                DateTime datetimeStart = DateTime.UtcNow.AddDays(-14);
                DateTime dateTimeEnd = DateTime.UtcNow;

                DataTable eventListDataTable = new DataTable();
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselList)
                {
                    List<EventList> eventList = EventList.GetAll(vessel.VesselId, datetimeStart, dateTimeEnd, BLL_Enum._EVENT_TYPE.All);
                    foreach (EventList eventItem in eventList)
                    {
                        DateTime eventDateTime = Convert.ToDateTime(eventItem.EventDateTime).AddHours(timezone);

                        EventData eventData = new EventData();
                        eventData.Datetime = DateTimeExtension.DisplayDateWithoutYear(eventDateTime);
                        eventData.EventType = eventItem.EventTypeDesc;
                        eventData.EventDesc = eventItem.EventDescription;
                        eventData.VesselName = vessel.VesselName;

                        eventDataList.Add(eventData);
                    }
                }
               
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            List<EventData> sortedList = eventDataList.OrderByDescending(x => DateTime.ParseExact(x.Datetime, "dd-MMM HH:mm",CultureInfo.InvariantCulture)).ToList();
            return sortedList;
        }

        public List<ResultData> GetDistanceAndAvgConsAndReportingVessels(int fleetId, double timezone)
        {
            List<ResultData> resultData = new List<ResultData>();
            try
            {
                DateTime startDatetime = DateTimeExtension.CalculateUserTodayDateStartTime(timezone);
                DateTime endDatetime = DateTime.UtcNow;

                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                double distance = 0;
                double avgCons = 0;
                double reportingVessels = 0;
                double nonReportingVessels = 0;
                double totalFlow = 0;
                foreach(Vessel vessel in vesselList)
                {
                    distance += Position.GetTotalDistance(vessel.VesselId, startDatetime, endDatetime);
                    List<SystemCode> engineCodeList = SystemCode.GetSysCodeList(BLL_Enum._SYS_CODE_TYPE.ENGINE);
                    foreach (SystemCode systemCode in engineCodeList)
                    {
                        BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), systemCode.SysCodeId);
                        if (engineCodeEnum != BLL_Enum._ENGINE.Bunker)
                        {
                            totalFlow += EngineReading.GetTotalFlowByEngineCode(vessel.VesselId, engineCodeEnum, startDatetime, endDatetime);
                        }
                    }
                    Position latestPosition = Position.GetLatest(vessel.VesselId);
                    DateTime today = DateTime.UtcNow;
                    TimeSpan time = today.Subtract(latestPosition.PositionDatetime);
                    // If the difference is more than or equal to 2 hours
                    if(time.TotalHours >= 2)
                    {
                        // Vessel is non-reporting
                        nonReportingVessels++;
                    }
                    else
                    {
                        // Vessel is reporting
                        reportingVessels++;
                    }
                }

                if(distance == 0)
                {
                    distance = 1;
                }

                avgCons = totalFlow / distance;

                ResultData result = new ResultData();
                result.Result = distance.ToString();
                result.Key = "totalDistance";
                ResultData resultAvgCons = new ResultData();
                resultAvgCons.Result = avgCons.ToString();
                resultAvgCons.Key = "avgCons";
                ResultData resultReporting = new ResultData();
                resultReporting.Result = reportingVessels.ToString();
                resultReporting.Key = "activeVessel";
                ResultData resultNonReporting = new ResultData();
                resultNonReporting.Result = nonReportingVessels.ToString();
                resultNonReporting.Key = "notActiveVessel";

                resultData.Add(result);
                resultData.Add(resultAvgCons);
                resultData.Add(resultReporting);
                resultData.Add(resultNonReporting);
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return resultData;
        }

        public List<PositionData> GetFleetCurrentPosition(int fleetId)
        {
            List<PositionData> positionDataList = new List<PositionData>();
            try
            {
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselList)
                {
                    PositionData positionData = new PositionData();
                    Position latestPosition = Position.GetLatest(vessel.VesselId);
                    positionData.Latitude = latestPosition.Latitude;
                    positionData.Longitude = latestPosition.Longitude;
                    positionData.VesselName = vessel.VesselName;
                    positionDataList.Add(positionData);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return positionDataList;
        }


        #endregion

        #region Fuel Cons Methods

        public List<EngineData> GetCurrentEngineData(int vesselId)
        {
            List<EngineData> engineDataList = new List<EngineData>();
            try
            {
                List<Engine> engineList = Engine.GetAll(vesselId);
                foreach(Engine engine in engineList)
                {
                    EngineData engineData = new EngineData();
                    engineData.EstCons = engine.LastEstFlowRate.ToString();
                    engineData.RunningMins = engine.AccumlatedRunningMins.ToString();
                    engineData.EngineName = engine.ShortDescription;
                    engineData.EngineId = engine.EngineId.ToString();
                    engineDataList.Add(engineData);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return engineDataList;
        }

        public List<AnalogData> GetCurrentAnalogData(int vesselId)
        {
            List<AnalogData> analogDataList = new List<AnalogData>();
            try
            {
                List<Analog> analogList = Analog.GetAll(vesselId);
                foreach(Analog analog in analogList)
                {
                    AnalogData analogData = new AnalogData();
                    analogData.AnalogName = KeyValueExtension.GetAnalogDesc(analog.AnalogCode);
                    analogData.AnalogValue = analog.LatestReading.ToString();
                    analogData.AnalogUnit = KeyValueExtension.GetAnalogUnit(analog.AnalogUnitCode);
                    analogData.RefEngineId = analog.RefEngineId.ToString();
                    analogDataList.Add(analogData);
                }
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            return analogDataList;
        }

        #endregion

        #region Chart Related Methods

        public Stream GetDailyEngineChartByEngineType(int vesselId, double timezone, string engineType)
        {
            string returnString = string.Empty;
            
            try
            {
                
                string engineUnit = string.Empty;
                int numOfPoint = 10; // Default to 10 for daily
                int seconds = 86400; // 24 hours - Daily

                BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);

                DateTime endTime = DateTimeExtension.CalculateEndDatetime(seconds, timezone, BLL_Enum._VIEW_INTERVAL.Daily);
                DateTime startTime = DateTimeExtension.CalculateStartDatetime(endTime, BLL_Enum._VIEW_INTERVAL.Daily, seconds, numOfPoint);
                // Query Interval - xx:xx:01 to xx:xx:00
                DataSet engineDS = EngineReading.GetView(vesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                engineDS = EngineExtension.AddEngineChartDataToDataSet(engineDS, timezone, BLL_Enum._VIEW_INTERVAL.Daily);

                if (engineType.Equals("2"))
                {
                    // Calculate the dataset for another thruster engine
                    engineType = "3";
                    engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                    // Query Interval - xx:xx:01 to xx:xx:00
                    DataSet secondEngineDS = EngineReading.GetView(vesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                    secondEngineDS = EngineExtension.AddEngineChartDataToDataSet(secondEngineDS, timezone, BLL_Enum._VIEW_INTERVAL.Daily);

                    foreach (DataTable engineTable in secondEngineDS.Tables)
                    {
                        // Combine all the datatables into first dataset
                        DataTable copyTable = engineTable.Copy();
                        engineDS.Tables.Add(copyTable);
                    }
                }

                returnString = JsonConvert.SerializeObject(engineDS);
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            WebOperationContext.Current.OutgoingResponse.ContentType = "application/json; charset=utf-8";
            return new MemoryStream(Encoding.UTF8.GetBytes(returnString));

        }

        public Stream GetEngineLiveChartPoint(int vesselId, double timezone, string timeOfLastPoint, string engineType)
        {
            string returnString = string.Empty;
            try
            {
                DateTime startTime = DateTimeExtension.UnixTimeToDateTime(Convert.ToDouble(timeOfLastPoint));
                startTime = startTime.AddHours(timezone * -1); // Convert to UTC - 0

                BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                int numOfPoints = 10; // Default value 

                DataSet engineDS = EngineReading.GetView(vesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Live, numOfPoints, startTime, false);
                engineDS = EngineExtension.AddEngineChartDataToDataSet(engineDS, timezone);

                returnString = JsonConvert.SerializeObject(engineDS);
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            WebOperationContext.Current.OutgoingResponse.ContentType = "application/json; charset=utf-8";
            return new MemoryStream(Encoding.UTF8.GetBytes(returnString));
            
        }

        public Stream GetIndividualVesselEngineChartByFleet(int fleetId, double  timezone, string engineType)
        {
            string returnString = string.Empty;
            try
            {
                string engineUnit = string.Empty;
                int numOfPoint = 10; // Default to 10 for daily
                int seconds = 86400; // 24 hours - Daily
                DataSet resultSet = new DataSet();

                BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);

                DateTime endTime = DateTimeExtension.CalculateEndDatetime(seconds, timezone, BLL_Enum._VIEW_INTERVAL.Daily);
                DateTime startTime = DateTimeExtension.CalculateStartDatetime(endTime, BLL_Enum._VIEW_INTERVAL.Daily, seconds, numOfPoint);
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach(Vessel vessel in vesselList)
                {
                    // Query Interval - xx:xx:01 to xx:xx:00
                    DataSet engineDS = EngineReading.GetView(vessel.VesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                    resultSet = EngineExtension.CombineEngineChartDatatoSeparateVessels(engineDS, resultSet, timezone, vessel);

                    if (engineType.Equals("2"))
                    {
                        // Calculate the dataset for another thruster engine
                        engineType = "3";
                        engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                        // Query Interval - xx:xx:01 to xx:xx:00
                        DataSet secondEngineDS = EngineReading.GetView(vessel.VesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                        resultSet = EngineExtension.CombineEngineChartDatatoSeparateVessels(engineDS, resultSet, timezone, vessel);
                    }
                }
                returnString = JsonConvert.SerializeObject(resultSet);
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            WebOperationContext.Current.OutgoingResponse.ContentType = "application/json; charset=utf-8";
            return new MemoryStream(Encoding.UTF8.GetBytes(returnString));

        }

        public Stream GetTotalEngineChartByFleet(int fleetId, double timezone, string engineType)
        {
            string returnString = string.Empty;
            try
            {

                string engineUnit = string.Empty;
                int numOfPoint = 10; // Default to 10 for daily
                int seconds = 86400; // 24 hours - Daily
                DataSet resultSet = new DataSet();

                BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);

                DateTime endTime = DateTimeExtension.CalculateEndDatetime(seconds, timezone, BLL_Enum._VIEW_INTERVAL.Daily);
                DateTime startTime = DateTimeExtension.CalculateStartDatetime(endTime, BLL_Enum._VIEW_INTERVAL.Daily, seconds, numOfPoint);
                List<Vessel> vesselList = Vessel.GetByFleetId(fleetId);
                foreach (Vessel vessel in vesselList)
                {
                    // Query Interval - xx:xx:01 to xx:xx:00
                    DataSet engineDS = EngineReading.GetView(vessel.VesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                    resultSet = EngineExtension.CombineEngineChartDataToTotal(engineDS, resultSet, timezone, vessel,fleetId);

                    if (engineType.Equals("2"))
                    {
                        // Calculate the dataset for another thruster engine
                        engineType = "3";
                        engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                        // Query Interval - xx:xx:01 to xx:xx:00
                        DataSet secondEngineDS = EngineReading.GetView(vessel.VesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Daily, numOfPoint, startTime, false);
                        resultSet = EngineExtension.CombineEngineChartDataToTotal(engineDS, resultSet, timezone, vessel, fleetId);
                    }
                }
                returnString = JsonConvert.SerializeObject(resultSet);
            }
            catch(Exception ex)
            {
                log.write(ex.ToString());
            }

            WebOperationContext.Current.OutgoingResponse.ContentType = "application/json; charset=utf-8";
            return new MemoryStream(Encoding.UTF8.GetBytes(returnString));
        }

        #endregion

    }
}
