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
using System;
using System.Threading.Tasks;
using Windows.UI.Popups;
using Windows.UI.ViewManagement;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234238

namespace IntelligentKioskSample.Views
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class SettingsPage : Page
    {
        public SettingsPage()
        {
            this.InitializeComponent();
            this.DataContext = SettingsHelper.Instance;
        }

        protected override async void OnNavigatedTo(NavigationEventArgs e)
        {
            this.cameraSourceComboBox.ItemsSource = await Util.GetAvailableCameraNamesAsync();
            this.cameraSourceComboBox.SelectedItem = SettingsHelper.Instance.CameraName;
            base.OnNavigatedFrom(e);
        }

        private void OnGenerateNewKeyClicked(object sender, RoutedEventArgs e)
        {
            SettingsHelper.Instance.WorkspaceKey = Guid.NewGuid().ToString();
        }

        private void OnToggleFullScreenClicked(object sender, RoutedEventArgs e)
        {
            var view = ApplicationView.GetForCurrentView();
            if (view.IsFullScreenMode)
            {
                view.ExitFullScreenMode();
            }
            else
            {
                view.TryEnterFullScreenMode();
            }
        }

        private async void OnResetCustomerCounterClicked(object sender, RoutedEventArgs e)
        {
            int resetVal = Util.ToIntSafely(SettingsHelper.Instance.CustomerCounterResetValue, 0);

            await IgniteDataServices.ResetCustomerCounter(resetVal);
        }


        private async void OnResetSettingsClick(object sender, RoutedEventArgs e)
        {
            await Util.ConfirmActionAndExecute("This will reset all the settings and erase your changes. Confirm?",
                async () =>
                {
                    await Task.Run(() => SettingsHelper.Instance.RestoreAllSettings());
                    await new MessageDialog("Settings restored. Please restart the application to load the default settings.").ShowAsync();
                });
        }

        private void OnCameraSourceSelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (this.cameraSourceComboBox.SelectedItem != null)
            {
                SettingsHelper.Instance.CameraName = this.cameraSourceComboBox.SelectedItem.ToString();
            }
        }

        private void ResetMallKioskSettingsButtonClick(object sender, RoutedEventArgs e)
        {
            SettingsHelper.Instance.RestoreMallKioskSettingsToDefaultFile();
        }

        private async void KeyTestFlyoutOpened(object sender, object e)
        {
            this.keyTestResultTextBox.Text = "";

            await CallApiAndReportResult("Face API Test: ", async () => await CognitiveServiceApiKeyTester.TestFaceApiKeyAsync(
                    SettingsHelper.Instance.FaceApiKey, SettingsHelper.Instance.FaceApiKeyEndpoint));

            await CallApiAndReportResult("Text To Speech API Test: ", async () => await CognitiveServiceApiKeyTester.TestTextToSpeechApiKeyAsync(
                    SettingsHelper.Instance.TextToSpeechApiKey, SettingsHelper.Instance.TextToSpeechApiKeyEndpoint));

            await CallApiAndReportResult("Speech To Text API Test: ", async () => await CognitiveServiceApiKeyTester.TestSpeechToTextApiKeyAsync(
                    SettingsHelper.Instance.SpeechToTextApiKey, SettingsHelper.Instance.SpeechToTextApiKeyEndpoint));

            await CallApiAndReportResult("LUIS API Test: ", async () => await CognitiveServiceApiKeyTester.TestLuisApiKeyAsync(
                    SettingsHelper.Instance.LuisApiKey, SettingsHelper.Instance.LuisApiKeyEndpoint));

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.VisionApiKey)
            //    ? CallApiAndReportResult("Computer Vision API Test: ", async () => await CognitiveServiceApiKeyTester.TestComputerVisionApiKeyAsync(
            //        SettingsHelper.Instance.VisionApiKey, SettingsHelper.Instance.VisionApiKeyEndpoint))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.CustomVisionTrainingApiKey)
            //    ? CallApiAndReportResult("Custom Vision Training API Test: ", async () => await CognitiveServiceApiKeyTester.TestCustomVisionTrainingApiKeyAsync(
            //        SettingsHelper.Instance.CustomVisionTrainingApiKey, SettingsHelper.Instance.CustomVisionTrainingApiKeyEndpoint))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.BingSearchApiKey)
            //    ? CallApiAndReportResult("Bing Search API Test: ", async () => await CognitiveServiceApiKeyTester.TestBingSearchApiKeyAsync(SettingsHelper.Instance.BingSearchApiKey))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.BingAutoSuggestionApiKey)
            //    ? CallApiAndReportResult("Bing Auto Suggestion API Test: ", async () => await CognitiveServiceApiKeyTester.TestBingAutosuggestApiKeyAsync(SettingsHelper.Instance.BingAutoSuggestionApiKey))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.TextAnalyticsKey)
            //    ? CallApiAndReportResult("Text Analytics API Test: ", async () => await CognitiveServiceApiKeyTester.TestTextAnalyticsApiKeyAsync(
            //        SettingsHelper.Instance.TextAnalyticsKey, SettingsHelper.Instance.TextAnalyticsApiKeyEndpoint))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.TranslatorTextApiKey)
            //    ? CallApiAndReportResult("Translator Text API Test: ", async () => await CognitiveServiceApiKeyTester.TestTranslatorTextApiKeyAsync(SettingsHelper.Instance.TranslatorTextApiKey))
            //    : Task.CompletedTask);

            //await (!string.IsNullOrEmpty(SettingsHelper.Instance.AnomalyDetectorApiKey)
            //    ? CallApiAndReportResult("Anomaly Detector API Test: ", async () => await CognitiveServiceApiKeyTester.TestAnomalyDetectorApiKeyAsync(SettingsHelper.Instance.AnomalyDetectorApiKey))
            //    : Task.CompletedTask);
        }

        private async Task CallApiAndReportResult(string testName, Func<Task> testTask)
        {
            try
            {
                this.keyTestResultTextBox.Text += testName;
                await testTask();
                this.keyTestResultTextBox.Text += "Passed!\n";
            }
            catch (Exception ex)
            {
                this.keyTestResultTextBox.Text += string.Format("Failed! Error message: \"{0}\"\n", Util.GetMessageFromException(ex));
            }
        }

        private async void OnTestLuisAppFlyoutOpened(object sender, object e)
        {
            try
            {
                // Run LUIS app tests
                this.luisAppTestResultTextBox.Text = "";
                string[] utterances = {
                    "I'd like to get a hat",
                    "I am more interested in sunglasses",
                    "Caps for me",
                    "Blah-blah-blah"
                };
                for (int i = 0; i < utterances.Length; i++)
                {
                    string entity = await LuisServiceHelper.GetEntity(utterances[i]);
                    this.luisAppTestResultTextBox.Text += $"utterance: '{utterances[i]}'\n=> entity: '{entity}'\n";
                }
            }
            catch (Exception ex)
            {
                this.luisAppTestResultTextBox.Text = ex.Message;
            }
        }

        private void OnTestBackendFlyoutOpened(object sender, object e)
        {
            try
            {
                // Run DB tests
                var customers = IgniteDataAccess.GetCustomers();
                string testGetCustomers = (customers != null) ? customers.Count.ToString() : "FAIL";
                string unregCustomerGuid = "00000000-0000-0000-0000-000000000000";

                bool createCustomerRes = IgniteDataAccess.CreateCustomerRecord(unregCustomerGuid, "UNREGISTERED");
                string testCreateCustomerRecord = createCustomerRes ? "OK" : "FAIL";

                bool createNewTransactionRes = IgniteDataAccess.CreateNewTransaction(11110, 1, unregCustomerGuid);
                string testCreateNewTransaction = createNewTransactionRes ? "OK" : "FAIL";

                var customerInfo = IgniteDataAccess.GetCustomerInfo(unregCustomerGuid);
                string testGetCustomerInfo = (customerInfo?.CustomerName == "UNREGISTERED" &&
                    customerInfo?.SourceItemId == 11110) ? "OK" : "FAIL";

                var inventoryStats = IgniteDataAccess.GetInventoryStats();
                string testGetInventoryStats = "FAIL";
                foreach (InventoryItemStats iist in inventoryStats)
                {
                    if (iist.ItemId == 11110)
                    {
                        testGetInventoryStats = iist.RemainingInventory.ToString();
                    }
                }

                this.backendTestResultTextBox.Text = $"GetCustomers.Count: {testGetCustomers}\n" +
                    $"CreateCutomerRecord: {testCreateCustomerRecord}\n" +
                    $"CreateNewTransaction: {testCreateNewTransaction}\n" +
                    $"GetCustomerInfo: {testGetCustomerInfo}\n" +
                    $"GetInventoryStats.RemainingInventory: {testGetInventoryStats}";
            }
            catch (Exception ex)
            {
                this.backendTestResultTextBox.Text = $"Exception: {ex.Message}";
            }
        }
    }
}
