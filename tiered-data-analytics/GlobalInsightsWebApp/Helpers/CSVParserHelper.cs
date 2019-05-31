using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GlobalInsightsWebApp.Models;

namespace GlobalInsightsWebApp.Models
{
    public static class CSVParserHelper
    {
        public static List<FilteredData> GenerateFilteredDataFromCsv(string csvData)
        {
            string[] csvRecords = csvData.Split(new string[] { "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
            List<FilteredData> filteredRecords = new List<FilteredData>();

            for (int i = 0; i < csvRecords.Length; i++)
            {
                var unfilteredData = new FilteredData();
                string[] rowData = csvRecords[i].Split(',');

                unfilteredData.Temperature = double.Parse(rowData[0]);
                unfilteredData.Humidity = double.Parse(rowData[1]);
                unfilteredData.Pressure = double.Parse(rowData[2]);
                unfilteredData.SiteID = rowData[3];
                unfilteredData.IsAnomaly = bool.Parse(rowData[4]);

                filteredRecords.Add(unfilteredData);
            }

            return filteredRecords;
        }
    }
}
