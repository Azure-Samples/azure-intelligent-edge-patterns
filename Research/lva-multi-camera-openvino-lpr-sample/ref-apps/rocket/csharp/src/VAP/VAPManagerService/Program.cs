// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace VAPManagerService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
            .AddJsonFile("hosting.json", optional: true)
            .AddCommandLine(args)
            .Build();

            CreateHostBuilder(config).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(IConfigurationRoot config) =>
            Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder
                    .UseUrls("http://0.0.0.0:7788")
                    .UseConfiguration(config)
                    .UseStartup<StartupJavaScript>();
                });
    }
}
