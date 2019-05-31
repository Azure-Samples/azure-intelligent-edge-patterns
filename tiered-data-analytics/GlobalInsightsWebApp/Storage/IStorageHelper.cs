using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GlobalInsightsWebApp.Storage
{
    interface IStorageHelper
    {
        string UploadDataToAzureStorage(string blobName, string data);
        string[] GetBlobNamesFromAzureStorage();
        string DownloadBlobFromAzureStorage(string blobName);
    }
}
