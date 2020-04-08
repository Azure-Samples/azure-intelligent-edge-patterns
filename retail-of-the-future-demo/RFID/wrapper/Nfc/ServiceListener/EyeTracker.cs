using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Windows.System.Threading;

namespace ServiceListener
{
    public enum EyeDirection : int
    {
        None = 0,
        Blink,
        Left,
        Center,
        Right
    }

    class Gaze
    {
        public string gaze { get; set; }

        public EyeDirection ToEyeDirection()
        {
            string dir = gaze[0].ToString().ToUpper() + gaze.Substring(1);
            return (EyeDirection)Enum.Parse(typeof(EyeDirection), dir);
        }
    }

    public class EyeTracker : ServicePointBase
    {
        // This signals to the base class to leave the thread timer alone
        protected override int MinListenSec => 0;

        // Interval over which eye directions are averaged
        const float DetectionPeriodMs = 400f;

        // How often to "pulse" detection
        const int SkipFrames = 5;

        public delegate void EyeDirectionDelegate(EyeDirectionDelegate eyeDirection);
        public event EyeDirectionDelegate EyeDirectionEvent;

        // We aren't pulsing the timer here, so the second parameter is a dummy
        public EyeTracker(string url) : base(url, 0)
        {
        }

        public async Task<EyeDirection> RequestEyesDirection(byte[] frame)
        {
            try
            {
                ByteArrayContent frameContent = new ByteArrayContent(frame);
                var response = await client.PostAsync("track", frameContent);
                var responseText = await response.Content.ReadAsStringAsync();
                var gaze = JsonConvert.DeserializeObject<Gaze>(responseText);
                return gaze.ToEyeDirection();

            }
            catch (Exception e)
            {
                LogMessage($"Eye Tracking: {e.Message}");
                return EyeDirection.None;
            }
        }

        public override void BackgoundListen(ThreadPoolTimer timer)
        {
            throw new NotImplementedException("Eye tracker does not have a timer");
        }


    }
}
