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

        public static string GetEngineType(short? engineCode)
        {
            if (engineCode == 3)
            {
                engineCode = 2;
            }

            string engineType = SystemCode.GetBySysCodeTypeIdSysCodeId(Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ENGINE), engineCode.ToString()).SysCodeDesc;

            if (engineCode == 2)
            {
                return "Thursters";
            }
            else
            {
                return engineType;
            }
            
        }

        public static string GetEngineDescFromEngineCode(short? engineCode)
        {
            return SystemCode.GetBySysCodeTypeIdSysCodeId(Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ENGINE), engineCode.ToString()).SysCodeDesc;
        }

        public static string GetAnalogDescFromAnalogCode(short? analogCode)
        {
            return SystemCode.GetBySysCodeTypeIdSysCodeId(Convert.ToInt32(BLL_Enum._SYS_CODE_TYPE.ANALOG), analogCode.ToString()).SysCodeDesc;
        }

        public static string GetEngineUnitFromMeasurementUnit(int measurementUnit)
        {
            return SystemCode.GetBySysCodeTypeIdSysCodeId(49, measurementUnit.ToString()).SysCodeShortDesc;
        }

    }
}
