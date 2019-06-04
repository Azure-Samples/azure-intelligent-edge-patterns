using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TDADataGenerator.Model
{
    class UnfilteredData
    {
        public double Temperature { get; set; }
        public double Humidity { get; set; }
        public double Pressure { get; set; }
        public string Latitude { get; set; }
        public string Longitude { get; set; }
        public string SiteID { get; set; }
        public bool IsAnomaly { get; set; }

        public UnfilteredData(double temperature, double humidity, double pressure, string latitude, string longitude, string siteID)
        {
            Temperature = temperature;
            Humidity = humidity;
            Pressure = pressure;
            Latitude = latitude;
            Longitude = longitude;
            SiteID = siteID;
            IsAnomaly = false;
        }

        public override string ToString()
        {
            return Temperature + "," + Humidity + "," + Pressure + "," + Latitude + "," + Longitude + "," + SiteID + "," + IsAnomaly;
        }

        public string AnonymizedToString()
        {
            return Temperature + "," + Humidity + "," + Pressure + "," + SiteID + "," + IsAnomaly;
        }
    }
}
