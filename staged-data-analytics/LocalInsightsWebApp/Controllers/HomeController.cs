using LocalInsightsWebApp.Models;
using LocalInsightsWebApp.Storage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace LocalInsightsWebApp.Controllers
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
            storageHelper = new AzureStackStorageHelper(
                _iconfiguration["AzureStackStorage:AzS_StorageEndPoint"],
                _iconfiguration["AzureStackStorage:AzS_StorageAccount"],
                _iconfiguration["AzureStackStorage:AzS_StorageKey"],
                _iconfiguration["AzureStackStorage:AzS_StorageContainerName"]);

            var stringArray = storageHelper.GetBlobNamesFromAzureStorage();
            var stringList = new List<string>();

            if (stringArray != null)
            {
                stringList = stringArray.ToList<string>();
            }

            List<UnfilteredData> unfilteredDataList = new List<UnfilteredData>();

            foreach (string blobName in stringList)
            {
                unfilteredDataList.AddRange(CSVParserHelper.GenerateUnfilteredDataFromCsv(storageHelper.DownloadBlobFromAzureStorage(blobName)));
            }

            ViewBag.TotalRecords = unfilteredDataList.Count;
            ViewBag.TotalIssues = 0;

            foreach (var data in unfilteredDataList)
            {
                if (data.IsAnomaly)
                {
                    ViewBag.TotalIssues++;
                }
            }


            return View(unfilteredDataList);
        }

        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
