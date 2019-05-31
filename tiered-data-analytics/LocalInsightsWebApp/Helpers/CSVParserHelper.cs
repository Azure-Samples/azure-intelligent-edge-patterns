using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LocalInsightsWebApp.Models;

namespace LocalInsightsWebApp.Models
{
    public static class CSVParserHelper
    {
        public static List<UnfilteredData> GenerateUnfilteredDataFromCsv(string csvData)
        {
            string[] csvRecords = csvData.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
            List<UnfilteredData> unfilteredRecords = new List<UnfilteredData>();

            for (int i = 0; i < csvRecords.Length; i++)
            {
                var unfilteredData = new UnfilteredData();
                string[] rowData = csvRecords[i].Split(',');

                unfilteredData.Temperature = double.Parse(rowData[0]);
                unfilteredData.Humidity = double.Parse(rowData[1]);
                unfilteredData.Pressure = double.Parse(rowData[2]);
                unfilteredData.Latitude = rowData[3];
                unfilteredData.Longitude = rowData[4];
                unfilteredData.SiteID = rowData[5];
                unfilteredData.IsAnomaly = bool.Parse(rowData[6]);

                unfilteredRecords.Add(unfilteredData);
            }

            return unfilteredRecords;
        }
    }
}
