using BLL.FMCC.BLL;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class AnalogExtension
    {
        public static DataSet AddChartWithTicksAndUnit(DataSet analogDS, double timezone, Analog analog)
        {
            foreach (DataTable analogTable in analogDS.Tables)
            {
                analogTable.Columns.Add("Ticks", typeof(string));
                analogTable.Columns.Add("Unit", typeof(string));

                foreach (DataRow row in analogTable.Rows)
                {
                    DateTime datetime = DateTime.Parse(row["READING_DATETIME"].ToString()).AddHours(timezone);
                    string analogUnit = KeyValueExtension.GetAnalogUnit(analog.AnalogUnitCode);
                    string ticksStr = Convert.ToString(DateTimeExtension.ToUnixTime(datetime) * 1000);

                    row["Unit"] = analogUnit;
                    row["Ticks"] = ticksStr;
                }
            }
            return analogDS;
        }
    }
}
