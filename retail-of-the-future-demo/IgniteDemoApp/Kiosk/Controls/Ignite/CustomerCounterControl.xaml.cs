// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Cognitive Services: http://www.microsoft.com/cognitive
// 
// Microsoft Cognitive Services Github:
// https://github.com/Microsoft/Cognitive
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// 

using IntelligentKioskSample.Models;
using Microsoft.Azure.CognitiveServices.Vision.Face.Models;
using ServiceHelpers;
using ServiceListener;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.Pickers;
using Windows.UI.Core;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Data;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace IntelligentKioskSample.Controls.Ignite
{
    public sealed partial class CustomerCounterControl : UserControl
    {
        private CounterListener counterListener;
        public CustomerCounterViewModel ViewModel { get; set; }

        public CustomerCounterControl()
        {
            this.InitializeComponent();
            this.ViewModel = new CustomerCounterViewModel();
            this.ViewModel.CounterColor = Util.ToBrush("#686868");  // TODO: get this from dependency property
            try
            {
                this.counterListener = new CounterListener(SettingsHelper.Instance.CustomerCounterEndpoint,
                    Util.ToIntSafely(SettingsHelper.Instance.CustomerCounterTiming, 5));
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Counter: {ex.Message}");
            }
        }

        public void StartListening()
        {
            try
            {
                counterListener.StartListening(OnReceivedCount, null);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Counter: {ex.Message}");
            }
        }

        public void StopListening()
        {
            try
            {
                counterListener.StopListening();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Counter: {ex.Message}");
            }
        }

        private async void OnReceivedCount(int count)
        {
            await Dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
            {
                this.ViewModel.Update(count);
            });
        }

    }
}
