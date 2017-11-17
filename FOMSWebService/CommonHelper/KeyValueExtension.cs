using BLL.FMCC.BLL;
using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class KeyValueExtension
    {
        public static string GetAnalogUnit(int analogUnitCode)
        {
            string analogUnit = string.Empty;
            int systemAnalogUnitCodeType = Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ANALOG_UNIT);
            analogUnit = SystemCode.GetBySysCodeTypeIdSysCodeId(systemAnalogUnitCodeType, analogUnitCode.ToString()).SysCodeShortDesc.ToUpper();
            return analogUnit;
        }

        public static string GetAnalogDesc(int analogCode)
        {
            string analogDesc = string.Empty;
            int systemAnalogCodeType = Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ANALOG);
            analogDesc = SystemCode.GetBySysCodeTypeIdSysCodeId(systemAnalogCodeType, analogCode.ToString()).SysCodeShortDesc;
            return analogDesc;
        }
    }
}
