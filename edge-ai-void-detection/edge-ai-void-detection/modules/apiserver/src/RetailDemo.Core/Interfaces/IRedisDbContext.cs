namespace RetailDemo.Core.Interfaces
{
    public interface IRedisDbContext
    {
        string GetEvent(string key);
        bool SetEvent(string key, string value);
    }
}