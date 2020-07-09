using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

namespace ams_asset_player.Pages
{
    public class IndexModel : PageModel
    {
          
        private readonly IConfiguration _configuration;
        private AzureMediaServicesHelper _amsHelper;

        public string playerVisibility = "none";
        public string errorMessageVisibility = "none";

        public string streamingUrl = "";
        
        [BindProperty(SupportsGet=true)]
        public string assetName {get;set;}

        [BindProperty(SupportsGet=true)]
        public string precision { get; set; }

        [BindProperty(SupportsGet=true)]
        public string startTime {get; set; }

        [BindProperty(SupportsGet=true)]
        public string endTime {get; set; }

        
        
        public IndexModel(IConfiguration configuration)
        {
            _configuration = configuration;

             _amsHelper = new AzureMediaServicesHelper();
            Task t = _amsHelper.InitializeAsync(configuration);
            t.GetAwaiter().GetResult();
        }

        public void OnGet()
        {

        }

        
        public async Task OnPostAssetAsync(string amsAssetName)
        {
            assetName = amsAssetName;
            streamingUrl = await _amsHelper.GetStreamingUrlAsync(assetName);            
            
            if (streamingUrl != null)                        
            {                
                playerVisibility = "block";
                errorMessageVisibility = "none";
            }
            else
            {
                playerVisibility = "none";
                errorMessageVisibility = "block";
            }            
        }

        public async Task<JsonResult> OnGetAvailableMedia()
        {            
            JsonResult jr = null;            

            try
            {
                DateTime dtStart = DateTime.Now;
                DateTime dtEnd = DateTime.Now;

                switch(precision)
                {
                    case "year":
                        startTime = "2019";
                        endTime = DateTime.Now.Year.ToString();
                        break;

                    case "month" :
                        int year = Convert.ToInt32(startTime);
                        dtStart = new DateTime(year, 1, 1);
                        dtEnd = new DateTime(year, 12, 1);
                        startTime = dtStart.ToString("yyyy-MM");
                        endTime = dtEnd.ToString("yyyy-MM");
                        break;

                    case "day" :
                        DateTime.TryParseExact(startTime, "yyyy-MM", null, DateTimeStyles.None, out dtStart);
                        dtEnd = dtStart.AddMonths(1).AddDays(-1);
                        startTime = dtStart.ToString("yyyy-MM-dd");
                        endTime = dtEnd.ToString("yyyy-MM-dd");
                        break;

                    case "full" :
                        DateTime.TryParseExact(startTime, "yyyy-MM-dd", null, DateTimeStyles.None, out dtStart);
                        dtEnd = dtStart.AddDays(1);
                        startTime = dtStart.ToString("yyyy-MM-dd'T'00:00:00");
                        endTime = dtStart.ToString("yyyy-MM-dd'T'23:59:59");
                        break;

                }
                string availableMediaTimeRanges = await _amsHelper.GetAvailableMediaTimeRanges(assetName, precision, startTime, endTime);
                string availableMediaTimes = AzureMediaServicesHelper.GetAvailableMediaTime(availableMediaTimeRanges, precision);

                jr = new JsonResult(availableMediaTimes);
            }
            catch(Exception)
            {

            }

            return jr;
            
        }

        public async Task<JsonResult> OnGetStreamingUrl()
        {
            JsonResult jr = null;
            try
            {
                streamingUrl = await _amsHelper.GetStreamingUrlAsync(assetName);       

                if (precision == "full")
                {
                    DateTime dtStart = DateTime.Now;
                    DateTime.TryParseExact(startTime, "yyyy-MM-dd-HH-mm-ss", null, DateTimeStyles.None, out dtStart);

                    streamingUrl += "(format=mpd-time-csf,startTime=" + dtStart.ToString("yyyy-MM-dd'T'HH:mm:ss") + ")";                    
                }
                else if (precision == "range")
                {
                    if (startTime == null)
                    {
                        streamingUrl += "(format=mpd-time-csf)";
                    }
                    else if (endTime == null)
                    {
                        streamingUrl += "(format=mpd-time-csf,startTime=" + startTime + ")";
                    }
                    else
                    {
                        streamingUrl += "(format=mpd-time-csf,startTime=" + startTime + ",endTime=" + endTime + ")";
                    }
                }

                jr = new JsonResult("{\"url\" : \"" + streamingUrl + "\"}");
            }
            catch(Exception)
            {

            }

            return jr;
        }
    }
}
