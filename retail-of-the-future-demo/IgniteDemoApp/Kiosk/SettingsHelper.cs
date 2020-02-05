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

using System;
using System.ComponentModel;
using System.IO;
using System.Linq;
using Windows.Storage;

namespace IntelligentKioskSample
{
    internal class SettingsHelper : INotifyPropertyChanged
    {
        public static readonly string CustomEndpointName = "Custom";
        public static readonly string DefaultApiEndpoint = "https://westus.api.cognitive.microsoft.com";
        public static readonly string DefaultTextToSpeechApiEndpoint = "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1";
        public static readonly string DefaultSpeechToTextApiEndpoint = "wss://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1";
        public static readonly string DefaultCustomVisionApiEndpoint = "https://southcentralus.api.cognitive.microsoft.com";

        public static readonly string[] AvailableApiRegions = new string[]
        {
            "westus",
            "westus2",
            "eastus",
            "eastus2",
            "westcentralus",
            "southcentralus",
            "westeurope",
            "northeurope",
            "southeastasia",
            "eastasia",
            "australiaeast",
            "brazilsouth",
            "canadacentral",
            "centralindia",
            "uksouth",
            "japaneast"
        };

        public event EventHandler SettingsChanged;
        public event PropertyChangedEventHandler PropertyChanged;

        private static SettingsHelper instance;

        static SettingsHelper()
        {
            instance = new SettingsHelper();
        }

        public void Initialize()
        {
            LoadRoamingSettings();
            Windows.Storage.ApplicationData.Current.DataChanged += RoamingDataChanged;
        }

        private void RoamingDataChanged(ApplicationData sender, object args)
        {
            LoadRoamingSettings();
            instance.OnSettingsChanged();
        }

        private void OnSettingsChanged()
        {
            instance.SettingsChanged?.Invoke(instance, EventArgs.Empty);
        }

        private async void OnSettingChanged(string propertyName, object value)
        {
            if (propertyName == "MallKioskDemoCustomSettings")
            {
                // save to file as the content is too big to be saved as a string-like setting
                StorageFile file = await ApplicationData.Current.RoamingFolder.CreateFileAsync(
                    "MallKioskDemoCustomSettings.xml",
                    CreationCollisionOption.ReplaceExisting);

                using (Stream stream = await file.OpenStreamForWriteAsync())
                {
                    using (StreamWriter writer = new StreamWriter(stream))
                    {
                        await writer.WriteAsync(value.ToString());
                    }
                }
            }
            else
            {
                ApplicationData.Current.RoamingSettings.Values[propertyName] = value;
            }

            instance.OnSettingsChanged();
            instance.OnPropertyChanged(propertyName);
        }

        private void OnPropertyChanged(string propertyName)
        {
            instance.PropertyChanged?.Invoke(instance, new PropertyChangedEventArgs(propertyName));
        }

        public static SettingsHelper Instance
        {
            get
            {
                return instance;
            }
        }

        private void LoadRoamingSettings()
        {
            object value = ApplicationData.Current.RoamingSettings.Values["ZoneId"];
            if (value != null)
            {
                this.ZoneId = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["AltGreetingText"];
            if (value != null && !string.IsNullOrWhiteSpace(value.ToString()))
            {
                this.AltGreetingText = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["AltReturnGreetingText"];
            if (value != null && !string.IsNullOrWhiteSpace(value.ToString()))
            {
                this.AltReturnGreetingText = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomerCounterEndpoint"];
            if (value != null)
            {
                this.CustomerCounterEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomerCounterTiming"];
            if (value != null)
            {
                this.CustomerCounterTiming = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomerCounterResetValue"];
            if (value != null)
            {
                this.CustomerCounterResetValue = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomerCounterSourceId"];
            if (value != null)
            {
                this.CustomerCounterSourceId = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["BackendConnection"];
            if (value != null)
            {
                this.BackendConnection = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["FaceApiKey"];
            if (value != null)
            {
                this.FaceApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["FaceApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["FaceApiKeyRegion"] != null)
            {
                var faceApiRegion = ApplicationData.Current.RoamingSettings.Values["FaceApiKeyRegion"].ToString();
                value = GetRegionEndpoint(faceApiRegion);
            }
            if (value != null)
            {
                this.FaceApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["TextToSpeechApiKey"];
            if (value != null)
            {
                this.TextToSpeechApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["TextToSpeechApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["TextToSpeechApiKeyRegion"] != null)
            {
                var textToSpeechApiRegion = ApplicationData.Current.RoamingSettings.Values["TextToSpeechApiKeyRegion"].ToString();
                value = GetRegionEndpoint(textToSpeechApiRegion);
            }
            if (value != null)
            {
                this.TextToSpeechApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["SpeechToTextApiKey"];
            if (value != null)
            {
                this.SpeechToTextApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["SpeechToTextApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["SpeechToTextApiKeyRegion"] != null)
            {
                var speechToTextApiRegion = ApplicationData.Current.RoamingSettings.Values["SpeechToTextApiKeyRegion"].ToString();
                value = GetRegionEndpoint(speechToTextApiRegion);
            }
            if (value != null)
            {
                this.SpeechToTextApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["LuisApiKey"];
            if (value != null)
            {
                this.LuisApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["LuisAppId"];
            if (value != null)
            {
                this.LuisAppId = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["LuisApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["LuisApiKeyRegion"] != null)
            {
                var luisApiRegion = ApplicationData.Current.RoamingSettings.Values["LuisApiKeyRegion"].ToString();
                value = GetRegionEndpoint(luisApiRegion);
            }
            if (value != null)
            {
                this.LuisApiKeyEndpoint = value.ToString();
            }
                       
            value = ApplicationData.Current.RoamingSettings.Values["VisionApiKey"];
            if (value != null)
            {
                this.VisionApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["VisionApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["VisionApiKeyRegion"] != null)
            {
                var visionApiRegion = ApplicationData.Current.RoamingSettings.Values["VisionApiKeyRegion"].ToString();
                value = GetRegionEndpoint(visionApiRegion);
            }
            if (value != null)
            {
                this.VisionApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["BingSearchApiKey"];
            if (value != null)
            {
                this.BingSearchApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["BingAutoSuggestionApiKey"];
            if (value != null)
            {
                this.BingAutoSuggestionApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["WorkspaceKey"];
            if (value != null)
            {
                this.WorkspaceKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["TextAnalyticsKey"];
            if (value != null)
            {
                this.TextAnalyticsKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["TextAnalyticsApiKeyEndpoint"];
            if (value == null && ApplicationData.Current.RoamingSettings.Values["TextAnalyticsApiKeyRegion"] != null)
            {
                var textAnalyticsApiRegion = ApplicationData.Current.RoamingSettings.Values["TextAnalyticsApiKeyRegion"].ToString();
                value = GetRegionEndpoint(textAnalyticsApiRegion);
            }
            if (value != null)
            {
                this.TextAnalyticsApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CameraName"];
            if (value != null)
            {
                this.CameraName = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["ShelfCamera"];
            if (value != null)
            {
                this.ShelfCamera = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["DetectionDelay"];
            if (value != null)
            {
                this.DetectionDelay = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["MinDetectableFaceCoveragePercentage"];
            if (value != null)
            {
                uint size;
                if (uint.TryParse(value.ToString(), out size))
                {
                    this.MinDetectableFaceCoveragePercentage = size;
                }
            }

            value = ApplicationData.Current.RoamingSettings.Values["ShowDebugInfo"];
            if (value != null)
            {
                bool booleanValue;
                if (bool.TryParse(value.ToString(), out booleanValue))
                {
                    this.ShowDebugInfo = booleanValue;
                }
            }

            value = ApplicationData.Current.RoamingSettings.Values["UseSpeech"];
            if (value != null)
            {
                bool booleanValue;
                if (bool.TryParse(value.ToString(), out booleanValue))
                {
                    this.UseSpeech = booleanValue;
                }
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomVisionPredictionApiKey"];
            if (value != null)
            {
                this.CustomVisionPredictionApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomVisionPredictionApiKeyEndpoint"];
            if (value != null)
            {
                this.CustomVisionPredictionApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomVisionTrainingApiKey"];
            if (value != null)
            {
                this.CustomVisionTrainingApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomVisionTrainingApiKeyEndpoint"];
            if (value != null)
            {
                this.CustomVisionTrainingApiKeyEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomComputerVisionApiEndpoint"];
            if (value != null)
            {
                this.CustomComputerVisionApiEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomFaceApiEndpoint"];
            if (value != null)
            {
                this.CustomFaceApiEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomTextToSpeechApiEndpoint"];
            if (value != null)
            {
                this.CustomTextToSpeechApiEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomSpeechToTextApiEndpoint"];
            if (value != null)
            {
                this.CustomSpeechToTextApiEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomLuisApiEndpoint"];
            if (value != null)
            {
                this.CustomLuisApiEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["CustomTextAnalyticsEndpoint"];
            if (value != null)
            {
                this.CustomTextAnalyticsEndpoint = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["TranslatorTextApiKey"];
            if (value != null)
            {
                this.TranslatorTextApiKey = value.ToString();
            }

            value = ApplicationData.Current.RoamingSettings.Values["AnomalyDetectorApiKey"];
            if (value != null)
            {
                this.AnomalyDetectorApiKey = value.ToString();
            }

            // load mall kiosk demo custom settings from file as the content is too big to be saved as a string-like setting
            //try
            //{
            //    using (Stream stream = await ApplicationData.Current.RoamingFolder.OpenStreamForReadAsync("MallKioskDemoCustomSettings.xml"))
            //    {
            //        using (StreamReader reader = new StreamReader(stream))
            //        {
            //            this.MallKioskDemoCustomSettings = await reader.ReadToEndAsync();
            //        }
            //    }
            //}
            //catch (Exception)
            //{
            //    this.RestoreMallKioskSettingsToDefaultFile();
            //}
        }

        public string GetRegionEndpoint(string region)
        {
            if (!string.IsNullOrEmpty(region) && AvailableApiRegions.Any(x => string.Equals(x, region, StringComparison.OrdinalIgnoreCase)))
            {
                return $"https://{region.ToLower()}.api.cognitive.microsoft.com";
            }
            return DefaultApiEndpoint;
        }

        public void RestoreMallKioskSettingsToDefaultFile()
        {
            //this.MallKioskDemoCustomSettings = File.ReadAllText("Views\\MallKioskDemoConfig\\MallKioskDemoSettings.xml");
        }

        public void RestoreAllSettings()
        {
            ApplicationData.Current.RoamingSettings.Values.Clear();
        }

        private string zoneId = string.Empty;
        public string ZoneId
        {
            get { return this.zoneId; }
            set
            {
                this.zoneId = value;
                this.OnSettingChanged("ZoneId", value);
            }
        }

        public static string GreetingTextDefault =  
            "Hello and welcome to the Intelligent Retail Experience brought to you by Intel and Microsoft. " +
            "Enjoy the immersive, edge to cloud experience, powered by the latest tech available today.";
        private string altGreetingText = GreetingTextDefault;           
        public string AltGreetingText
        {
            get { return this.altGreetingText; }
            set
            {
                this.altGreetingText = value;
                this.OnSettingChanged("AltGreetingText", value);
            }
        }

        public static string ReturnGreetingTextDefault =
            "Welcome back to the Intelligent Retail Experience with Intel and Microsoft.";
        private string altReturnGreetingText = ReturnGreetingTextDefault;
        public string AltReturnGreetingText
        {
            get { return this.altReturnGreetingText; }
            set
            {
                this.altReturnGreetingText = value;
                this.OnSettingChanged("AltReturnGreetingText", value);
            }
        }

        private string customerCounterEndpoint = string.Empty;
        public string CustomerCounterEndpoint
        {
            get { return this.customerCounterEndpoint; }
            set
            {
                this.customerCounterEndpoint = value;
                this.OnSettingChanged("CustomerCounterEndpoint", value);
            }
        }

        private string customerCounterSourceId = string.Empty;
        public string CustomerCounterSourceId
        {
            get { return this.customerCounterSourceId; }
            set
            {
                this.customerCounterSourceId = value;
                this.OnSettingChanged("CustomerCounterSourceId", value);
            }
        }

        private string shelfCamera = string.Empty;
        public string ShelfCamera
        {
            get { return this.shelfCamera; }
            set
            {
                this.shelfCamera = value;
                this.OnSettingChanged("ShelfCamera", value);
            }
        }

        private string detectionDelay = string.Empty;
        public string DetectionDelay
        {
            get { return this.detectionDelay; }
            set
            {
                this.detectionDelay = value;
                this.OnSettingChanged("DetectionDelay", value);
            }
        }

        private string customerCounterTiming = string.Empty;
        public string CustomerCounterTiming
        {
            get { return this.customerCounterTiming; }
            set
            {
                this.customerCounterTiming = value;
                this.OnSettingChanged("CustomerCounterTiming", value);
            }
        }

        private string customerCounterResetValue = string.Empty;
        public string CustomerCounterResetValue
        {
            get { return this.customerCounterResetValue; }
            set
            {
                this.customerCounterResetValue = value;
                this.OnSettingChanged("CustomerCounterResetValue", value);
            }
        }

        private string backendConnection = string.Empty;
        public string BackendConnection
        {
            get { return this.backendConnection; }
            set
            {
                this.backendConnection = value;
                this.OnSettingChanged("BackendConnection", value);
            }
        }

        private string faceApiKey = string.Empty;
        public string FaceApiKey
        {
            get { return this.faceApiKey; }
            set
            {
                this.faceApiKey = value;
                this.OnSettingChanged("FaceApiKey", value);
            }
        }

        private string faceApiKeyEndpoint = DefaultApiEndpoint;
        public string FaceApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.faceApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customFaceApiEndpoint
                    : this.faceApiKeyEndpoint;
            }
            set
            {
                this.faceApiKeyEndpoint = value;
                this.OnSettingChanged("FaceApiKeyEndpoint", value);
            }
        }

        public string BindingFaceApiKeyEndpoint
        {
            get { return this.faceApiKeyEndpoint; }
            set
            {
                this.faceApiKeyEndpoint = value;
                this.OnSettingChanged("FaceApiKeyEndpoint", value);
            }
        }

        private string textToSpeechApiKey = string.Empty;
        public string TextToSpeechApiKey
        {
            get { return this.textToSpeechApiKey; }
            set
            {
                this.textToSpeechApiKey = value;
                this.OnSettingChanged("TextToSpeechApiKey", value);
            }
        }

        private string textToSpeechApiKeyEndpoint = DefaultTextToSpeechApiEndpoint;
        public string TextToSpeechApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.textToSpeechApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customTextToSpeechApiEndpoint
                    : this.textToSpeechApiKeyEndpoint;
            }
            set
            {
                this.textToSpeechApiKeyEndpoint = value;
                this.OnSettingChanged("TextToSpeechApiKeyEndpoint", value);
            }
        }

        public string BindingTextToSpeechApiKeyEndpoint
        {
            get { return this.textToSpeechApiKeyEndpoint; }
            set
            {
                this.textToSpeechApiKeyEndpoint = value;
                this.OnSettingChanged("TextToSpeechApiKeyEndpoint", value);
            }
        }

        private string speechToTextApiKey = string.Empty;
        public string SpeechToTextApiKey
        {
            get { return this.speechToTextApiKey; }
            set
            {
                this.speechToTextApiKey = value;
                this.OnSettingChanged("SpeechToTextApiKey", value);
            }
        }

        private string speechToTextApiKeyEndpoint = DefaultSpeechToTextApiEndpoint;
        public string SpeechToTextApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.speechToTextApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customSpeechToTextApiEndpoint
                    : this.speechToTextApiKeyEndpoint;
            }
            set
            {
                this.speechToTextApiKeyEndpoint = value;
                this.OnSettingChanged("SpeechToTextApiKeyEndpoint", value);
            }
        }

        public string BindingSpeechToTextApiKeyEndpoint
        {
            get { return this.speechToTextApiKeyEndpoint; }
            set
            {
                this.speechToTextApiKeyEndpoint = value;
                this.OnSettingChanged("SpeechToTextApiKeyEndpoint", value);
            }
        }

        private string luisApiKey = string.Empty;
        public string LuisApiKey
        {
            get { return this.luisApiKey; }
            set
            {
                this.luisApiKey = value;
                this.OnSettingChanged("LuisApiKey", value);
            }
        }

        private string luisAppId = string.Empty;
        public string LuisAppId
        {
            get { return this.luisAppId; }
            set
            {
                this.luisAppId = value;
                this.OnSettingChanged("LuisAppId", value);
            }
        }

        private string luisApiKeyEndpoint = DefaultApiEndpoint;
        public string LuisApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.luisApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customLuisApiEndpoint
                    : this.luisApiKeyEndpoint;
            }
            set
            {
                this.luisApiKeyEndpoint = value;
                this.OnSettingChanged("LuisApiKeyEndpoint", value);
            }
        }

        public string BindingLuisApiKeyEndpoint
        {
            get { return this.luisApiKeyEndpoint; }
            set
            {
                this.luisApiKeyEndpoint = value;
                this.OnSettingChanged("LuisApiKeyEndpoint", value);
            }
        }

        private string visionApiKey = string.Empty;
        public string VisionApiKey
        {
            get { return this.visionApiKey; }
            set
            {
                this.visionApiKey = value;
                this.OnSettingChanged("VisionApiKey", value);
            }
        }

        private string visionApiKeyEndpoint = DefaultApiEndpoint;
        public string VisionApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.visionApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customComputerVisionApiEndpoint
                    : this.visionApiKeyEndpoint;
            }
            set
            {
                this.visionApiKeyEndpoint = value;
                this.OnSettingChanged("VisionApiKeyEndpoint", value);
            }
        }

        public string BindingVisionApiKeyEndpoint
        {
            get { return this.visionApiKeyEndpoint; }
            set
            {
                this.visionApiKeyEndpoint = value;
                this.OnSettingChanged("VisionApiKeyEndpoint", value);
            }
        }

        private string bingSearchApiKey = string.Empty;
        public string BingSearchApiKey
        {
            get { return this.bingSearchApiKey; }
            set
            {
                this.bingSearchApiKey = value;
                this.OnSettingChanged("BingSearchApiKey", value);
            }
        }

        private string bingAutoSuggestionSearchApiKey = string.Empty;
        public string BingAutoSuggestionApiKey
        {
            get { return this.bingAutoSuggestionSearchApiKey; }
            set
            {
                this.bingAutoSuggestionSearchApiKey = value;
                this.OnSettingChanged("BingAutoSuggestionApiKey", value);
            }
        }

        private string workspaceKey = string.Empty;
        public string WorkspaceKey
        {
            get { return workspaceKey; }
            set
            {
                this.workspaceKey = value;
                this.OnSettingChanged("WorkspaceKey", value);
            }
        }

        private string mallKioskDemoCustomSettings = string.Empty;
        public string MallKioskDemoCustomSettings
        {
            get { return this.mallKioskDemoCustomSettings; }
            set
            {
                this.mallKioskDemoCustomSettings = value;
                this.OnSettingChanged("MallKioskDemoCustomSettings", value);
            }
        }

        private string textAnalyticsKey = string.Empty;
        public string TextAnalyticsKey
        {
            get { return textAnalyticsKey; }
            set
            {
                this.textAnalyticsKey = value;
                this.OnSettingChanged("TextAnalyticsKey", value);
            }
        }

        private string textAnalyticsApiKeyEndpoint = DefaultApiEndpoint;
        public string TextAnalyticsApiKeyEndpoint
        {
            get
            {
                return string.Equals(this.textAnalyticsApiKeyEndpoint, SettingsHelper.CustomEndpointName, StringComparison.OrdinalIgnoreCase)
                    ? this.customTextAnalyticsEndpoint
                    : this.textAnalyticsApiKeyEndpoint;
            }
            set
            {
                this.textAnalyticsApiKeyEndpoint = value;
                this.OnSettingChanged("TextAnalyticsApiKeyEndpoint", value);
            }
        }

        public string BindingTextAnalyticsApiKeyEndpoint
        {
            get { return this.textAnalyticsApiKeyEndpoint; }
            set
            {
                this.textAnalyticsApiKeyEndpoint = value;
                this.OnSettingChanged("TextAnalyticsApiKeyEndpoint", value);
            }
        }

        private string cameraName = string.Empty;
        public string CameraName
        {
            get { return cameraName; }
            set
            {
                this.cameraName = value;
                this.OnSettingChanged("CameraName", value);
            }
        }

        private uint minDetectableFaceCoveragePercentage = 7;
        public uint MinDetectableFaceCoveragePercentage
        {
            get { return this.minDetectableFaceCoveragePercentage; }
            set
            {
                this.minDetectableFaceCoveragePercentage = value;
                this.OnSettingChanged("MinDetectableFaceCoveragePercentage", value);
            }
        }

        private bool showDebugInfo = false;
        public bool ShowDebugInfo
        {
            get { return showDebugInfo; }
            set
            {
                this.showDebugInfo = value;
                this.OnSettingChanged("ShowDebugInfo", value);
            }
        }

        private bool useSpeech = false;
        public bool UseSpeech
        {
            get { return useSpeech; }
            set
            {
                this.useSpeech = value;
                this.OnSettingChanged("UseSpeech", value);
            }
        }

        private string customVisionTrainingApiKey = string.Empty;
        public string CustomVisionTrainingApiKey
        {
            get { return this.customVisionTrainingApiKey; }
            set
            {
                this.customVisionTrainingApiKey = value;
                this.OnSettingChanged("CustomVisionTrainingApiKey", value);
            }
        }

        private string customVisionTrainingApiKeyEndpoint = DefaultCustomVisionApiEndpoint;
        public string CustomVisionTrainingApiKeyEndpoint
        {
            get { return this.customVisionTrainingApiKeyEndpoint; }
            set
            {
                this.customVisionTrainingApiKeyEndpoint = value;
                this.OnSettingChanged("CustomVisionTrainingApiKeyEndpoint", value);
            }
        }

        private string customVisionPredictionApiKey = string.Empty;
        public string CustomVisionPredictionApiKey
        {
            get { return this.customVisionPredictionApiKey; }
            set
            {
                this.customVisionPredictionApiKey = value;
                this.OnSettingChanged("CustomVisionPredictionApiKey", value);
            }
        }

        private string customVisionPredictionApiKeyEndpoint = DefaultCustomVisionApiEndpoint;
        public string CustomVisionPredictionApiKeyEndpoint
        {
            get { return this.customVisionPredictionApiKeyEndpoint; }
            set
            {
                this.customVisionPredictionApiKeyEndpoint = value;
                this.OnSettingChanged("CustomVisionPredictionApiKeyEndpoint", value);
            }
        }

        private string customFaceApiEndpoint = string.Empty;
        public string CustomFaceApiEndpoint
        {
            get { return this.customFaceApiEndpoint; }
            set
            {
                this.customFaceApiEndpoint = value;
                this.OnSettingChanged("CustomFaceApiEndpoint", value);
            }
        }

        private string customTextToSpeechApiEndpoint = string.Empty;
        public string CustomTextToSpeechApiEndpoint
        {
            get { return this.customTextToSpeechApiEndpoint; }
            set
            {
                this.customTextToSpeechApiEndpoint = value;
                this.OnSettingChanged("CustomTextToSpeechApiEndpoint", value);
            }
        }

        private string customSpeechToTextApiEndpoint = string.Empty;
        public string CustomSpeechToTextApiEndpoint
        {
            get { return this.customSpeechToTextApiEndpoint; }
            set
            {
                this.customSpeechToTextApiEndpoint = value;
                this.OnSettingChanged("CustomSpeechToTextApiEndpoint", value);
            }
        }

        private string customLuisApiEndpoint = string.Empty;
        public string CustomLuisApiEndpoint
        {
            get { return this.customLuisApiEndpoint; }
            set
            {
                this.customLuisApiEndpoint = value;
                this.OnSettingChanged("CustomLuisApiEndpoint", value);
            }
        }

        private string customComputerVisionApiEndpoint = string.Empty;
        public string CustomComputerVisionApiEndpoint
        {
            get { return this.customComputerVisionApiEndpoint; }
            set
            {
                this.customComputerVisionApiEndpoint = value;
                this.OnSettingChanged("CustomComputerVisionApiEndpoint", value);
            }
        }

        private string customTextAnalyticsEndpoint = string.Empty;
        public string CustomTextAnalyticsEndpoint
        {
            get { return this.customTextAnalyticsEndpoint; }
            set
            {
                this.customTextAnalyticsEndpoint = value;
                this.OnSettingChanged("CustomTextAnalyticsEndpoint", value);
            }
        }

        private string translatorTextApiKey = string.Empty;
        public string TranslatorTextApiKey
        {
            get { return translatorTextApiKey; }
            set
            {
                this.translatorTextApiKey = value;
                this.OnSettingChanged("TranslatorTextApiKey", value);
            }
        }

        private string anomalyDetectorApiKey = string.Empty;
        public string AnomalyDetectorApiKey
        {
            get { return anomalyDetectorApiKey; }
            set
            {
                this.anomalyDetectorApiKey = value;
                this.OnSettingChanged("AnomalyDetectorApiKey", value);
            }
        }

        public string[] AvailableCustomVisionApiEndpoints
        {
            get
            {
                return new string[]
                {
                    "https://eastus.api.cognitive.microsoft.com",
                    "https://eastus2.api.cognitive.microsoft.com",
                    "https://southcentralus.api.cognitive.microsoft.com",
                    "https://westus2.api.cognitive.microsoft.com",
                    "https://northcentralus.api.cognitive.microsoft.com",
                    "https://australiaeast.api.cognitive.microsoft.com",
                    "https://southeastasia.api.cognitive.microsoft.com",
                    "https://centralindia.api.cognitive.microsoft.com",
                    "https://japaneast.api.cognitive.microsoft.com",
                    "https://northeurope.api.cognitive.microsoft.com",
                    "https://uksouth.api.cognitive.microsoft.com",
                    "https://westeurope.api.cognitive.microsoft.com"
                };
            }
        }

        public string[] AvailableApiEndpoints
        {
            get
            {
                return new string[]
                {
                    CustomEndpointName,
                    "https://westus.api.cognitive.microsoft.com",
                    "https://westus2.api.cognitive.microsoft.com",
                    "https://eastus.api.cognitive.microsoft.com",
                    "https://eastus2.api.cognitive.microsoft.com",
                    "https://westcentralus.api.cognitive.microsoft.com",
                    "https://southcentralus.api.cognitive.microsoft.com",
                    "https://westeurope.api.cognitive.microsoft.com",
                    "https://northeurope.api.cognitive.microsoft.com",
                    "https://southeastasia.api.cognitive.microsoft.com",
                    "https://eastasia.api.cognitive.microsoft.com",
                    "https://australiaeast.api.cognitive.microsoft.com",
                    "https://brazilsouth.api.cognitive.microsoft.com",
                    "https://canadacentral.api.cognitive.microsoft.com",
                    "https://centralindia.api.cognitive.microsoft.com",
                    "https://uksouth.api.cognitive.microsoft.com",
                    "https://japaneast.api.cognitive.microsoft.com"
                };
            }
        }

        public string[] AvailableTextToSpeechApiEndpoints
        {
            get
            {
                return new string[]
                {
                    CustomEndpointName,
                    "https://eastus.tts.speech.microsoft.com/cognitiveservices/v1"
                };
            }
        }

        public string[] AvailableSpeechToTextApiEndpoints
        {
            get
            {
                return new string[]
                {
                    CustomEndpointName,
                    "wss://eastus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1"
                };
            }
        }
    }
}