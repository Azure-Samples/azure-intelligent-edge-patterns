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
    public class CustomerCounterViewModel : BaseViewModel
    {
        private string _counterText = "";
        public string CounterText
        {
            get { return _counterText; }
            set { Set(ref _counterText, value); }
        }

        private Brush _counterColor = Util.ToBrush("black");
        public Brush CounterColor
        {
            get { return _counterColor; }
            set { Set(ref _counterColor, value); }
        }

        private bool _isCounterVisible = false;
        public bool IsCounterVisible
        {
            get { return _isCounterVisible; }
            set { Set(ref _isCounterVisible, value); }
        }

        public void Update(int count)
        {
            if (count >= 0)
            {
                CounterText = count.ToString("D");
                IsCounterVisible = true;
            }
            else
            {
                CounterText = "";
                IsCounterVisible = false;
            }

        }
    }
}
