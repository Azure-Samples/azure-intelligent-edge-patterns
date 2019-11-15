using ServiceListener;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI.Xaml.Media;

namespace IntelligentKioskSample.Models
{
    public class CountingCamera : BaseViewModel
    {
        public string DisplayName { get; set; }
        public string Id { get; set; }

        private int _reading;
        public int Reading
        {
            get { return _reading; }
            set { Set(ref _reading, value); }
        }
    }

    public class CustomerCounterVisViewModel : BaseViewModel
    {
        public ObservableCollection<CountingCamera> CountingCameras { get; }

        public static Brush ToBrush(int reading)
        {
            return reading > 0 ? Util.ToBrush("green") : Util.ToBrush("red");
        }

        public static double UnitWidth { get; set; } = 10.0;  // default width of bar representing 1 unit

        public static double ToWidthNegative(int reading)
        {
            return reading < 0 ? -reading * UnitWidth : 0.0;
        }

        public static double ToWidthPositive(int reading)
        {
            return reading > 0 ? reading * UnitWidth : 0.0;
        }

        private int _maxBarWidth = 1000;  // can accomodate up to 100 units by default w/o rescaling
        public int MaxBarWidth
        {
            get { return _maxBarWidth; }
            set { Set(ref _maxBarWidth, value); }
        }
        
        public CustomerCounterVisViewModel()
        {
            // TODO: get camera names and ids from DataServices
            CountingCameras = new ObservableCollection<CountingCamera>
            {
                new CountingCamera { DisplayName = "Entrance 1:", Id = "cam1", Reading = 0 },
                new CountingCamera { DisplayName = "Entrance 2:", Id = "cam2", Reading = 0 },
                new CountingCamera { DisplayName = "Entrance 3:", Id = "cam3", Reading = 0 }
            };
        }

        public void Update(Dictionary<string, int> counters)
        {
            // TODO: set readings visibility only upon update (avoid showing in never updated state)
            foreach (KeyValuePair<string, int> entry in counters)
            {
                foreach (var item in CountingCameras)
                {
                    if (item.Id == entry.Key)
                    {
                        item.Reading = entry.Value;
                    }
                }
            }

            RescaleToFit();
        }

        // make all displayed bars fit the alotted max bar width by scaling them down (i.e. decreasing unit width)
        public void RescaleToFit()
        {
            double reqUnitWidth = UnitWidth;
            if (MaxBarWidth > 0)
            {
                foreach (var item in CountingCameras)
                {
                    if (item.Reading != 0)
                    {
                        double reqUnitWidthItem = (double)MaxBarWidth / Math.Abs(item.Reading);
                        if (reqUnitWidthItem < reqUnitWidth)
                        {
                            reqUnitWidth = reqUnitWidthItem;
                        }
                    }
                }
            }
            else
            {
                reqUnitWidth = 10.0;  // keep default value
            }

            if (reqUnitWidth < UnitWidth)
            {
                UnitWidth = reqUnitWidth;
                foreach (var item in CountingCameras)
                {
                    // trigger update
                    int prevReading = item.Reading;
                    item.Reading = 0;
                    item.Reading = prevReading;
                }
            }
        }
    }
}
