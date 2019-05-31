using System;
using System.Configuration;

using TDADataGenerator.Model;
using TDADataGenerator.Storage;

namespace TDADataGenerator
{
    class Program
    {
        static Random random = new Random((int)DateTime.Now.Ticks);

        static void Main(string[] args)
        {
            AzureStackStorageHelper storageHelper = new AzureStackStorageHelper(
                ConfigurationManager.AppSettings["AzureStackStorageConnectionString"],
                ConfigurationManager.AppSettings["AzureStackStorageContainer"]);

            string ns = (random.Next(2) == 1) ? "N" : "S";
            string ew = (random.Next(2) == 1) ? "E" : "W";

            UnfilteredData data = new UnfilteredData(random.Next(15000) / 100, random.Next(15000) / 100, random.Next(10) + 25, $"{random.Next(90)} {random.Next(60)} {random.Next(60)}{ns}", $"{random.Next(180)} {random.Next(60)} {random.Next(60)}{ew}", (random.Next(10000) + 100000).ToString());

            Console.WriteLine(storageHelper.UploadDataToAzureStorage($"SensorData_{DateTime.UtcNow.ToString("MM-dd-yyyy_hhmmss")}", data.ToString()));
        }
    }
}
