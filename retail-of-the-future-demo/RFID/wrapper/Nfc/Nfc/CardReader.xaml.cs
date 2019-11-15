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


using System;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;
using Pcsc;
using static NfcSupport.NfcUtils;
using Windows.Devices.SmartCards;
using System.Threading.Tasks;
using Pcsc.Common;
using SDKTemplate;
using ServiceListener;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace NfcSupport
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class CardReader : Page
    {
        // tells us when data is available
        NfcListener nfcListener;
        bool canReadCards = false;

        public CardReader()
        {
            this.InitializeComponent();
            nfcListener = new NfcListener();
        }

        protected async override void OnNavigatedTo(NavigationEventArgs e)
        {
            // Clear the messages
            MainPage.Current.NotifyUser(String.Empty, NotifyType.StatusMessage, true);
            if (!canReadCards)
            {
                canReadCards = await nfcListener.AttachReader(OnCardReceived);
            }

            if(!canReadCards)
            {
                MainPage.Current.NotifyUser("Did not find an NFC device", NotifyType.ErrorMessage, true);
            }

        }

        protected override void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            nfcListener.DetachReader();
            canReadCards = false;

            base.OnNavigatingFrom(e);
        }

        void OnCardReceived(string uid)
        {
            MainPage.Current.NotifyUser(uid, NotifyType.StatusMessage, true);
        }
    }
}
