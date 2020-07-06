using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Net.Http;
using Newtonsoft.Json;
using static NfcSupport.NfcUtils;
using Windows.System.Threading;
using System.Net.Http.Headers;

namespace ServiceListener
{
    class Counter
    {
        public int count { get; set; }
    }

    class Counters
    {
        public Dictionary<string, int> counters { get; set; }
    }


    public class CounterListener : ServicePointBase
    {
        // overall count
        public delegate void ReceivedCount(int count);
        public event ReceivedCount ReceivedCountEvent;

        public delegate void IndividualCounters(Dictionary<string, int> counters);
        public event IndividualCounters IndividualCountersEvent;

        /// <summary>
        /// Instantiate listener
        /// </summary>
        /// <param name="url">URL to the endpoint</param>
        /// <param name="pulseSec">How often do we check the counter in sec</param>
        public CounterListener(string url, int pulseSec) : base(url, pulseSec)
        {
        }
        
        /// <summary>
        /// Reset the counter to 0
        /// Do not call after StopListening()
        /// </summary>
        /// <returns>
        /// True if successfully executed and counters have been reset
        /// </returns>
        public async Task<bool> ResetAsync(int count)
        {
            //TODO: not thread safe!
            if (client is null || client.BaseAddress is null)
            {
                return false;
            }

            try
            {
                using (var response = await client.GetAsync($"reset?count={count}"))
                {
                    return response.IsSuccessStatusCode;
                }
            }
            catch (Exception e)
            {

                LogMessage($"{e.Message}");
            }
            return false;
        }

        public async override void BackgoundListen(ThreadPoolTimer timer)
        {
            try
            {
                if (!(ReceivedCountEvent is null))
                {
                    using (var response = await client.GetAsync("count"))
                    {
                        string data = await response.Content.ReadAsStringAsync();
                        var counter = JsonConvert.DeserializeObject<Counter>(data);
                        // firing from non-UI thread
                        ReceivedCountEvent?.Invoke(counter.count);
                    }
                }
                
                if(IndividualCountersEvent is null)
                {
                    return;
                }

                using (var response = await client.GetAsync("counters"))
                {
                    string data = await response.Content.ReadAsStringAsync();
                    var counters = JsonConvert.DeserializeObject<Counters>(data);
                    // firing from non-UI thread
                    IndividualCountersEvent?.Invoke(counters.counters);
                }


            }
            catch (Exception e)
            {
                LogMessage($"Counter Listener: {e.Message}");
            }
        }
    }
}
