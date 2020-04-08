using NfcSupport;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Windows.System.Threading;

namespace ServiceListener
{
    public abstract class ServicePointBase
    {
        protected virtual int MinListenSec => 2;

        //well-formed URL to the endpoint
        protected string url;
        protected TimeSpan timerPeriod;
        protected HttpClient client = null;
        protected ThreadPoolTimer listenerTimer = null;

        bool timerDisabled = false;

        protected ServicePointBase(string url, int pulseSec)
        {
            this.url = url;
            timerDisabled = MinListenSec <= 0;
            if (!timerDisabled)
            {
                timerPeriod = TimeSpan.FromSeconds(Math.Max(MinListenSec, pulseSec));
            }
        }

        public virtual void StartListening()
        {
            if (client != null)
            {
                return;
            }

            client = new HttpClient { BaseAddress = new Uri(url) };
            client.DefaultRequestHeaders
              .Accept
              .Add(new MediaTypeWithQualityHeaderValue("application/json"));

            if (timerDisabled)
            {
                return;
            }

            try
            {
                listenerTimer = ThreadPoolTimer.CreatePeriodicTimer(BackgoundListen, timerPeriod);

            }
            catch (Exception e)
            {

                LogMessage($"Service Point Initialization: {e.Message}");
            }
        }

        public abstract void BackgoundListen(ThreadPoolTimer timer);

        public static void LogMessage(string message)
        {
            Debug.WriteLine(message);
        }

        public virtual void StopListening()
        {
            if (client == null) return;

            client = null;
            listenerTimer?.Cancel();
            listenerTimer = null;
        }
    }
}
