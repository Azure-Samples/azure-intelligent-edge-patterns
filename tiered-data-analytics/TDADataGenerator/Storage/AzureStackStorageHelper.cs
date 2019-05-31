using Microsoft.Rest.Azure.Authentication;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TDADataGenerator.Storage
{
    class AzureStackStorageHelper
    {
        public string AzS_StorageConnectionString { get; set; }
        public string AzS_StorageContainerName { get; set; }

        public AzureStackStorageHelper(
            string azsStorageConnectionString,
            string azsStorageContainerName)
        {
            AzS_StorageConnectionString = azsStorageConnectionString;
            AzS_StorageContainerName = azsStorageContainerName;
        }

        #region AzureStack Helpers
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
                Console.WriteLine("Creating CloudStorageAccount...");
                CloudStorageAccount storageAccount = CloudStorageAccount.Parse(AzS_StorageConnectionString);

                // Create the blob client.
                Console.WriteLine("Creating CloudBlobClient...");
                var blobClient = storageAccount.CreateCloudBlobClient();

                // Retrieve reference to a previously created container.
                Console.WriteLine("Getting container reference...");
                var container = blobClient.GetContainerReference(AzS_StorageContainerName);
                container.CreateIfNotExists();

                // Retrieve reference to a blob.
                Console.WriteLine("Getting blob reference...");
                var blockBlob = container.GetBlockBlobReference(blobName);

                // Insert the bytes into a memory stream for upload
                MemoryStream blobStream = new MemoryStream(Encoding.ASCII.GetBytes(data));

                // Upload the stream to the blob
                Console.WriteLine("Uploading to AzureStack...");
                blockBlob.UploadFromStreamAsync(blobStream).GetAwaiter().GetResult();

                return $"Successfully uploaded personal data file \"{blobName}\" to Azure storage conatiner \"{AzS_StorageContainerName}\"";
            }
            catch (Exception ex)
            {
                return $"Error uploading personal data to Azure.  Exception:\r\n{ex.Message}";
            }
        }
        #endregion
    }
}
