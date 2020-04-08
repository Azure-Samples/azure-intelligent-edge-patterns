﻿// 
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
using ServiceHelpers;
using ServiceListener;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Windows.UI.Popups;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

namespace IntelligentKioskSample.Views.Ignite
{
    public sealed partial class ShoppingPage : Page
    {
        public ShoppingViewModel ViewModel { get; set; }

        private Task processingLoopTask;
        private bool isProcessingLoopInProgress;
        private bool isProcessingPhoto;

        EyeTracker eyeTracker = null;

        public ShoppingPage()
        {
            this.InitializeComponent();

            this.ViewModel = new ShoppingViewModel();

            Window.Current.Activated += CurrentWindowActivationStateChanged;
            this.cameraControl.FilterOutSmallFaces = true;
            this.cameraControl.HideCameraControls();
            this.cameraControl.CameraAspectRatioChanged += CameraControl_CameraAspectRatioChanged;

            try
            {
                eyeTracker = new EyeTracker(SettingsHelper.Instance.EyeTracker);
                // this simply creates the http client, no actual listening
                eyeTracker.StartListening();
                eyeTracker.EyeDirectionEvent += OnEyeDirection;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
            }
        }

        private void OnEyeDirection(EyeTracker.EyeDirectionDelegate eyeDirection)
        {
            throw new NotImplementedException();
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
            if (e == null)
            {
                this.ViewModel.Update(ShoppingScreenState.Choice);
                this.isProcessingPhoto = false;
                return;
            }

            await e.DetectFacesAsync();

            EyeDirection gaze = EyeDirection.None;

            if (e.DetectedFaces.Any() && eyeTracker != null)
            {
                // Send to gaze service for detection
                gaze = await eyeTracker.RequestEyesDirection(e.Data);
                if (gaze == EyeDirection.Left)
                {
                    this.ViewModel.Update(ShoppingScreenState.Selected, ShoppingChoice.TopLeft);
                    this.isProcessingPhoto = false;
                    return;
                }
                else if (gaze == EyeDirection.Right)
                {
                    this.ViewModel.Update(ShoppingScreenState.Selected, ShoppingChoice.TopRight);
                    this.isProcessingPhoto = false;
                    return;
                }
            }
            else
            {
                // don't bother if no face
            }

            this.ViewModel.Update(ShoppingScreenState.Choice);
            this.isProcessingPhoto = false;
        }

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            EnterKioskMode();

            if (string.IsNullOrEmpty(SettingsHelper.Instance.FaceApiKey))
            {
                await new MessageDialog("Missing Face API Key. Please enter a key in the Settings page.", "Missing API Key").ShowAsync();
            }
            else if (string.IsNullOrEmpty(SettingsHelper.Instance.EyeTracker))
            {
                await new MessageDialog("Missing Eye Tracker endpoint. Please enter it in the Settings page.", "Missing Endpoint").ShowAsync();
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
            try
            {
                this.eyeTracker.EyeDirectionEvent -= OnEyeDirection;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
            }


            await this.cameraControl.StopStreamAsync();
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

        private void ChoiceButton_Click(object sender, RoutedEventArgs e)
        {
            string btnName = ((Button)sender).Name;
            ShoppingChoice choice = ShoppingChoice.TopLeft;
            if (btnName == "TopRight")
            {
                choice = ShoppingChoice.TopRight;
            }
            this.ViewModel.Update(ShoppingScreenState.Selected, choice: choice, force: true);
        }

        private void SelectedButton_Click(object sender, RoutedEventArgs e)
        {
            this.ViewModel.Update(ShoppingScreenState.Choice, force: true);
        }
    }
}