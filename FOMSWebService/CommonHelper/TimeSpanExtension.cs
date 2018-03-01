using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class TimeSpanExtension
    {
        public static string DisplayDuration(TimeSpan durationTimeSpan)
        {
            string resultDuration = string.Empty;
            if(durationTimeSpan.TotalMinutes == 0)
            {
                resultDuration = "-";
            }
            else
            {
                if (durationTimeSpan.Days == 0)
                {
                    if (durationTimeSpan.Hours == 0)
                    {
                        resultDuration = durationTimeSpan.ToString("mm") + " Mins";
                    }
                    else
                    {
                        resultDuration = durationTimeSpan.ToString("hh") + " Hr " + durationTimeSpan.ToString("mm") + " Mins";
                    }
                }
                else
                {
                    resultDuration = durationTimeSpan.ToString("dd") + " Days " + durationTimeSpan.ToString("hh") + " Hr " + durationTimeSpan.ToString("mm") + " Mins ";
                }
            }

            return resultDuration;
        }
    }
}
