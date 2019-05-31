using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using GlobalInsightsWebApp.Models;
using GlobalInsightsWebApp.Storage;
//using GlobalInsightsWebApp.Helpers;

namespace GlobalInsightsWebApp.Controllers
{
    public class HomeController : Controller
    {
        IConfiguration _iconfiguration;
        IStorageHelper storageHelper;

        public HomeController(IConfiguration iconfiguration)
        {
            _iconfiguration = iconfiguration;
        }

        public IActionResult Index()
        {
            storageHelper = new AzureStorageHelper(
                _iconfiguration["AzureStorage:AZ_StorageConnectionString"],
                _iconfiguration["AzureStorage:AZ_StorageContainerName"]);

            var blobArray = storageHelper.GetBlobNamesFromAzureStorage();
            var stringList = blobArray == null ? new List<string>() : blobArray.ToList<string>();
            List<FilteredData> filteredDataList = new List<FilteredData>();

            foreach (string blobName in stringList)
            {
                filteredDataList.AddRange(CSVParserHelper.GenerateFilteredDataFromCsv(storageHelper.DownloadBlobFromAzureStorage(blobName)));
            }

            double temperatureSum = 0;
            double humiditySum = 0;
            ViewBag.Issues = 0;
            foreach (var filteredData in filteredDataList)
            {
                temperatureSum += filteredData.Temperature;
                humiditySum += filteredData.Humidity;
                if (filteredData.IsAnomaly)
                {
                    ViewBag.Issues++;
                }
            }

            // ToDo: Calculate Average Temperature and Humidity
            ViewBag.AverageTemperature = string.Format("{0:0.000}", filteredDataList == null || filteredDataList.Count == 0 ? 0 : temperatureSum / filteredDataList.Count);
            ViewBag.AverageHumidity = string.Format("{0:0.000}", filteredDataList == null || filteredDataList.Count == 0 ? 0 : humiditySum / filteredDataList.Count);

            return View(filteredDataList);
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
