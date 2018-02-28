using BLL.FMCC.BLL;
using Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class EngineExtension
    {
        public static DataSet AddChartWithTicksAndUnit(DataSet dsData, double timezone, string unit)
        {
            foreach (DataTable engineTable in dsData.Tables)
            {
                engineTable.Columns.Add("Ticks", typeof(string));
                engineTable.Columns.Add("Unit", typeof(string));

                foreach (DataRow row in engineTable.Rows)
                {
                    DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString()).AddHours(timezone);
                    string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                    row["Unit"] = unit;
                    row["Ticks"] = ticksStr;
                }
            }
            return dsData;
        }

        public static DataSet AddChartWithTicksAndUnit(DataSet dsData, double timezone, BLL_Enum._VIEW_INTERVAL viewIntervalEnum)
        {
            foreach (DataTable engineTable in dsData.Tables)
            {
                engineTable.Columns.Add("Ticks", typeof(string));
                engineTable.Columns.Add("Unit", typeof(string));
                int vesselId = Convert.ToInt32(engineTable.Rows[0]["VESSEL_ID"]);
                Vessel singleVessel = Vessel.GetByVesselId(vesselId);
                int measurementUnitId = singleVessel.MeasurementUnitId;
                string engineUnit = KeyValueExtension.GetEngineUnitFromMeasurementUnit(measurementUnitId);

                foreach (DataRow row in engineTable.Rows)
                {
                    DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString());
                    
                    datetime = datetime.AddHours(timezone);

                    string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                    row["Unit"] = engineUnit;
                    row["Ticks"] = ticksStr;
                }
            }
            return dsData;
        }

        public static DataSet CombineEngineChartDatatoSeparateVessels(DataSet dsData, DataSet resultDS, double timezone, Vessel vessel)
        {
            int tableCount = 0;
            
            foreach(DataTable table in dsData.Tables)
            {
                if(tableCount != 0)
                {
                    int rowCount = 0;
                    foreach(DataRow row in table.Rows)
                    {
                        // Get the first table
                        DataTable firstTable = dsData.Tables[0];
                        double estFlowRate = Convert.ToDouble(firstTable.Rows[rowCount]["EST_FLOW_RATE"]);
                        estFlowRate += Convert.ToDouble(row["EST_FLOW_RATE"]);

                        DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString());
                        string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                        string engineUnit = "ℓ/hr";

                        firstTable.Rows[rowCount]["Unit"] = engineUnit;
                        firstTable.Rows[rowCount]["Ticks"] = ticksStr;
                        // Re-assign the first table the new added value
                        firstTable.Rows[rowCount]["EST_FLOW_RATE"] = estFlowRate;
                        rowCount++;
                    }
                }
                else
                {
                    table.Columns.Add("Ticks", typeof(string));
                    table.Columns.Add("Unit", typeof(string));
                    tableCount++;
                }
            }

            // If the vessel name already exists in dataset, combine the value inside
            if (resultDS.Tables.Contains(vessel.VesselName))
            {
                foreach(DataTable table in resultDS.Tables)
                {
                    if (table.TableName.Equals(vessel.VesselName))
                    {
                        int rowCount = 0;
                        foreach (DataRow row in table.Rows)
                        {
                            // Get the first table
                            DataTable firstTable = dsData.Tables[0];
                            double estFlowRate = Convert.ToDouble(firstTable.Rows[rowCount]["EST_FLOW_RATE"]);
                            estFlowRate += Convert.ToDouble(row["EST_FLOW_RATE"]);
                            // Re-assign the result Ds table the new added value
                            row["EST_FLOW_RATE"] = estFlowRate;
                            rowCount++;
                        }
                    }
                }
            }
            else
            {
                // Finally change the first table name to its vessel name
                dsData.Tables[0].TableName = vessel.VesselName;
                DataTable resultTable = dsData.Tables[0].Copy();
                resultDS.Tables.Add(resultTable);
            }

            return resultDS;
        }

        public static DataSet CombineEngineChartDataToTotal(DataSet dsData, DataSet resultDS, double timezone, Vessel vessel, int fleetId, string engineUnit)
        {
            int tableCount = 0;
            
            foreach (DataTable table in dsData.Tables)
            {
                if (tableCount != 0)
                {
                    int rowCount = 0;
                    foreach (DataRow row in table.Rows)
                    {
                        // Get the first table
                        DataTable firstTable = dsData.Tables[0];
                        double calculatedEstFlowRate = Convert.ToDouble(firstTable.Rows[rowCount]["Result"]);

                        calculatedEstFlowRate += Convert.ToDouble(row["CALCULATED_TOTAL_FLOW"]);
                        DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString()).AddHours(timezone);
                        string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                        
                        // Combine the second and later tables' data to first table
                        firstTable.Rows[rowCount]["Unit"] = engineUnit;
                        firstTable.Rows[rowCount]["Ticks"] = ticksStr;
                        // Re-assign the first table the new added value
                        firstTable.Rows[rowCount]["Result"] = calculatedEstFlowRate;
                        rowCount++;
                    }
                }
                else
                {
                    // Add two new columns to first table
                    table.Columns.Add("Ticks", typeof(string));
                    table.Columns.Add("Unit", typeof(string));
                    table.Columns.Add("Result", typeof(string));

                    foreach (DataRow row in table.Rows)
                    {
                        DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString());
                        string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                        double totalFlow = Convert.ToDouble(row["CALCULATED_TOTAL_FLOW"]);

                        row["Unit"] = engineUnit;
                        row["Ticks"] = ticksStr;
                        row["Result"] = totalFlow;
                    }

                    tableCount++;
                }
            }

            foreach (DataTable table in resultDS.Tables)
            {
                int rowCount = 0;
                if(dsData.Tables.Count != 0)
                {
                    foreach (DataRow row in table.Rows)
                    {
                        // Get the first table
                        DataTable firstTable = dsData.Tables[0];
                        double estFlowRate = Convert.ToDouble(firstTable.Rows[rowCount]["Result"]);
                        estFlowRate += Convert.ToDouble(row["Result"]);
                        // Re-assign the result Ds table the new added value
                        row["Result"] = estFlowRate;
                        rowCount++;
                    }
                }

            }

            // if the result dataset is empty, create the result table
            if (resultDS.Tables.Count < 1)
            {
                if(dsData.Tables.Count !=  0)
                {
                    // Name the result table the fleet name
                    Fleet currentFleet = Fleet.GetByFleetId(fleetId);
                    dsData.Tables[0].TableName = currentFleet.FleetName;
                    DataTable resultTable = dsData.Tables[0].Copy();
                    resultDS.Tables.Add(resultTable);
                }
                
            }

            return resultDS;
        }

    }
}
