using Microsoft.Azure.Management.Media;
using Microsoft.Extensions.Configuration;

using System;
using System.Linq;
using System.Globalization;

using System.Net.Http;
using System.Text;

using System.Threading.Tasks;
using Microsoft.Rest.Azure.Authentication;
using Microsoft.Azure.Management.Media.Models;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using System.Security.Claims;
using System.Collections.Generic;
using System.Security.Cryptography;

namespace ams_asset_player
{

    public class AzureMediaServicesHelper
    {
        private AzureMediaServicesClient mediaServiceClient;

        private string aadTenantId;
        private string aadClientId;
        private string aadSecret;
        private string resourceGroup;
        private string accountId;
        private string subscriptionId;
   

        public async Task InitializeAsync(IConfiguration config)
        {
            this.accountId = config["AMS:accountId"];
            this.resourceGroup = config["AMS:resourceGroup"];
            this.aadTenantId = config["AMS:aadTenantId"];
            this.aadClientId = config["AMS:aadClientId"];
            this.aadSecret = config["AMS:aadSecret"];
            this.subscriptionId = config["AMS:subscriptionId"];
            
            await CreateMediaServiceClient();            
        }

        private async Task CreateMediaServiceClient()
        {
            var clientCredential = new ClientCredential(aadClientId, aadSecret);

            var token = await ApplicationTokenProvider.LoginSilentAsync(
                aadTenantId,
                clientCredential,
                ActiveDirectoryServiceSettings.Azure);

            mediaServiceClient = new AzureMediaServicesClient(token)
            {
                SubscriptionId = subscriptionId
            };
        }

        private async Task<StreamingLocator> CreateStreamingLocatorAsync(string locatorName, string assetName)
        {
            return await mediaServiceClient.StreamingLocators.CreateAsync(
                resourceGroup,
                accountId,
                locatorName,
                new StreamingLocator
                { AssetName = assetName, StreamingPolicyName = "Predefined_DownloadAndClearStreaming" });
        }


        private async Task<StreamingEndpoint> GetDefaultStreamingEndpointAsync()
        {
            var streamingEndpoints = await mediaServiceClient.StreamingEndpoints.ListAsync(
                resourceGroup,
                accountId);

            var streamingEndpoint = streamingEndpoints.Single(se => se.Name == "default");
            if (streamingEndpoint.ResourceState != StreamingEndpointResourceState.Running)
                await mediaServiceClient.StreamingEndpoints.StartAsync(
                    resourceGroup,
                    accountId,
                    streamingEndpoint.Name);

            return streamingEndpoint;
        }

        public async Task<string> GetStreamingUrlAsync(string assetName)
        {
            string streamingUrl = null;
            try
            {
                StreamingLocator sl = GetStreamingLocator(assetName);
                if (sl == null)
                {
                    DateTime sTime = new DateTime(1970, 1, 1,0,0,0,DateTimeKind.Utc);        
                    long epoch = (long)(DateTime.Now - sTime).TotalSeconds;          
                    string locatorName = "locator_" + epoch.ToString();

                    sl = await CreateStreamingLocatorAsync(locatorName, assetName);
                }
                
                StreamingEndpoint sep = await GetDefaultStreamingEndpointAsync();
                streamingUrl = "https://" + sep.HostName + "/" + sl.StreamingLocatorId + "/content.ism/manifest";
            }
            catch(Exception)
            {

            }

            return streamingUrl;
        }

        public async Task<string> GetAvailableMediaTimeRanges(string assetName, string precision, string startTime, string endTime)
        {
            string availableMediaTimeRanges = null;

            try
            {
                StreamingLocator sl = GetStreamingLocator(assetName);
                StreamingEndpoint sep = await GetDefaultStreamingEndpointAsync();

                string availableMediaTimeRangesUrl = "https://" + sep.HostName + "/" + sl.StreamingLocatorId + "/content.ism/availableMedia?precision=" + precision +
                                                        "&startTime=" + startTime + "&endTime=" + endTime;

                availableMediaTimeRanges = await DownloadFromUrlAsync(availableMediaTimeRangesUrl);                
            }
            catch(Exception)
            {

            }

            return availableMediaTimeRanges;
        }

        static async Task<string> DownloadFromUrlAsync(string url)   
        {
            string fileText = null;
            using (var httpClient = new HttpClient())
            {
                // Download the file
                using (var result = await httpClient.GetAsync(url))
                {
                    if (result.IsSuccessStatusCode)
                    {
                        byte[] bytesArray = await result.Content.ReadAsByteArrayAsync();
                        fileText = Encoding.UTF8.GetString(bytesArray);                        
                    }
                }
            }                

            return fileText;
        }        

        public StreamingLocator GetStreamingLocator(string assetName)
        {
            StreamingLocator sl = null;
            
            try
            {
                ListStreamingLocatorsResponse lsr = mediaServiceClient.Assets.ListStreamingLocators(resourceGroup, accountId, assetName);
                if (lsr != null)
                {
                    if (lsr.StreamingLocators != null)
                    {
                        if (lsr.StreamingLocators.Count > 0)
                        {
                            sl = mediaServiceClient.StreamingLocators.Get(resourceGroup, accountId, lsr.StreamingLocators[0].Name);
                        }
                    }
                }
            }
            catch (Exception)
            {
                Console.WriteLine("error in getstreaminglocator");                
            }

            return sl;
        }


        public static string GetAvailableMediaTime(string availableMediaTimeRanges, string precision)
        {
            string availableMediaTime = "";

            try
            {
                JArray objTime = new JArray();

                dynamic availableMediaJsonObject = JsonConvert.DeserializeObject(availableMediaTimeRanges);
                foreach (dynamic timeRange in availableMediaJsonObject.timeRanges)
                {
                    string startTime = timeRange.start;
                    string endTime = timeRange.end;

                    DateTime dtStart = DateTime.Now;
                    DateTime dtEnd = DateTime.Now;

                    switch(precision)
                    {
                        case "year":
                                    DateTime.TryParseExact(startTime, "yyyy", null, DateTimeStyles.None, out dtStart);
                                    DateTime.TryParseExact(endTime, "yyyy", null, DateTimeStyles.None, out dtEnd);                                    
                                    break;

                        case "month":
                                    DateTime.TryParseExact(startTime, "yyyy-MM", null, DateTimeStyles.None, out dtStart);
                                    DateTime.TryParseExact(endTime, "yyyy-MM", null, DateTimeStyles.None, out dtEnd);
                                    break;

                        case "day":
                                    DateTime.TryParseExact(startTime, "yyyy-MM-dd", null, DateTimeStyles.None, out dtStart);
                                    DateTime.TryParseExact(endTime, "yyyy-MM-dd", null, DateTimeStyles.None, out dtEnd);
                                    break;

                        case "full" :
                                    dtStart = DateTime.Parse(startTime);
                                    dtEnd = DateTime.Parse(endTime);
                                    break;
                    }                    

                    while (true)
                    {
                        dynamic tObj = new JObject();                        

                        switch(precision)
                        {
                            case "year":
                                tObj.id = dtStart.ToString("yyyy");
                                tObj.value = tObj.id;
                                dtStart = dtStart.AddYears(1);
                                break;

                            case "month":
                                tObj.id = dtStart.ToString("yyyy-MM");
                                tObj.value = dtStart.ToString("MMM");
                                dtStart = dtStart.AddMonths(1);
                                break;

                            case "day" :
                                tObj.id = dtStart.ToString("yyyy-MM-dd");
                                tObj.value = dtStart.ToString("dd");
                                dtStart = dtStart.AddDays(1);
                                break;

                            case "full" :
                                tObj.id = dtStart.ToString("yyyy-MM-dd-HH-mm-ss");
                                tObj.value = dtStart.ToString("HH:mm:ss") + " to " + dtEnd.ToString("HH:mm:ss");
                                dtStart = dtEnd.AddSeconds(1);
                                break;
                        }

                        objTime.Add(tObj);

                        if (dtStart > dtEnd)
                        {
                            break;
                        }
                    }                    
                }    
                availableMediaTime = JsonConvert.SerializeObject(objTime);            
            }
            catch(Exception)
            {
            }

            return availableMediaTime;
        }

    }
}
