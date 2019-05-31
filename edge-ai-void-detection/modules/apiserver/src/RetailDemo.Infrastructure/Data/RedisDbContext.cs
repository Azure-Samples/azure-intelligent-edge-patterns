using System;
using System.Collections.Generic;
using System.Text;
using StackExchange.Redis;
using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;

namespace RetailDemo.Infrastructure.Data
{
    public class RedisDbContext : IRedisDbContext
    {
        private IConnectionMultiplexer connectionMultiplexer;
        private IDatabase redisDb;

        public RedisDbContext()
        {
            if (connectionMultiplexer == null)
            {
                //connectionMultiplexer = ConnectionMultiplexer.Connect("137.117.66.41"); //TODO: Move to config settings
                connectionMultiplexer = ConnectionMultiplexer.Connect("redisdb");
                redisDb = connectionMultiplexer.GetDatabase();
            }
        }

        public string GetEvent(string key)
        {
            string value = redisDb.StringGet(key);

            return value;
        }

        public bool SetEvent(string key, string value)
        {
            var retValue = redisDb.StringSet(key, value);

            return retValue;
        }
    }
}
