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
        public static DataSet AddEngineChartDataToDataSet(DataSet dsData, double timezone)
        {
            foreach (DataTable engineTable in dsData.Tables)
            {
                engineTable.Columns.Add("Ticks", typeof(string));
                engineTable.Columns.Add("Unit", typeof(string));

                foreach (DataRow row in engineTable.Rows)
                {
                    DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString()).AddHours(timezone);
                    string engineUnit = "ℓ/hr";
                    string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                    row["Unit"] = engineUnit;
                    row["Ticks"] = ticksStr;
                }
            }
            return dsData;
        }

        public static DataSet AddEngineChartDataToDataSet(DataSet dsData, double timezone, BLL_Enum._VIEW_INTERVAL viewIntervalEnum)
        {
            foreach (DataTable engineTable in dsData.Tables)
            {
                engineTable.Columns.Add("Ticks", typeof(string));
                engineTable.Columns.Add("Unit", typeof(string));

                foreach (DataRow row in engineTable.Rows)
                {
                    DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString());
                    if(viewIntervalEnum != BLL_Enum._VIEW_INTERVAL.Daily)
                    {
                        datetime = datetime.AddHours(timezone);
                    }

                    string engineUnit = "ℓ/hr";
                    string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);
                    row["Unit"] = engineUnit;
                    row["Ticks"] = ticksStr;
                }
            }
            return dsData;
        }
    }
}
