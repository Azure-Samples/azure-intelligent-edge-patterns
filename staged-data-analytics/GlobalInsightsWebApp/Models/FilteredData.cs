using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GlobalInsightsWebApp.Models
{
    public class FilteredData
    {
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Pressure { get; set; }
        public string SiteID { get; set; }
        public bool IsAnomaly { get; set; }

        public FilteredData()
        {

        }

        public FilteredData(double temperature, double humidity, double pressure, string siteID)
        {
            Temperature = temperature;
            Humidity = humidity;
            Pressure = pressure;
            SiteID = siteID;
            IsAnomaly = false;
        }

        public override string ToString()
        {
            return Temperature + "," + Humidity + "," + Pressure + "," + SiteID + "," + IsAnomaly;
        }
    }
}
