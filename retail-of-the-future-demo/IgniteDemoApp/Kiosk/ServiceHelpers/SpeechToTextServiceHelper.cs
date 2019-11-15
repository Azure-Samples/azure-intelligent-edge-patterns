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

using Microsoft.CognitiveServices.Speech;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Windows.Media.Core;
using Windows.Media.Playback;
using Windows.Media.Capture;
using Windows.Storage;

namespace ServiceHelpers
{
    public class SpeechToTextServiceHelper
    {
        public readonly static int RetryCountOnQuotaLimitError = 6;
        public readonly static int RetryDelayOnQuotaLimitError = 500;

        private static SpeechConfig speechConfig;

        public static Action Throttled;

        private static string apiKey;
        public static string ApiKey
        {
            get { return apiKey; }
            set
            {
                var changed = apiKey != value;
                apiKey = value;
                if (changed)
                {
                    InitializeSpeechToTextServiceClient();
                }
            }
        }

        private static string apiEndpoint;
        public static string ApiEndpoint
        {
            get { return apiEndpoint; }
            set
            {
                var changed = apiEndpoint != value;
                apiEndpoint = value;
                if (changed)
                {
                    InitializeSpeechToTextServiceClient();
                }
            }
        }

        static SpeechToTextServiceHelper()
        {
            InitializeSpeechToTextServiceClient();            
        }

        private static void InitializeSpeechToTextServiceClient()
        {
            bool hasEndpoint = !string.IsNullOrEmpty(ApiEndpoint) ? Uri.IsWellFormedUriString(ApiEndpoint, UriKind.Absolute) : false;

            Debug.WriteLine(hasEndpoint);

            if (!hasEndpoint)
            {
                Console.WriteLine("no uri");
            }
            else
            {
                speechConfig = SpeechConfig.FromEndpoint(new Uri(ApiEndpoint), ApiKey);
                Console.WriteLine("Initializing speech engine");

            }
        }

        public static async Task<string> GetTextFromSpeechAsync()
        {

            //speechConfig.SpeechRecognitionLanguage = "en-US";
            string resultText = String.Empty;

            // Creates a speech recognizer using microphone as audio input.
            using (var recognizer = new SpeechRecognizer(speechConfig))
            {
                // Starts speech recognition, and returns after a single utterance is recognized. The end of a
                // single utterance is determined by listening for silence at the end or until a maximum of 15
                // seconds of audio is processed.  The task returns the recognition text as result.
                // Note: Since RecognizeOnceAsync() returns only a single utterance, it is suitable only for single
                // shot recognition like command or query.
                // For long-running multi-utterance recognition, use StartContinuousRecognitionAsync() instead.
                var result = await recognizer.RecognizeOnceAsync().ConfigureAwait(false);

                // Checks result.
                string str;
                if (result.Reason != ResultReason.RecognizedSpeech)
                {
                    str = $"Speech Recognition Failed. '{result.Reason.ToString()}'";
                }
                else
                {
                    resultText = result.Text;
                    str = $"Recognized: '{resultText}'";
                }
                Debug.WriteLine(str);
            }
            return resultText;
        }
    }
}