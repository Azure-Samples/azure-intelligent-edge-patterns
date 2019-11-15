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

using Microsoft.Azure.CognitiveServices.Language.LUIS.Runtime;
using Microsoft.Azure.CognitiveServices.Language.LUIS.Runtime.Models;
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
    public class LuisServiceHelper
    {
        public readonly static int RetryCountOnQuotaLimitError = 6;
        public readonly static int RetryDelayOnQuotaLimitError = 500;

        //private static SpeechConfig speechConfig { get; set; }
        public static LUISRuntimeClient luisClient;

        public static Action Throttled;

        private static string luisAppId;
        public static string LuisAppId
        {
            get { return luisAppId; }
            set
            {
                var changed = luisAppId != value;
                luisAppId = value;
                if (changed)
                {
                    InitializeLuisServiceClient();
                }
            }
        }

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
                    InitializeLuisServiceClient();
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
                    InitializeLuisServiceClient();
                }
            }
        }

        static LuisServiceHelper()
        {
            InitializeLuisServiceClient();
        }

        private static void InitializeLuisServiceClient()
        {
            bool hasEndpoint = !string.IsNullOrEmpty(ApiEndpoint) ? Uri.IsWellFormedUriString(ApiEndpoint, UriKind.Absolute) : false;

            Debug.WriteLine(hasEndpoint);

            if (!hasEndpoint)
            {
                Console.WriteLine("no uri");
            }
            else
            {
                luisClient = new LUISRuntimeClient(new ApiKeyServiceClientCredentials(ApiKey));
                luisClient.Endpoint = ApiEndpoint;
            }
        }

        public static async Task<string> GetEntity(string speechInput)
        {
            Debug.WriteLine($"AppID: {LuisAppId}\nEndpoint: {ApiEndpoint}\nKey: {ApiKey}");

            if (String.IsNullOrEmpty(speechInput))
            {
                return null;
            }

            LuisResult result = null;
            string entity = "";
            result = await luisClient.Prediction.ResolveAsync(LuisAppId, speechInput);

            try
            {
                entity = ((Newtonsoft.Json.Linq.JValue)((Newtonsoft.Json.Linq.JContainer)result.Entities.First().AdditionalProperties["resolution"]).First.First.First).Value as string;
            }
            catch (Exception) 
            {
                Debug.WriteLine($"Unexpected LUIS result from {speechInput}");
            }

            Debug.WriteLine($"Entity Detected: {entity}");
            return entity;
        }
    }
}