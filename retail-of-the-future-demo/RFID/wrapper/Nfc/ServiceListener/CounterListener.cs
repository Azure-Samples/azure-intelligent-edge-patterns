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
        const int MinCounterListenIntervalSec = 2;

        // overall count
        public delegate void ReceivedCount(int count);
        public event ReceivedCount ReceivedCountEvent;

        public delegate void IndividualCounters(Dictionary<string, int> counters);
        public event IndividualCounters IndividualCountersEvent;

        //well-formed URL to the endpoint
        string url;
        TimeSpan timerPeriod;
        HttpClient client = null;
        ThreadPoolTimer counterListenerTimer = null;

        ReceivedCount customEvent;
        IndividualCounters individualEvent;

        /// <summary>
        /// Instantiate listener
        /// </summary>
        /// <param name="url">URL to the endpoint</param>
        /// <param name="pulseSec">How often do we check the counter in sec</param>
        public CounterListener(string url, int pulseSec)
        {
            this.url = url;
            timerPeriod = TimeSpan.FromSeconds(Math.Max(MinCounterListenIntervalSec, pulseSec));
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
        public void StartListening(ReceivedCount onReceivedCount = null, IndividualCounters onIndividualCounters = null)
        {
            if (client != null)
            {
                return;
            }

            client = new HttpClient { BaseAddress = new Uri(url) };
            client.DefaultRequestHeaders
              .Accept
              .Add(new MediaTypeWithQualityHeaderValue("application/json"));

            customEvent = onReceivedCount;
            individualEvent = onIndividualCounters;

            if (onReceivedCount != null)
            {
                ReceivedCountEvent += onReceivedCount;
            }

            if (onIndividualCounters != null)
            {
                IndividualCountersEvent += onIndividualCounters;
            }

            // query the counter every pulseSec
            // and notify the listener
            try
            {
                counterListenerTimer = ThreadPoolTimer.CreatePeriodicTimer(BackgoundListen, timerPeriod);

            }
            catch (Exception e)
            {

                LogMessage($"{e.Message}");
            }
        }

        async void BackgoundListen(ThreadPoolTimer timer)
        {
            try
            {
                using (var response = await client.GetAsync("count"))
                {
                    string data = await response.Content.ReadAsStringAsync();
                    var counter = JsonConvert.DeserializeObject<Counter>(data);
                    // firing from non-UI thread
                    ReceivedCountEvent?.Invoke(counter.count);
                }

                if(individualEvent == null)
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
                LogMessage($"{e.Message}");
            }
        }

        public void StopListening()
        {
            try
            {
                if (client == null) return;

                ReceivedCountEvent -= customEvent;
                IndividualCountersEvent -= individualEvent;
                customEvent = null;
                individualEvent = null;
                client = null;
                counterListenerTimer?.Cancel();
            }
            catch (Exception e)
            {

                LogMessage($"{e.Message}");
            }
        }

    }
}
