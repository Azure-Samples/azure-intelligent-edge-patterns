// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System.Collections.Generic;
using DNNDetector.Model;
using Utils.Config;

namespace PostProcessor
{
    public class DataPersistence
    {
        static AzureBlobProcessor blobProcessor = new AzureBlobProcessor();
        
        // force precise initialization
        static DataPersistence() { }

        public static void PersistResult(int frameIndex, List<Item> detectionResult, string containerName)
        {
            if (detectionResult != null && detectionResult.Count != 0)
            {
                foreach (Item it in detectionResult)
                {
                    string blobName = it.Model == "Cheap" ? $@"frame-{frameIndex}-Cheap-{it.Confidence}.jpg" : $@"frame-{frameIndex}-Heavy-{it.Confidence}.jpg";
                    string blobUri = SendDataToCloud(containerName, blobName, @OutputFolder.OutputFolderAll + blobName);
                }
            }
        }

        public static string SendDataToCloud(string containerName, string blobName, string sourceFile)
        {
            return blobProcessor.UploadFileAsync(containerName, blobName, sourceFile).GetAwaiter().GetResult();
        }
    }
}
