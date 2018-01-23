using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class EnumExtension
    {
        public static BLL_Enum._ANALOG GetAnalogEnum_FromAnalogType(string analogType)
        {
            return (BLL_Enum._ANALOG)Enum.Parse(typeof(BLL_Enum._ANALOG), analogType);

        }

        public static BLL_Enum._ENGINE GetEngineEnum_FromEngineType(string engineType)
        {
            return (BLL_Enum._ENGINE)Enum.Parse(typeof(BLL_Enum._ENGINE), engineType);
        }

        public static BLL_Enum._EVENT_TYPE GetEventEnum_FromEventType(string eventType)
        {
            return (BLL_Enum._EVENT_TYPE)Enum.Parse(typeof(BLL_Enum._EVENT_TYPE), eventType);
        }
    }
}
