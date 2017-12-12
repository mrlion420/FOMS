using BLL.FMCC.BLL;
using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class DateTimeExtension
    {
        public static DateTime CalculateUserTodayDateStartTime(double timezone)
        {
            DateTime today = DateTime.UtcNow.AddHours(timezone); // Add user time zone to UTC-0 Time
            DateTime startTime = new DateTime(today.Year, today.Month, today.Day, 0, 0, 0); // Get the 00:00 time of the user time
            startTime = startTime.AddHours(-timezone); // Finally subtract the user time zone to get the UTC-0 time of the start time
            return startTime;
        }

        public static string DisplayDateAddTimezoneWithUTC(DateTime date, double timezone)
        {
            string sign = "+";
            if (timezone < 0)
            {
                sign = "-";
            }

            date = date.AddHours(timezone);
            return date.ToString("dd-MMM-yyy HH:mm") + " UTC " + sign + timezone.ToString();
        }

        public static long ToUnixTime(DateTime date)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return Convert.ToInt64((date - epoch).TotalSeconds);
        }

        public static DateTime UnixTimeToDateTime(double unixTimeStamp)
        {
            // Unix timestamp is seconds past epoch
            System.DateTime dtDateTime = new DateTime(1970, 1, 1, 0, 0, 0, 0, System.DateTimeKind.Utc);
            dtDateTime = dtDateTime.AddMilliseconds(unixTimeStamp).ToLocalTime();
            return dtDateTime;
        }

        public static string DisplayDateWithoutYear(DateTime date)
        {
            return date.ToString("dd-MMM HH:mm");

        }

        public static string DisplayDateWithYear(DateTime date)
        {
            return date.ToString("dd-MMM-yyyy HH:mm");
        }

        public static string DisplayDateWithUTC(DateTime date, double timezone)
        {
            string sign = "+";
            if (timezone < 0)
            {
                sign = "-";
            }
            return date.ToString("dd-MMM-yyy HH:mm") + " UTC " + sign + timezone.ToString();
        }

        public static DateTime CalculateEndDatetime(int iSecond, double timezone, BLL_Enum._VIEW_INTERVAL viewInterval)
        {
            // ----- Date Calculation -----
            // End time needs to be added with user time zone
            // After adding time zone, the end time then needs to be adjusted one interval/point further such as three min, one hour or one day
            // After adjusting the time, minus the user timezone from the end time to get the final UTC 0 end time
            // Use the following end time to calculate the start time
            DateTime endTime = DateTime.UtcNow.AddHours(timezone);
            switch (viewInterval)
            {
                case BLL_Enum._VIEW_INTERVAL.Live:
                    endTime = DateTime.UtcNow;
                    break;
                case BLL_Enum._VIEW_INTERVAL.Hour_1:
                    endTime = endTime.AddSeconds(iSecond);
                    endTime = new DateTime(endTime.Year, endTime.Month, endTime.Day, endTime.Hour, 0, 0);
                    break;

                case BLL_Enum._VIEW_INTERVAL.Daily:
                    endTime = endTime.AddSeconds(iSecond);
                    endTime = new DateTime(endTime.Year, endTime.Month, endTime.Day, 00, 00, 00);
                    break;

                default:
                    // For Min related queries such as 1 Min, 5 mins, 15 mins
                    int intervalBase = iSecond / 60;
                    int remainder = endTime.Minute % intervalBase;
                    endTime = endTime.AddMinutes(intervalBase - remainder);
                    endTime = new DateTime(endTime.Year, endTime.Month, endTime.Day, endTime.Hour, endTime.Minute, 0);
                    break;
            }

            endTime = endTime.AddHours(-timezone);
            return endTime;
        }

        public static DateTime CalculateStartDatetime(DateTime endTime, BLL_Enum._VIEW_INTERVAL viewInterval, int iSecond, int numOfPoint)
        {
            DateTime startTime;
            if (viewInterval == BLL_Enum._VIEW_INTERVAL.Live)
            {
                startTime = DateTime.UtcNow.AddSeconds(-30 * (numOfPoint - 2));
            }
            else
            {
                startTime = endTime.AddSeconds(-iSecond * (numOfPoint)).AddSeconds(1);
            }

            return startTime;

        }

    }
}
