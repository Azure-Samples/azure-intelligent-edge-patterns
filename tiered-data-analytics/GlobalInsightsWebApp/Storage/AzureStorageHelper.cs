 //--------------------------------------------------------------------------------------------------
//--
//--
//--------------------------------------------------------------------------------------------------
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace GlobalInsightsWebApp.Storage
{
    class AzureStorageHelper : IStorageHelper
    {
        public string AzureStorageConnectionString { get; set; }
        public string AzureStorageContainer { get; set; }

        public AzureStorageHelper(string azureStorageConnectionString, string azureStorageContainer)
        {
            AzureStorageConnectionString = azureStorageConnectionString;
            AzureStorageContainer = azureStorageContainer;
        }

        #region Azure Helpers
        /// <summary>
        /// Upload a string to Azure blob
        /// </summary>
        /// <param name="data">string data to upload to Azure storage blob</param>
        /// <returns>string representing the status of the upload</returns>
        public string UploadDataToAzureStorage(string blobName, string data)
        {
            try
            {
                // Retrieve storage account from connection string.
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(AzureStorageConnectionString);

                // Create the blob client.
                var blobClient = storageAccount.CreateCloudBlobClient();

                // Retrieve reference to a previously created container.
                var container = blobClient.GetContainerReference(AzureStorageContainer);

                // Retrieve reference to a blob.
                var blockBlob = container.GetBlockBlobReference(blobName);

                // Insert the bytes into a memory stream for upload
                MemoryStream blobStream = new MemoryStream(Encoding.ASCII.GetBytes(data));

                // Upload the stream to the blob
                blockBlob.UploadFromStreamAsync(blobStream);
            }
            catch (Exception ex)
            {
                return $"Error uploading personal data to Azure.  Exception:\r\n{ex.Message}";
            }

            return $"Successfully uploaded personal data file \"{blobName}\" to Azure storage conatiner \"{AzureStorageContainer}\"";
        }

        public string[] GetBlobNamesFromAzureStorage()
        {
            try
            {
                // Retrieve storage account from connection string.
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(AzureStorageConnectionString);

                // Create the blob client.
                var blobClient = storageAccount.CreateCloudBlobClient();

                // Retrieve reference to a previously created container.
                var container = blobClient.GetContainerReference(AzureStorageContainer);
                container.CreateIfNotExistsAsync().GetAwaiter();

                BlobContinuationToken token = null;

                List<IListBlobItem> blobItems = new List<IListBlobItem>();

                do
                {
                    var response = container.ListBlobsSegmentedAsync(token).GetAwaiter().GetResult();
                    token = response.ContinuationToken;
                    blobItems.AddRange(response.Results);
                } while (token != null);

                var blobNames = blobItems.OfType<CloudBlockBlob>().Select( b => b.Name ).ToList();
                return blobNames.ToArray();
            }
            catch
            {
                return null;
            }
        }

        public string DownloadBlobFromAzureStorage(string blobName)
        {
            try
            {
                // Retrieve storage account from connection string.
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(AzureStorageConnectionString);

                // Create the blob client.
                var blobClient = storageAccount.CreateCloudBlobClient();

                // Retrieve reference to a previously created container.
                var container = blobClient.GetContainerReference(AzureStorageContainer);

                CloudBlockBlob blobFile = container.GetBlockBlobReference(blobName);

                return blobFile.DownloadTextAsync().GetAwaiter().GetResult();
            }
            catch
            {
                return null;
            }
        }
        #endregion
    }
}
