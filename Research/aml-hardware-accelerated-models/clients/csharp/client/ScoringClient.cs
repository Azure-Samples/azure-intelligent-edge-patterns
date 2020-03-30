// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using System;
using System.Threading.Tasks;
using Grpc.Core;
using Tensorflow.Serving;

namespace CSharpClient
{
    using System.Collections.Generic;
    using System.Linq;

    using Grpc.Core.Interceptors;

    public class ScoringClient
    {
        private const int RetryCount = 10;

        private readonly IPredictionServiceClient _client;

        public ScoringClient(IPredictionServiceClient client)
        {
            _client = client;
        }

        public ScoringClient(Channel channel) : this(new PredictionServiceClientWrapper(new PredictionService.PredictionServiceClient(channel)))
        {
        }

        public ScoringClient(string host, int port, bool useSsl = false, string authKey = null, string serviceName = null)
        {
            ChannelCredentials baseCreds;
            if (useSsl)
            {
                baseCreds = new SslCredentials();
            } else
            {
                baseCreds = ChannelCredentials.Insecure;
            }
            var channel = new Channel(host, port, baseCreds);
            var callInvoker = channel.Intercept(
                metadata =>
                    {
                        if (!string.IsNullOrEmpty(authKey)){
                            metadata.Add("authorization", $"bearer {authKey}");
                        }
                        metadata.Add(
                            new Metadata.Entry("x-ms-aml-grpc-service-route", $"/api/v1/service/{serviceName}"));
                        return metadata;
                    });
            _client = new PredictionServiceClientWrapper(new PredictionService.PredictionServiceClient(callInvoker));
        }

        public async Task<float[]> ScoreAsync(IScoringRequest request, int retryCount = RetryCount, string output_name = "output_alias")
        {
            return await ScoreAsync<float[]>(request, retryCount, output_name);
        }

        public async Task<T> ScoreAsync<T>(IScoringRequest request, int retryCount = RetryCount, string output_name = "output_alias") where T : class
        {
            return (await this.PredictAsync<T>(request, retryCount))[output_name];
        }

        public async Task<Dictionary<string, T>> PredictAsync<T>(IScoringRequest request, int retryCount = RetryCount) where T : class
        {
            var predictRequest = request.MakePredictRequest();

            return await RetryAsync(async () =>
                {
                    var result = await _client.PredictAsync(predictRequest);
                    return result.Outputs.ToDictionary(
                        kvp => kvp.Key, kvp => kvp.Value.Convert<T>());
                }, retryCount);
        }

        private async Task<T> RetryAsync<T>(
            Func<Task<T>> operation, int retryCount = RetryCount
            )
        {
            while (true)
            {
                try
                {
                    return await operation();
                }
                catch (RpcException rpcException)
                {
                    if (!IsTransient(rpcException) || --retryCount <= 0)
                    {
                        throw;
                    }
                }
            }
        }

        private static bool IsTransient(RpcException rpcException)
        {
            return
                rpcException.Status.StatusCode == StatusCode.DeadlineExceeded ||
                rpcException.Status.StatusCode == StatusCode.Unavailable ||
                rpcException.Status.StatusCode == StatusCode.Aborted ||
                rpcException.Status.StatusCode == StatusCode.Internal;
        }
    }
}