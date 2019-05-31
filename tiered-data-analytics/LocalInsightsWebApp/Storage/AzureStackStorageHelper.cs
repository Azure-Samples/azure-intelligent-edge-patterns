using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Auth;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LocalInsightsWebApp.Storage
{
    class AzureStackStorageHelper : IStorageHelper
    {
        public Microsoft.Rest.ServiceClientCredentials AzsServiceCredentials { get; set; }
        public string AzS_StorageEndPoint { get; set; }
        public string AzS_StorageAccount { get; set; }
        public string AzS_StorageKey { get; set; }
        public string AzS_StorageContainerName { get; set; }

        public AzureStackStorageHelper(
            string azsStorageEndPoint,
            string azsStorageAccount,
            string azsStorageKey,
            string azsStorageContainerName)
        {
            AzS_StorageEndPoint = azsStorageEndPoint;
            AzS_StorageAccount = azsStorageAccount;
            AzS_StorageKey = azsStorageKey;
            AzS_StorageContainerName = azsStorageContainerName;
        }

        #region AzureStack Helpers
        public string[] GetBlobNamesFromAzureStorage()
        {
            try
            {
                StorageCredentials credentials = new StorageCredentials(AzS_StorageAccount, AzS_StorageKey);
                CloudStorageAccount storageAccount = new CloudStorageAccount(credentials, AzS_StorageEndPoint, true);

                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                CloudBlobContainer blobContainer = blobClient.GetContainerReference(AzS_StorageContainerName);
                blobContainer.CreateIfNotExistsAsync().GetAwaiter();
                BlobContinuationToken continuationToken = null;
                OperationContext context = new OperationContext();
                BlobRequestOptions options = new BlobRequestOptions();

                var blobReferences = blobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.None, 1000, continuationToken, options, context).GetAwaiter().GetResult();

                var blobNames = blobReferences.Results.Select(b => b.Uri.AbsolutePath).ToList();
                return blobNames.ToArray();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public string DownloadBlobFromAzureStorage(string blobName)
        {
            try
            {
                StorageCredentials credentials = new StorageCredentials(AzS_StorageAccount, AzS_StorageKey);
                CloudStorageAccount storageAccount = new CloudStorageAccount(credentials, AzS_StorageEndPoint, true);

                CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();
                CloudBlobContainer blobContainer = blobClient.GetContainerReference(AzS_StorageContainerName);
                CloudBlockBlob blobFile = blobContainer.GetBlockBlobReference(blobName.Split('/')[2]);

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
