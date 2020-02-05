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

using IntelligentKioskSample.Data;
using IntelligentKioskSample.Models;
using ServiceHelpers;
using ServiceListener;
using System;
using System.Linq;
using System.Threading.Tasks;
using Windows.UI.Core;
using Windows.UI.Popups;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// using for speech
using Windows.Media.Core;
using Windows.Media.Playback;
using Windows.Storage;
using System.Diagnostics;
using System.Collections.Generic;
using System.Threading;

namespace IntelligentKioskSample.Views.Ignite
{
    public sealed partial class DemoWelcomePage : Page
    {
        public DemoWelcomeViewModel ViewModel { get; set; }

        private Task processingLoopTask;
        private bool isProcessingLoopInProgress;
        private bool isProcessingPhoto;

        private bool isDebugInfo;
        private bool isUsingSpeech;  // allow spoken prompts
        private bool allowSendingOffMsg; // should part with a customer with a spoken sendoff message?

        private string clarificationPrompt = " Sorry, we did not get that. Could you please tell us your preference?";
        private string giveupPrompt = " Sorry, we still did not get that. Please tap on the product that interests you.";
        private string sendoffMessage = " Enjoy your visit!";

        private bool isEngagingCustomer;
        private bool isSelecting;
        private bool isDelaying;
        private bool isSkippingGreeting;
        private bool isGoingBack;

        private CancellationTokenSource ctsOffer;
        private List<CancellationTokenSource> discardedCtsOffers = new List<CancellationTokenSource>();

        public DemoWelcomePage()
        {
            this.InitializeComponent();

            this.isDebugInfo = SettingsHelper.Instance.ShowDebugInfo;
            this.isUsingSpeech = SettingsHelper.Instance.UseSpeech;
            this.ViewModel = new DemoWelcomeViewModel(this.isUsingSpeech);

            Window.Current.Activated += CurrentWindowActivationStateChanged;
            this.cameraControl.FilterOutSmallFaces = true;
            this.cameraControl.HideCameraControls();
            this.cameraControl.CameraAspectRatioChanged += CameraControl_CameraAspectRatioChanged;
        }

        private void CameraControl_CameraAspectRatioChanged(object sender, EventArgs e)
        {
            this.UpdateCameraHostSize();
        }

        private void StartProcessingLoop()
        {
            this.isProcessingLoopInProgress = true;

            if (this.processingLoopTask == null || this.processingLoopTask.Status != TaskStatus.Running)
            {
                this.processingLoopTask = Task.Run(() => this.ProcessingLoop());
            }
        }

        private async void ProcessingLoop()
        {
            while (this.isProcessingLoopInProgress)
            {
                await this.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, async () =>
                {
                    if (!this.isProcessingPhoto)
                    {
                        this.isProcessingPhoto = true;
                        if (this.cameraControl.NumFacesOnLastFrame == 0)
                        {
                            await this.ProcessCameraCapture(null);
                        }
                        else
                        {
                            await this.ProcessCameraCapture(await this.cameraControl.CaptureFrameAsync());
                        }
                    }
                });

                await Task.Delay(this.cameraControl.NumFacesOnLastFrame == 0 ? 100 : 1000);
            }
        }

        private async void CurrentWindowActivationStateChanged(object sender, Windows.UI.Core.WindowActivatedEventArgs e)
        {
            if ((e.WindowActivationState == Windows.UI.Core.CoreWindowActivationState.CodeActivated ||
                e.WindowActivationState == Windows.UI.Core.CoreWindowActivationState.PointerActivated) &&
                this.cameraControl.CameraStreamState == Windows.Media.Devices.CameraStreamState.Shutdown)
            {
                // When our Window loses focus due to user interaction Windows shuts it down, so we 
                // detect here when the window regains focus and trigger a restart of the camera.
                await this.cameraControl.StartStreamAsync(isForRealTimeProcessing: true);
            }
        }

        private async Task ProcessCameraCapture(ImageAnalyzer e)
        {
            if (this.isEngagingCustomer)
            {
                this.isProcessingPhoto = false;
                return;
            }

            if (e == null)
            {
                this.allowSendingOffMsg = false;
                this.ViewModel.Update(DemoScreenState.NoFace);

                this.isProcessingPhoto = false;
                return;
            }

            await e.DetectFacesAsync();

            if (e.DetectedFaces.Any())
            {
                await e.IdentifyFacesAsync();

                bool recognized = false;
                if (e.IdentifiedPersons.Any())
                {
                    var candidate = e.IdentifiedPersons.First().Person;
                    // Check if this is a registered customer, who made purchases, before recognizing
                    CustomerInfo ci = IgniteDataAccess.GetCustomerInfo(candidate.PersonId.ToString());
                    if (ci != null)
                    {
                        recognized = true;
                        await EngageRecognizedCustomer(ci);
                    }
                }
                if (!recognized)
                {
                    await EngageUnrecognized();
                }
            }
            // else CameraControl captured a face, but ImageAnalyzer cannot detect any - no change of state in this case

            this.isProcessingPhoto = false;
        }

        private async Task EngageRecognizedCustomer(CustomerInfo ci)
        {
            if (this.ViewModel.Update(DemoScreenState.Recognized, ci))
            {
                this.isEngagingCustomer = true;
                this.allowSendingOffMsg = true;

                if (this.isUsingSpeech)
                {
                    await SpeakWhileCheckingPresence(this.ViewModel.CustomerPrompt);
                    this.allowSendingOffMsg = false;
                    await DelayWhileHaveCustomer(3000);
                }
                else 
                {
                    await DelayWhileHaveCustomer(5000);
                }
                this.isEngagingCustomer = false;
            }
        }

        private async Task EngageUnrecognized()
        {
            if (this.ViewModel.Update(DemoScreenState.Greeting))
            {
                this.isEngagingCustomer = true;
                this.allowSendingOffMsg = false;
                this.isSkippingGreeting = false;
                this.isGoingBack = false;

                string entity = "";

                if (this.isDebugInfo)
                {
                    this.debugInfo.Text = "";
                }

                if (this.isUsingSpeech)
                {
                    await SpeakWhileCheckingPresence(this.ViewModel.CustomerPrompt);
                }
                else
                {
                    await DelayWhileHaveCustomer(10000);
                }

                if (!this.isSkippingGreeting && !this.isGoingBack && this.isEngagingCustomer)
                {
                    entity = await OfferChoiceCancelPrevious();
                    if (!string.IsNullOrEmpty(entity) && this.isSelecting)
                    {
                        this.isSelecting = false;
                        await ProcessCustomerChoice(entity);
                    }

                    if (!this.isSkippingGreeting && !this.isGoingBack)
                    {
                        this.isEngagingCustomer = false;
                    }
                }
            }
        }

        private async Task<string> OfferChoiceCancelPrevious()
        {
            // cancel the previous offer 
            if (this.ctsOffer != null)
            {
                this.ctsOffer.Cancel();
                this.discardedCtsOffers.Add(this.ctsOffer); // to be disposed after he corresponding task ise done
                this.ctsOffer = null;
            }
            this.ctsOffer = new CancellationTokenSource();
            CancellationTokenSource cts = this.ctsOffer;
            string entity = await OfferChoice(this.ctsOffer.Token);
            // dispose cancellation token source of this offer
            if (this.ctsOffer == cts) // this offer was not cancelled
            {
                this.ctsOffer.Cancel();
                this.ctsOffer.Dispose();
                this.ctsOffer = null;
            }
            else // look up in the discarded list
            {
                if (this.discardedCtsOffers.Contains(cts))
                {
                    cts.Dispose();
                    this.discardedCtsOffers.Remove(cts);
                }
            }
            return entity;
        }

        private async Task<string> OfferChoice(CancellationToken ct)
        {
            string entity = "";

            if (this.ViewModel.Update(DemoScreenState.Selection, force: true))
            {
                this.isSelecting = true;
                this.allowSendingOffMsg = true;

                await SpeakWithDelay(this.ViewModel.CustomerPrompt);
                if (!ct.IsCancellationRequested)
                {
                    entity = await RecognizeChoice();
                }
                if (string.IsNullOrEmpty(entity) && !ct.IsCancellationRequested)
                {
                    await SpeakWithDelay(this.clarificationPrompt);
                    if (!ct.IsCancellationRequested)
                    {
                        entity = await RecognizeChoice();
                    }
                }
                if (string.IsNullOrEmpty(entity) && !ct.IsCancellationRequested)
                {
                    await SpeakWithDelay(this.giveupPrompt);
                    await DelayWhileHaveCustomer(5000);
                }
            }

            if (ct.IsCancellationRequested)
            {
                entity = "";
            }

            return entity;
        }

        private async Task DelayWhileHaveCustomer(int msDelay)
        {
            this.isDelaying = true;
            DateTime startDelayTime = DateTime.Now;
            DateTime endDelayTime = startDelayTime.AddMilliseconds(msDelay);
            while (DateTime.Now < endDelayTime && this.isDelaying && this.isEngagingCustomer)
            {
                if (await SendOffIfNoFace())
                {
                    break;
                }

                await Task.Delay(300);
            }
            this.isDelaying = false;
        }

        private async Task ProcessCustomerChoice(string entity)
        {
            if (!string.IsNullOrEmpty(entity))
            {
                // cancel pending prompts
                this.allowSendingOffMsg = false;
                // route customer  
                string direction = ProductCatalog.GetDirectionFromLuisEntity(entity);

                if (direction == "left")
                {
                    if (this.ViewModel.Update(DemoScreenState.LeftSelected))
                    {
                        await SpeakWithDelay(this.ViewModel.CustomerPrompt);
                    }
                }
                else if (direction == "right")
                {
                    if (this.ViewModel.Update(DemoScreenState.RightSelected))
                    {
                        await SpeakWithDelay(this.ViewModel.CustomerPrompt);
                    }
                }
            }
        }

        private async void LeftButton_Click(object sender, RoutedEventArgs e)
        {
            this.allowSendingOffMsg = false;
            if (this.ViewModel.Update(DemoScreenState.LeftSelected))
            {
                this.isSelecting = false;
                if (this.ctsOffer != null)
                {
                    this.ctsOffer.Cancel();
                }
                await SpeakWithDelay(this.ViewModel.CustomerPrompt);
            }
        }

        private async void RightButton_Click(object sender, RoutedEventArgs e)
        {
            this.allowSendingOffMsg = false;
            if (ViewModel.Update(DemoScreenState.RightSelected))
            {
                this.isSelecting = false;
                if (this.ctsOffer != null)
                {
                    this.ctsOffer.Cancel();
                }
                await SpeakWithDelay(this.ViewModel.CustomerPrompt);
            }
        }

        private async void NextButton_Click(object sender, RoutedEventArgs e)
        {
            this.allowSendingOffMsg = false;
            this.isDelaying = false;
            this.isSkippingGreeting = true;

            string entity = await OfferChoiceCancelPrevious();
            if (!string.IsNullOrEmpty(entity) && this.isSelecting)
            {
                this.isSelecting = false;
                await ProcessCustomerChoice(entity);
            }

            if (!this.isGoingBack)
            {
                this.isEngagingCustomer = false;
            }
        }

        private async void GoBackButton_Click(object sender, RoutedEventArgs e)
        {
            this.allowSendingOffMsg = false;
            this.isDelaying = false;

            if (this.isSelecting) // go back to Greeting
            {
                this.isSelecting = false;
                if (this.ctsOffer != null)
                {
                    this.ctsOffer.Cancel();
                }
                this.ViewModel.Update(DemoScreenState.NoFaceGreeting);
                await SpeakWithDelay("");
            }
            else // go back to Selecting
            {
                this.isGoingBack = true;
                this.isEngagingCustomer = true;
                string entity = await OfferChoiceCancelPrevious();
                if (!string.IsNullOrEmpty(entity) && this.isSelecting)
                {
                    this.isSelecting = false;
                    await ProcessCustomerChoice(entity);
                }
                this.isEngagingCustomer = false;
            }
        }

        private async void RestartButton_Click(object sender, RoutedEventArgs e)
        {
            this.allowSendingOffMsg = false;
            this.isDelaying = false;

            this.isSelecting = false;
            if (this.ctsOffer != null)
            {
                this.ctsOffer.Cancel();
            }
            this.ViewModel.Update(DemoScreenState.NoFace, force: true);
            await SpeakWithDelay("");
            this.isEngagingCustomer = false; 
        }

        #region Speech Processing Helpers
        // Simply say what is to be said
        public async Task SpeakWithDelay(string prompt)
        {
            if (this.isUsingSpeech)
            {
                int msRemainingDelay = await TextToSpeechServiceHelper.SpeakTextAsync(prompt);
                await Task.Delay(msRemainingDelay);
            }
        }

        // Verify that no face is in front of camera, cancel current speaking and speak send-off message if allowed
        public async Task<bool> SendOffIfNoFace()
        {
            bool doSendOff = true;

            // Verify that there is indeed no face there (we do not want to be too sensitive when customer looks away)
            for (int i = 0; i < 20; i++)
            {
                if (this.cameraControl.NumFacesOnLastFrame != 0)
                {
                    doSendOff = false;
                    break;
                }
                await Task.Delay(300);  // TODO: tune this up for optimal customer experience
            }

            // Send off the customer
            if (doSendOff)
            {
                if (this.isUsingSpeech)
                {
                    await TextToSpeechServiceHelper.SpeakTextAsync("");
                    await Task.Delay(1000);
                }
                if (this.allowSendingOffMsg)
                {
                    this.allowSendingOffMsg = false; // DRY
                    if (this.isUsingSpeech)
                    {
                        await TextToSpeechServiceHelper.SpeakTextAsync(this.sendoffMessage);
                    }
                }
            }

            return doSendOff;
        }

        // Start speaking, but stop if nobody is in front of camera
        public async Task SpeakWhileCheckingPresence(string prompt)
        {
            if (this.isUsingSpeech)
            {
                int msTimeToSpeak = await TextToSpeechServiceHelper.SpeakTextAsync(prompt);
                DateTime startSpeakTime = DateTime.Now;
                DateTime endSpeakTime = startSpeakTime.AddMilliseconds(msTimeToSpeak);
                while (DateTime.Now < endSpeakTime && this.isEngagingCustomer)
                {
                    if (await SendOffIfNoFace())
                    {
                        break;
                    }

                    await Task.Delay(500); // we can be lax with timeout here, since we are not listening
                }
            }
        }

        public async Task<string> RecognizeChoice()
        {
            string entity = "";

            if (this.isUsingSpeech)
            {
                string speechText = await SpeechToTextServiceHelper.GetTextFromSpeechAsync();
                if (this.isDebugInfo)
                {
                    this.debugInfo.Text = string.IsNullOrEmpty(speechText) ? "" : speechText;
                }
                entity = await LuisServiceHelper.GetEntity(speechText);
                if (this.isDebugInfo)
                {
                    string text = this.debugInfo.Text;
                    this.debugInfo.Text = $"{text} => {entity}";
                }
            }

            return entity;
        }
        #endregion

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            EnterKioskMode();

            this.customerCounterControl.StartListening();


            //if (string.IsNullOrEmpty(SettingsHelper.Instance.TextToSpeechApiKey))
            //{
            //    await new MessageDialog("Missing Speech API Key. Please enter a key in the Settings page.", "Missing API Key").ShowAsync();
            //}
            //await new MessageDialog($"Speech endpoint: {TextToSpeechServiceHelper.ApiEndpoint}\n Speech Key: {TextToSpeechServiceHelper.ApiKey}").ShowAsync();

            if (string.IsNullOrEmpty(SettingsHelper.Instance.FaceApiKey))
            {
                await new MessageDialog("Missing Face API Key. Please enter a key in the Settings page.", "Missing API Key").ShowAsync();
            }
            else
            {
                await this.cameraControl.StartStreamAsync(isForRealTimeProcessing: true);
                this.StartProcessingLoop();
            }

            base.OnNavigatedTo(e);
        }


        private void EnterKioskMode()
        {
            ApplicationView view = ApplicationView.GetForCurrentView();
            if (!view.IsFullScreenMode)
            {
                view.TryEnterFullScreenMode();
            }
        }

        protected override async void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            this.isProcessingLoopInProgress = false;
            Window.Current.Activated -= CurrentWindowActivationStateChanged;
            this.cameraControl.CameraAspectRatioChanged -= CameraControl_CameraAspectRatioChanged;

            await this.cameraControl.StopStreamAsync();

            this.customerCounterControl.StopListening();


            base.OnNavigatingFrom(e);
        }

        private void OnPageSizeChanged(object sender, SizeChangedEventArgs e)
        {
            this.UpdateCameraHostSize();
        }

        private void UpdateCameraHostSize()
        {
            this.cameraHostGrid.Width = this.cameraHostGrid.ActualHeight * (this.cameraControl.CameraAspectRatio != 0 ? this.cameraControl.CameraAspectRatio : 1.777777777777);
        }
    }
}