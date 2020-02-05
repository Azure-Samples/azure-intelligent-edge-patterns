using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Windows.System.Threading;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Diagnostics;

namespace ServiceListener
{

    public class GapListener
    {
        const int MinGapListenIntervalSec = 2;
        private TimeSpan timerPeriod;
        private string cameraId;

        HttpClient client = null;
        ThreadPoolTimer gapDetectionTimer = null;
        private GapDetection customEvent;

        public event GapDetection GapDetectionEvent;

        public GapListener(int pulseSec, string cameraId)
        {
            timerPeriod = TimeSpan.FromSeconds(Math.Max(MinGapListenIntervalSec, pulseSec));
            // preallocate to minimize thrashing
            this.cameraId = cameraId;
        }

        public void StartListening(GapDetection onGapDetection)
        {
            if (client != null)
            {
                return;
            }

            client = new HttpClient { BaseAddress = new Uri(cameraId) };
            client.DefaultRequestHeaders
              .Accept
              .Add(new MediaTypeWithQualityHeaderValue("application/json"));

            customEvent = onGapDetection;
            GapDetectionEvent += customEvent;

            // and notify the listener
            try
            {
                gapDetectionTimer = ThreadPoolTimer.CreatePeriodicTimer(BackgoundListen, timerPeriod);

            }
            catch (Exception e)
            {

                Debug.WriteLine($"{e.Message}");
            }
        }

        async void BackgoundListen(ThreadPoolTimer timer)
        {
            try
            {
                using (var response = await client.GetAsync("image/800"))
                {
                    string data = await response.Content.ReadAsStringAsync();
                    var shelfImage = JsonConvert.DeserializeObject<ModelResponse>(data);

                    byte[] img = Convert.FromBase64String(shelfImage.img);
                    var recogRects =
                        shelfImage.bboxes
                        .Select(bb => new AbsoluteBoundingRect
                        {
                            Y = bb[0],
                            X = bb[1],
                            W = bb[3] - bb[1],
                            H = bb[2] - bb[0]
                        }).ToList();

                    // firing from non-UI thread
                    GapDetectionEvent?.Invoke(img, recogRects);
                }
            }
            catch (Exception e)
            {
                Debug.WriteLine($"{e.Message}");
            }
        }

        public void StopListening()
        {
            try
            {
                if (client == null) return;

                GapDetectionEvent -= customEvent;
                customEvent = null;
                client = null;
                gapDetectionTimer?.Cancel();
            }
            catch (Exception e)
            {

                Debug.WriteLine($"{e.Message}");
            }
        }


    }
}
