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
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Storage;
using Windows.Storage.Pickers;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Data;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace IntelligentKioskSample.Controls.Ignite
{
    public sealed partial class CustomerRegistrationControl : UserControl
    {
        public static readonly DependencyProperty RegistrationModeProperty =
            DependencyProperty.Register(
            "RegistrationMode",
            typeof(bool),
            typeof(CustomerRegistrationControl),
            new PropertyMetadata(true)
            );

        public static readonly DependencyProperty ButtonTextProperty =
            DependencyProperty.Register(
            "ButtonText",
            typeof(string),
            typeof(CustomerRegistrationControl),
            new PropertyMetadata("Face ID")
            );

        public event EventHandler<CustomerRegistrationInfo> OnRegistrationComplete;

        public bool RegistrationMode
        {
            get { return (bool)GetValue(RegistrationModeProperty); }
            set { SetValue(RegistrationModeProperty, (bool)value); }
        }

        public string ButtonText
        {
            get { return (string)GetValue(ButtonTextProperty); }
            set { SetValue(ButtonTextProperty, (string)value); }
        }

        public CustomerRegistrationViewModel ViewModel {get; set;}

        public CustomerRegistrationControl()
        {
            this.InitializeComponent();
            this.ViewModel = new CustomerRegistrationViewModel();
            // Defer to loaded event to set the mode from markup 
            //this.Loaded += delegate { this.ViewModel.ResetRegistrationMode(RegistrationMode); };
        }

        private async void OnCameraImageCaptured(object sender, ImageAnalyzer img)
        {
            //this.cameraCaptureFlyout.Hide();
            //await this.HandleTrainingImageCapture(e);
            var croppedImage = img;
            try
            {
                croppedImage = await GetPrimaryFaceFromCameraCaptureAsync(img);
            }
            catch
            {
                croppedImage = null;
            }

            // REVIEW: do we need uncropped image for identification on sign-in?
            await this.ViewModel.UpdateFaceCaptured(croppedImage);
        }

        private async Task<ImageAnalyzer> GetPrimaryFaceFromCameraCaptureAsync(ImageAnalyzer img)
        {
            if (img == null)
            {
                return null;
            }

            await img.DetectFacesAsync();

            if (img.DetectedFaces == null || !img.DetectedFaces.Any())
            {
                return null;
            }

            // Crop the primary face and return it as the result
            FaceRectangle rect = img.DetectedFaces.First().FaceRectangle;
            double heightScaleFactor = 1.8;
            double widthScaleFactor = 1.8;
            FaceRectangle biggerRectangle = new FaceRectangle
            {
                Height = Math.Min((int)(rect.Height * heightScaleFactor), img.DecodedImageHeight),
                Width = Math.Min((int)(rect.Width * widthScaleFactor), img.DecodedImageWidth)
            };
            biggerRectangle.Left = Math.Max(0, rect.Left - (int)(rect.Width * ((widthScaleFactor - 1) / 2)));
            biggerRectangle.Top = Math.Max(0, rect.Top - (int)(rect.Height * ((heightScaleFactor - 1) / 1.4)));

            StorageFile tempFile = await ApplicationData.Current.TemporaryFolder.CreateFileAsync(
                                                    "FaceRecoCameraCapture.jpg",
                                                    CreationCollisionOption.GenerateUniqueName);

            await Util.CropBitmapAsync(img.GetImageStreamCallback, biggerRectangle, tempFile);

            return new ImageAnalyzer(tempFile.OpenStreamForReadAsync, tempFile.Path);
        }

        private async void OnCameraFlyoutOpened(object sender, object e)
        {
            this.ViewModel.Reset(RegistrationMode);
            await this.cameraControl.StartStreamAsync();
        }

        private async void OnCameraFlyoutClosed(object sender, object e)
        {
            await this.cameraControl.StopStreamAsync();
            this.OnRegistrationComplete?.Invoke(this, this.ViewModel.GetCustomerInfo());
        }
    }
}
