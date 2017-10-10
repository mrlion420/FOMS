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
using System.Text;

namespace FOMSWebService
{
   
    public class FOMSWebService : IWebService
    {
        // Logger Initialization 
        Logger log = new Logger(System.Web.Hosting.HostingEnvironment.ApplicationPhysicalPath + @"\log.txt");

        #region Main page methods

        public List<EventData> GetRecentEventList(int vesselId, double timezone)
        {
            List<EventData> eventDataList = new List<EventData>();

            try
            {
                //double timezone = getUserTimezone();
                DateTime dateTimeStart = DateTime.Parse("01-Jan-2011");
                DateTime dateTimeEnd = DateTime.UtcNow;

                DataTable eventListDataTable = new DataTable();
                List<EventList> eventList = EventList.GetAll(vesselId, dateTimeStart, dateTimeEnd, BLL_Enum._EVENT_TYPE.All);
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
                totalFlow += EngineReading.GetTotalFlowByEngineCode(vesselId, BLL_Enum._ENGINE.All, startDatetime, endDatetime);
                totalFlow -= EngineReading.GetTotalFlowByEngineCode(vesselId, BLL_Enum._ENGINE.Bunker, startDatetime, endDatetime);
                

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

                string latitude = positionItem.Latitude.ToString();
                string wgs84Latitude = positionItem.Wgs84Latitude;

                string longitude = positionItem.Longitude.ToString();
                string wgs84Longitude = positionItem.Wgs84Longitude;

                positionData.Latitude = latitude;
                positionData.Longitude = longitude;
                positionData.Wgs84Lat = wgs84Latitude;
                positionData.Wgs84Lon = wgs84Longitude;
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

        /* TO CHECK with alex */
        public List<PositionData> GenerateMapFromQueryTime(int vesselId, string queryTime)
        {
            List<PositionData> positionDataList = new List<PositionData>();
            try
            {
                double querytimeDouble = Convert.ToDouble(queryTime);
                decimal latitude = 0;
                decimal longitude = 0;
                // Minus the requested querytime 
                DateTime startTime = DateTime.UtcNow.AddHours(-querytimeDouble);
                DateTime today = DateTime.UtcNow;
                //PositionList positionList = Position.GetByQueryPeriod(startTime, today, BLL_Enum._SORT_ORDER.ASC);
                PositionList positionList = PositionList.GetByVesselIdPositionDatetime(vesselId, startTime);

                foreach (Position position in positionList)
                {
                    PositionData positionData = new PositionData();
                    latitude = position.Latitude;
                    longitude = position.Longitude;
                    positionData.Latitude = latitude.ToString();
                    positionData.Longitude = longitude.ToString();
                    positionDataList.Add(positionData);
                }
            }
            catch (Exception ex)
            {
                log.write(ex.ToString());
            }

            return positionDataList;
        }

        #endregion

        #region Chart Related Methods

        public Message GetEngineChartByEngineType(int vesselId, double timezone, string engineType)
        {
            string returnString = string.Empty;
            try
            {
                
                string engineUnit = string.Empty;
                int numOfPoint = 30;

                BLL_Enum._ENGINE engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);

                DateTime endTime = DateTime.UtcNow;
                DateTime startTime = DateTime.UtcNow.AddSeconds(-30 * (numOfPoint - 2));
                // Query Interval - xx:xx:01 to xx:xx:00
                DataSet engineDS = EngineReading.GetView(vesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Live, numOfPoint, startTime, false);
                engineDS = EngineExtension.AddEngineChartDataToDataSet(engineDS, timezone);

                if (engineType.Equals("2"))
                {
                    // Calculate the dataset for another thruster engine
                    engineType = "3";
                    engineCodeEnum = (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
                    // Query Interval - xx:xx:01 to xx:xx:00
                    DataSet secondEngineDS = EngineReading.GetView(vesselId, engineCodeEnum, BLL_Enum._VIEW_INTERVAL.Live, numOfPoint, startTime, false);
                    secondEngineDS = EngineExtension.AddEngineChartDataToDataSet(secondEngineDS, timezone);

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
            return WebOperationContext.Current.CreateTextResponse(returnString, "application/json;charset=utf-8", System.Text.Encoding.UTF8);

        }

        public Message GetEngineLiveChartPoint(int vesselId, double timezone, string timeOfLastPoint, string engineType)
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
            return WebOperationContext.Current.CreateTextResponse(returnString, "application/json;charset=utf-8", System.Text.Encoding.UTF8);
        }

        #endregion
    }
}
