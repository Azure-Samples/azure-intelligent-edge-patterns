using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using CSharpClient;
using Grpc.Core;
using Newtonsoft.Json;
using Tensorflow.Serving;

namespace resnet
{
    internal class Program
    {
        private static readonly string errorMessage = "" + Environment.NewLine + "dotnet resnet.dll [url(without port)] [path/to/local/image] [serviceName] <auth_key> <use_ssl (true/false - false if absent)> ";

        private static int Main(string[] args)
        {
            return MainAsync(args).Result;
        }

        private static async Task<int> MainAsync(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine($"Use as {errorMessage}");
                return 1;
            }

            var host = args[0];
            var image = args[1];
            var serviceName = args[2];
            
            string auth = null;
            if (args.Length > 3)
            {
                auth = args[4];
                Console.WriteLine(!string.IsNullOrEmpty(auth) ? "Using auth" : "Not using auth");
            }

            var useSSL = false;
            if (args.Length > 4)
            {
                var useSslString = args[5];
                var parsed = bool.TryParse(useSslString, out useSSL);
                Console.WriteLine(useSSL ? "Using SSL" : "Not using SSL");
            }

            

            var client = new ScoringClient(host, useSSL ? 443 : 80, useSSL, auth, serviceName);

            using (var content = File.OpenRead(image))
            {
                IScoringRequest request = new ImageRequest("Placeholder:0", content);
                //Dimensions depend on model - client.ScoreAsync<float[,,,,]>(request); for ssd-vgg
                var result = await client.ScoreAsync<float[,]>(request);
                for (int i = 0; i < result.GetLength(0); i++)
                {
                    Console.WriteLine($"Batch {i}:");
                    var length = result.GetLength(1);
                    var results = new Dictionary<int, float>();
                    for (int j = 0; j < length; j++)
                    {
                        results.Add(j, result[i, j]);
                    }

                    foreach (var kvp in results.Where(x => x.Value > 0.001).OrderByDescending(x => x.Value).Take(5))
                    {
                        Console.WriteLine(
                            $"    {GetLabel(kvp.Key)} {kvp.Value * 100}%");
                    }
                }
            }

            return 0;
        }

        private static Dictionary<int, string> _classes;

        private static string GetLabel(int classId)
        {
            if (_classes == null)
            {
                var assembly = typeof(Program).GetTypeInfo().Assembly;
                var result = assembly.GetManifestResourceStream("resnet.imagenet-classes.json");

                var streamReader = new StreamReader(result);
                var classesJson = streamReader.ReadToEnd();

                _classes = JsonConvert.DeserializeObject<Dictionary<int, string>>(classesJson);
            }

            return _classes[classId];
        }
    }
}