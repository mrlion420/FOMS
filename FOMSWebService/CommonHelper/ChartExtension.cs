using Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CommonHelper
{
    public class ChartExtension
    {
        public static int getNumOfPointsByInterval(BLL_Enum._VIEW_INTERVAL viewInterval)
        {
            int numOfPoints = 30; // Default
            switch (viewInterval)
            {
                case BLL_Enum._VIEW_INTERVAL.Min_15:
                    numOfPoints = 16;
                    break;

                case BLL_Enum._VIEW_INTERVAL.Hour_1:
                    numOfPoints = 24;
                    break;

                case BLL_Enum._VIEW_INTERVAL.Daily:
                    numOfPoints = 10;
                    break;
            }

            return numOfPoints;
        }

    }

       
    
}
