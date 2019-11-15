using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using IntelligentKioskSample.Data;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using IntelligentKioskSample.Models;
using Pcsc;
using static NfcSupport.NfcUtils;
using Windows.Devices.SmartCards;
using System.Threading.Tasks;
using Pcsc.Common;
using ServiceListener;
using System.Diagnostics;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=234238

namespace IntelligentKioskSample.Views.Ignite
{
    public sealed partial class FaqPage : Page
    {
        private NfcListener nfcListener;
        public FaqViewModel ViewModel { get; set; }
       
        public FaqPage()
        {
            this.InitializeComponent();
            this.ViewModel = new FaqViewModel();
            this.nfcListener = new NfcListener();
        }

        protected async override void OnNavigatedTo(NavigationEventArgs e)
        {
            try
            {
                await nfcListener.AttachReader(OnCardReceived);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"NFC: Cannot read cards: {ex.Message}");
            }
            base.OnNavigatedTo(e);
        }

        protected override void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            try
            {
                nfcListener.DetachReader();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"NFC: Cannot detach card reader: {ex.Message}");
            }
            base.OnNavigatingFrom(e);
        }

        void OnCardReceived(string uid)
        {
            var ignored = this.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () =>
            {
                IgniteDataServices.SetLocatedProduct(uid);
                this.ViewModel.Update();
            });
        }
    }
}
