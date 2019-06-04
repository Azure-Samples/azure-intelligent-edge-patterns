using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LocalInsightsWebApp.Storage
{
    interface IStorageHelper
    {
        string[] GetBlobNamesFromAzureStorage();
        string DownloadBlobFromAzureStorage(string blobName);
    }
}
