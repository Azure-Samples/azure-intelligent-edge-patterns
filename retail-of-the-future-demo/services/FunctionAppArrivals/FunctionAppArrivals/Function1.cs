using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net;
using System.Data;
using System.Data.SqlClient;

namespace FunctionAppArrivals
{
    public static class Function1
    {
        [FunctionName("Function1")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            if (requestBody.Length > 256 * 1024)
            {
                return new StatusCodeResult((int)HttpStatusCode.RequestEntityTooLarge);
            }
            else
            {
                log.LogInformation(requestBody);
            }

            JArray da = JArray.Parse(requestBody);
            for (var i = 0; i < da.Count; i++)
            {
                if (!InsertArrivalRecordSql(da[i].ToObject<ArrivalRecord>(), log))
                {
                    return new BadRequestObjectResult("Cannot process arrival record");
                }
            }

            return new OkObjectResult(requestBody);
        }

        public class ArrivalRecord
        {
            public DateTime ArrivalTime { get; set; }
            public int ArrivalCount { get; set; }
            public string SeriesId { get; set; }
        }

        public static string ConnectionStringSql
        {
            get => System.Environment.GetEnvironmentVariable("SQL_DB_ARRIVALS");
        }

        public static bool InsertArrivalRecordSql(ArrivalRecord ar, ILogger log)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConnectionStringSql))
                {
                    SqlCommand cmd = new System.Data.SqlClient.SqlCommand();
                    cmd.Connection = conn;
                    cmd.CommandType = System.Data.CommandType.Text;
                    cmd.CommandText = 
                        "INSERT INTO arrivals (arrivaltime, arrivalcount, seriesid) " +
                        "VALUES (@ArrivalTime, @ArrivalCount, @SeriesID)";
                    cmd.Parameters.AddWithValue("@ArrivalTime", ar.ArrivalTime);
                    cmd.Parameters.AddWithValue("@ArrivalCount", ar.ArrivalCount);
                    cmd.Parameters.AddWithValue("@SeriesId", ar.SeriesId);

                    conn.Open();
                    int rows = cmd.ExecuteNonQuery();
                    return rows == 1;
                }
            }
            catch (Exception e) 
            {
                log.LogError(e.Message);
                return false;
            }
        }
    }
}
