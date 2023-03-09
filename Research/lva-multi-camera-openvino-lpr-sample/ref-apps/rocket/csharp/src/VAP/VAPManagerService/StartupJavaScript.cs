// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Logging;

namespace VAPManagerService
{
    public class StartupJavaScript
    {
        public StartupJavaScript(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddMvc(options => options.OutputFormatters.RemoveType<StringOutputFormatter>()).
                AddNewtonsoftJson();
            services.AddLogging(
                builder =>
                {
                    builder.AddFilter("Microsoft", LogLevel.Warning)
                           .AddFilter("System", LogLevel.Warning)
                           .AddFilter("NToastNotify", LogLevel.Warning)
                           .AddConsole();
                });

            //initialize VAP
            string sfactor = Configuration.GetValue<string>("sfactor");
            string rfactor = Configuration.GetValue<string>("rfactor");
            string bsize = Configuration.GetValue<string>("bsize");
            string uptran = Configuration.GetValue<string>("uptran");
            string downtran = Configuration.GetValue<string>("downtran");
            string line = Configuration.GetValue<string>("line");
            string pipeline = Configuration.GetValue<string>("pipeline");
            string[] arg = new string[] { "", pipeline, line, sfactor, rfactor, bsize, uptran, downtran };
            string catRaw = Configuration.GetValue<string>("cat");
            if (catRaw != null)
            {
                string[] cat = catRaw.Split(' ');
                arg = arg.Concat(cat).ToArray();
            }
            VideoPipelineCore.VAPCore.Initialize(arg);
        }

        #region snippet_configure
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseDefaultFiles();

            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
        #endregion
    }
}
