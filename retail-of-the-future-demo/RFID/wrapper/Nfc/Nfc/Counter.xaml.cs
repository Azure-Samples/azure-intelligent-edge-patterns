//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

using SDKTemplate;
using System;
using System.Threading.Tasks;
using Windows.Devices.SmartCards;
using Windows.Storage;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using ServiceListener;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace NfcSupport
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class CounterScenario : Page
    {
        private MainPage rootPage;
        CounterListener counterListener;

        public CounterScenario()
        {
            this.InitializeComponent();
            counterListener = new CounterListener("http://13.93.154.123:5001", 5);
        }

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            rootPage = MainPage.Current;
            // Clear the messages
            rootPage.NotifyUser(String.Empty, NotifyType.StatusMessage, true);
            counterListener.StartListening(OnReceivedCount);
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            counterListener.StopListening();
            base.OnNavigatedFrom(e);
        }

        async void OnReceivedCount(int count)
        {
            // this event will be fired on a different thread
            await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                CounterValue.Text = count.ToString("D").PadLeft(10);
                rootPage.NotifyUser($"Next result soon...", NotifyType.StatusMessage, true);
            });
        }
    }
}
