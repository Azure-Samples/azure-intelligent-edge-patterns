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

using System;
using Windows.ApplicationModel;
using Windows.ApplicationModel.Activation;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Navigation;

// The Blank Application template is documented at http://go.microsoft.com/fwlink/?LinkId=402347&clcid=0x409

namespace IntelligentKioskSample
{
    using IntelligentKioskSample.Views.Ignite;
    using ServiceHelpers;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Threading.Tasks;
    using Views;
    using Windows.ApplicationModel.Core;
    using Windows.Data.Xml.Dom;
    using Windows.UI.Notifications;
    using Windows.UI.ViewManagement;

    /// <summary>
    /// Provides application-specific behavior to supplement the default Application class.
    /// </summary>
    sealed partial class App : Application
    {
        /// <summary>
        /// Initializes the singleton application object.  This is the first line of authored code
        /// executed, and as such is the logical equivalent of main() or WinMain().
        /// </summary>
        public App()
        {
            this.InitializeComponent();
            this.Suspending += OnSuspending;
            ApplicationView.PreferredLaunchWindowingMode = ApplicationViewWindowingMode.FullScreen;
        }

        /// <summary>
        /// Invoked when the application is launched normally by the end user.  Other entry points
        /// will be used such as when the application is launched to open a specific file.
        /// </summary>
        /// <param name="e">Details about the launch request and process.</param>
        protected override void OnLaunched(LaunchActivatedEventArgs e)
        {
#if DEBUG
            if (System.Diagnostics.Debugger.IsAttached)
            {
                // This just gets in the way.
                //this.DebugSettings.EnableFrameRateCounter = true;
            }
#endif

            //AppShell shell = Window.Current.Content as AppShell;
            DemoAppShell shell = Window.Current.Content as DemoAppShell;

            // Do not repeat app initialization when the Window already has content,
            // just ensure that the window is active
            if (shell == null)
            {
                // propagate settings to the core library
                SettingsHelper.Instance.SettingsChanged += (target, args) =>
                {
                    FaceServiceHelper.ApiKey = SettingsHelper.Instance.FaceApiKey;
                    FaceServiceHelper.ApiEndpoint = SettingsHelper.Instance.FaceApiKeyEndpoint;
                    VisionServiceHelper.ApiKey = SettingsHelper.Instance.VisionApiKey;
                    VisionServiceHelper.ApiEndpoint = SettingsHelper.Instance.VisionApiKeyEndpoint;
                    BingSearchHelper.SearchApiKey = SettingsHelper.Instance.BingSearchApiKey;
                    BingSearchHelper.AutoSuggestionApiKey = SettingsHelper.Instance.BingAutoSuggestionApiKey;
                    TextAnalyticsHelper.ApiKey = SettingsHelper.Instance.TextAnalyticsKey;
                    TextAnalyticsHelper.ApiEndpoint = SettingsHelper.Instance.TextAnalyticsApiKeyEndpoint;
                    TextAnalyticsHelper.ApiKey = SettingsHelper.Instance.TextAnalyticsKey;
                    ImageAnalyzer.PeopleGroupsUserDataFilter = SettingsHelper.Instance.WorkspaceKey;
                    FaceListManager.FaceListsUserDataFilter = SettingsHelper.Instance.WorkspaceKey;
                    CoreUtil.MinDetectableFaceCoveragePercentage = SettingsHelper.Instance.MinDetectableFaceCoveragePercentage;
                    AnomalyDetectorHelper.ApiKey = SettingsHelper.Instance.AnomalyDetectorApiKey;

                    // helpers added to support IgniteDemoApp
                    TextToSpeechServiceHelper.ApiKey = SettingsHelper.Instance.TextToSpeechApiKey;
                    TextToSpeechServiceHelper.ApiEndpoint = SettingsHelper.Instance.TextToSpeechApiKeyEndpoint;
                    SpeechToTextServiceHelper.ApiKey = SettingsHelper.Instance.SpeechToTextApiKey;
                    SpeechToTextServiceHelper.ApiEndpoint = SettingsHelper.Instance.SpeechToTextApiKeyEndpoint;
                    LuisServiceHelper.ApiKey = SettingsHelper.Instance.LuisApiKey;
                    LuisServiceHelper.ApiEndpoint = SettingsHelper.Instance.LuisApiKeyEndpoint;
                    LuisServiceHelper.LuisAppId = SettingsHelper.Instance.LuisAppId;
                };

                // callbacks for core library
                FaceServiceHelper.Throttled = () => ShowToastNotification("The Face API is throttling your requests. Consider upgrading to a Premium Key.");
                VisionServiceHelper.Throttled = () => ShowToastNotification("The Vision API is throttling your requests. Consider upgrading to a Premium Key.");
                ErrorTrackingHelper.TrackException = (ex, msg) => LogException(ex, msg);
                ErrorTrackingHelper.GenericApiCallExceptionHandler = Util.GenericApiCallExceptionHandler;

                SettingsHelper.Instance.Initialize();

                // Create a AppShell to act as the navigation context and navigate to the first page
                //shell = new AppShell();
                shell = new DemoAppShell();

                // Set the default language
                shell.Language = Windows.Globalization.ApplicationLanguages.Languages[0];

                shell.AppFrame.NavigationFailed += OnNavigationFailed;

                if (e.PreviousExecutionState == ApplicationExecutionState.Terminated)
                {
                    //TODO: Load state from previously suspended application
                }

                // Set the TitleBar to Dark Theme
                //var appView = Windows.UI.ViewManagement.ApplicationView.GetForCurrentView();
                //var titleBar = appView.TitleBar;
                //titleBar.BackgroundColor = Windows.UI.Colors.Black;
                //titleBar.ForegroundColor = Windows.UI.Colors.White;
                //titleBar.ButtonBackgroundColor = Windows.UI.Colors.Black;
                //titleBar.ButtonForegroundColor = Windows.UI.Colors.White;

                CoreApplication.GetCurrentView().TitleBar.ExtendViewIntoTitleBar = false;
            }

            // Place our app shell in the current Window
            Window.Current.Content = shell;

            if (shell.AppFrame.Content == null)
            {
                // When the navigation stack isn't restored, navigate to the first page
                // suppressing the initial entrance animation.
                //shell.AppFrame.Navigate(typeof(DemoLauncherPage), e.Arguments, new Windows.UI.Xaml.Media.Animation.SuppressNavigationTransitionInfo());
                shell.AppFrame.Navigate(typeof(FaqPage), e.Arguments, new Windows.UI.Xaml.Media.Animation.SuppressNavigationTransitionInfo());
            }

            // Ensure the current window is active
            Window.Current.Activate();

            // Trigger a test of the api keys in the background to alert the user if any of them are bad (e.g. expired, out of quota, etc)
            //TestApiKeysAsync();
        }

        private static async void TestApiKeysAsync()
        {
            List<Task> testTasks = new List<Task>
            {
                !string.IsNullOrEmpty(SettingsHelper.Instance.FaceApiKey)
                ? CognitiveServiceApiKeyTester.TestFaceApiKeyAsync(SettingsHelper.Instance.FaceApiKey, SettingsHelper.Instance.FaceApiKeyEndpoint)
                : Task.CompletedTask,

                !string.IsNullOrEmpty(SettingsHelper.Instance.TextToSpeechApiKey)
                ? CognitiveServiceApiKeyTester.TestTextToSpeechApiKeyAsync(SettingsHelper.Instance.TextToSpeechApiKey, SettingsHelper.Instance.TextToSpeechApiKeyEndpoint)
                : Task.CompletedTask,

                !string.IsNullOrEmpty(SettingsHelper.Instance.SpeechToTextApiKey)
                ? CognitiveServiceApiKeyTester.TestSpeechToTextApiKeyAsync(SettingsHelper.Instance.SpeechToTextApiKey, SettingsHelper.Instance.SpeechToTextApiKeyEndpoint)
                : Task.CompletedTask,

                !string.IsNullOrEmpty(SettingsHelper.Instance.LuisApiKey)
                ? CognitiveServiceApiKeyTester.TestLuisApiKeyAsync(SettingsHelper.Instance.LuisApiKey, SettingsHelper.Instance.LuisApiKeyEndpoint)
                : Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.VisionApiKey)
                //? CognitiveServiceApiKeyTester.TestComputerVisionApiKeyAsync(SettingsHelper.Instance.VisionApiKey, SettingsHelper.Instance.VisionApiKeyEndpoint)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.CustomVisionTrainingApiKey)
                //? CognitiveServiceApiKeyTester.TestCustomVisionTrainingApiKeyAsync(SettingsHelper.Instance.CustomVisionTrainingApiKey, SettingsHelper.Instance.CustomVisionTrainingApiKeyEndpoint)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.BingSearchApiKey)
                //? CognitiveServiceApiKeyTester.TestBingSearchApiKeyAsync(SettingsHelper.Instance.BingSearchApiKey)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.BingAutoSuggestionApiKey)
                //? CognitiveServiceApiKeyTester.TestBingAutosuggestApiKeyAsync(SettingsHelper.Instance.BingAutoSuggestionApiKey)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.TextAnalyticsKey)
                //? CognitiveServiceApiKeyTester.TestTextAnalyticsApiKeyAsync(SettingsHelper.Instance.TextAnalyticsKey, SettingsHelper.Instance.TextAnalyticsApiKeyEndpoint)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.TranslatorTextApiKey)
                //? CognitiveServiceApiKeyTester.TestTranslatorTextApiKeyAsync(SettingsHelper.Instance.TranslatorTextApiKey)
                //: Task.CompletedTask,

                //!string.IsNullOrEmpty(SettingsHelper.Instance.AnomalyDetectorApiKey)
                //? CognitiveServiceApiKeyTester.TestAnomalyDetectorApiKeyAsync(SettingsHelper.Instance.AnomalyDetectorApiKey)
                //: Task.CompletedTask
            };

            try
            {
                await Task.WhenAll(testTasks);
            }
            catch (Exception)
            {
                ShowToastNotification("Failure validating your API Keys. Please run the Key Validation Test in the Settings Page for more details.");
            }
        }

        private static void ShowToastNotification(string errorMessage)
        {
            ToastTemplateType toastTemplate = ToastTemplateType.ToastText02;
            XmlDocument toastXml = ToastNotificationManager.GetTemplateContent(toastTemplate);
            XmlNodeList toastTextElements = toastXml.GetElementsByTagName("text");
            toastTextElements[0].AppendChild(toastXml.CreateTextNode("Intelligent Kiosk"));
            toastTextElements[1].AppendChild(toastXml.CreateTextNode(errorMessage));

            ToastNotification toast = new ToastNotification(toastXml);
            ToastNotificationManager.CreateToastNotifier().Show(toast);
        }

        private static void LogException(Exception ex, string message)
        {
            Debug.WriteLine("Error detected! Exception: \"{0}\", More info: \"{1}\".", ex.Message, message);
        }

        /// <summary>
        /// Invoked when Navigation to a certain page fails
        /// </summary>
        /// <param name="sender">The Frame which failed navigation</param>
        /// <param name="e">Details about the navigation failure</param>
        private void OnNavigationFailed(object sender, NavigationFailedEventArgs e)
        {
            throw new Exception("Failed to load Page " + e.SourcePageType.FullName);
        }

        /// <summary>
        /// Invoked when application execution is being suspended.  Application state is saved
        /// without knowing whether the application will be terminated or resumed with the contents
        /// of memory still intact.
        /// </summary>
        /// <param name="sender">The source of the suspend request.</param>
        /// <param name="e">Details about the suspend request.</param>
        private void OnSuspending(object sender, SuspendingEventArgs e)
        {
            var deferral = e.SuspendingOperation.GetDeferral();

            ////Save application state and stop any background activity
            //var currentView = (Window.Current.Content as AppShell)?.AppFrame?.Content;

            //if (currentView != null && currentView.GetType() == typeof(RealTimeDemo))
            //{
            //    await (currentView as RealTimeDemo).HandleApplicationShutdownAsync();
            //}

            deferral.Complete();
        }
    }
}
