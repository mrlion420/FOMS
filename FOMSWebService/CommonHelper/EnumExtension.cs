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
    }
}
