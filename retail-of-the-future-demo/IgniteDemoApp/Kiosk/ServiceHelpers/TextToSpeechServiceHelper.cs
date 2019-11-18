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
using Windows.Storage;

namespace ServiceHelpers
{
    public class TextToSpeechServiceHelper
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
                    InitializeTextToSpeechServiceClient();
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
                    InitializeTextToSpeechServiceClient();
                }
            }
        }

        private static MediaPlayer mediaPlayer;

        static TextToSpeechServiceHelper()
        {
            InitializeTextToSpeechServiceClient();            
        }

        private static void InitializeTextToSpeechServiceClient()
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
                if (mediaPlayer == null)
                {
                    mediaPlayer = new MediaPlayer();
                }
                Console.WriteLine("Initializing speech engine");
            }
        }

        /// <summary>
        /// a task that converts text to speech and speaks it (on a separate thread)
        /// </summary>
        /// <param name="textToSpeak">plain text to speak</param>
        /// <returns>task result is the number of milliseconds to let the playback to complete</returns>
        public static async Task<int> SpeakTextAsync(string textToSpeak)
        {
            using (var synthesizer = new SpeechSynthesizer(speechConfig, null))
            {
                // Receive a text from "Text for Synthesizing" text box and synthesize it to speaker.
                string str = "<speak version=\"1.0\"";
                str += " xmlns=\"http://www.w3.org/2001/10/synthesis\"";
                str += " xml:lang=\"en-US\">";
                //str += $"<voice name=\"{this.SynthesisLanguage}\">";
                str += "<voice name=\"en-US-Jessa24kRUS\">";
                //str += "<mstts:express-as type=\"cheerful\">";
                str += textToSpeak; // text to speak
                //str += "</mstts:express-as>";
                str += "</voice>";
                str += "</speak>";

                Debug.WriteLine(speechConfig.AuthorizationToken);
                

                using (var result = await synthesizer.SpeakSsmlAsync(str).ConfigureAwait(false))  // REVIEW: continue on the caller's thread?
                {
                    // Checks result.
                    
                    Debug.WriteLine(result.Reason);
                    

                    if (result.Reason == ResultReason.SynthesizingAudioCompleted)
                    {

                        // Since native playback is not yet supported on UWP yet (currently only supported on Windows/Linux Desktop),
                        // use the WinRT API to play audio here as a short term solution

                        using (var audioStream = AudioDataStream.FromResult(result))
                        {
                            // Save synthesized audio data as a wave file and user MediaPlayer to play it
                            var filePath = Path.Combine(ApplicationData.Current.LocalFolder.Path, "outputaudio_for_playback.wav");
                            await audioStream.SaveToWaveFileAsync(filePath);

                            MediaSource mySource = MediaSource.CreateFromStorageFile(await StorageFile.GetFileFromPathAsync(filePath));
                            mediaPlayer.Source = mySource;
                            mediaPlayer.Play();
                            // Duration is not updated immediately (by MediaPlayer), so we have to be careful how we calculate the delays
                            int msWaitedToAccuireDelay = 0;
                            while (!mySource.Duration.HasValue && msWaitedToAccuireDelay < 5000) 
                            {
                                await Task.Delay(5);  
                                msWaitedToAccuireDelay += 5;
                            }
                            int msRemainingDelay = (int)mySource.Duration.GetValueOrDefault().TotalMilliseconds;
                            return msRemainingDelay;
                        }
                    }
                    
                }
            }

            return 0;
        }
    }
}