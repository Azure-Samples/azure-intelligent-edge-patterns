using IntelligentKioskSample.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Data
{
    public static class IgniteDataAccess
    {
        public static string ConnectionString
        {
            get => SettingsHelper.Instance.BackendConnection;
        }

        public const string UNREGISTERED_CUSTOMERID = "00000000-0000-0000-0000-000000000000";

        /// <summary>
        /// Get all registered customers (incl. those with no purchases)
        /// </summary>
        /// <returns></returns>
        public static List<CustomerRegistrationInfo> GetCustomers()
        {
            const string GetProductsQuery =
                "select CustomerFaceHash, CustomerName, RegistrationDate " +
                "from Customers";

            try
            {
                var customers = new List<CustomerRegistrationInfo>();
                using (SqlConnection conn = new SqlConnection(ConnectionString))
                {
                    conn.Open();
                    if (conn.State == System.Data.ConnectionState.Open)
                    {
                        using (SqlCommand cmd = conn.CreateCommand())
                        {
                            cmd.CommandText = GetProductsQuery;
                            using (SqlDataReader rdr = cmd.ExecuteReader())
                            {
                                while (rdr.Read())
                                {
                                    var customer = new CustomerRegistrationInfo();
                                    customer.CustomerFaceHash = rdr.GetString(rdr.GetOrdinal("CustomerFaceHash"));
                                    customer.CustomerName = rdr.GetString(rdr.GetOrdinal("CustomerName"));
                                    customer.RegistrationDate = rdr.GetDateTime(rdr.GetOrdinal("RegistrationDate"));
                                    customers.Add(customer);
                                }
                            }
                        }
                    }
                }
                return customers;
            }
            catch (Exception eSql)
            {
                Debug.WriteLine("Exception: " + eSql.Message);
            }
            return null;
        }

        /// <summary>
        /// Get last purchase info/recommendation for a customer
        /// </summary>
        /// <param name="customerGuid"></param>
        /// <returns></returns>
        public static CustomerInfo GetCustomerInfo(string customerGuid)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConnectionString))
                {
                    conn.Open();

                    // 1. create a command object identifying the stored procedure
                    SqlCommand cmd = new SqlCommand("uspGetCustomerInfo", conn);

                    // 2. set the command object so it knows to execute a stored procedure
                    cmd.CommandType = CommandType.StoredProcedure;

                    // 3. add parameter to command, which will be passed to the stored procedure
                    cmd.Parameters.AddWithValue("customer_id", customerGuid);

                    // 4. add return parameter
                    //var returnParameter = cmd.Parameters.Add("@ReturnVal", SqlDbType.Int);
                    //returnParameter.Direction = ParameterDirection.ReturnValue;

                    // 5. execute the command
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        // get the first row from the result set - there should be only one, corresponding to the latest 
                        // purchase, or zero if no purchase history
                        if (rdr.Read())
                        {
                            var info = new CustomerInfo();
                            info.CustomerFaceHash = rdr.GetString(rdr.GetOrdinal("CustomerFaceHash"));
                            info.CustomerName = rdr.GetString(rdr.GetOrdinal("CustomerName"));
                            info.PreviousVisitDate = rdr.GetDateTime(rdr.GetOrdinal("PreviousVisitDate"));
                            info.SourceItemId = rdr.GetInt32(rdr.GetOrdinal("SourceItemId"));
                            info.RecommendedItemId = rdr.GetInt32(rdr.GetOrdinal("RecommendedItemId"));
                            info.SourceItemDesc = rdr.GetString(rdr.GetOrdinal("SourceItemDesc"));
                            info.RecommendedItemDesc = rdr.GetString(rdr.GetOrdinal("RecommendedItemDesc"));
                            return info;
                        }
                    }

                    // 6. Check return value, if needed
                    // if (returnParameter.Value != null) 
                    //     ...
                }
            }
            catch (Exception eSql)
            {
                Debug.WriteLine("Exception: " + eSql.Message);
            }
            return null;
        }

        /// <summary>
        /// Register a customer
        /// </summary>
        public static bool CreateCustomerRecord(string customerGuid, string customerName)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConnectionString))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand("uspCreateCustomerRecord", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("customer_face_hash", customerGuid);
                    cmd.Parameters.AddWithValue("customer_name", customerName);
                    int i = cmd.ExecuteNonQuery();   // returns number of rows affected
                    return (i == 1);
                }
            }
            catch (Exception eSql)
            {
                Debug.WriteLine("Exception: " + eSql.Message);
            }
            return false;
        }

        /// <summary>
        /// Create an item sale record
        /// </summary>
        /// <param name="transactionTime"></param>
        /// <param name="itemId"></param>
        /// <param name="itemQty"></param>
        /// <param name="customerGuid"></param>
        /// <returns></returns>
        public static bool CreateNewTransaction(DateTime transactionTime, int itemId, int itemQty, string customerGuid)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConnectionString))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand("uspCreateNewTransaction", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("transaction_time", DateTime.Now);  // TODO this shouldn't be needed
                    cmd.Parameters.AddWithValue("item_id", itemId);
                    cmd.Parameters.AddWithValue("item_qty", itemQty);
                    cmd.Parameters.AddWithValue("customer_face_hash", customerGuid);
                    int i = cmd.ExecuteNonQuery();   // returns number of rows affected
                    return (i == 1);
                }
            }
            catch (Exception eSql)
            {
                Debug.WriteLine("Exception: " + eSql.Message);
            }
            return false;
        }

        /// <summary>
        /// Get available product info with recommendations 
        /// </summary>
        /// <returns></returns>
        // TODO: get product catalog info from DB (join of the augmented products and recommendations tables, 
        // keeping single recommendation per product)
        public static List<Product> GetProductsWithRecommendations()
        {
            return ProductCatalog.Instance.Products;  // for now use hardcoded data
        }

        /// <summary>
        /// Get inventory/sales info for available products
        /// </summary>
        /// <returns></returns>
        public static List<InventoryItemStats> GetInventoryStats()
        {
            var res = new List<InventoryItemStats>();
            try
            {
                using (SqlConnection conn = new SqlConnection(ConnectionString))
                {
                    conn.Open();
                    SqlCommand cmd = new SqlCommand("uspGetInventoryStats", conn);
                    cmd.CommandType = CommandType.StoredProcedure;
                    using (SqlDataReader rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            var stats = new InventoryItemStats();
                            stats.ItemId = rdr.GetInt32(rdr.GetOrdinal("ItemId"));
                            stats.BusinessDate = rdr.GetDateTime(rdr.GetOrdinal("BusinessDate"));
                            stats.StartingInventory = rdr.GetInt32(rdr.GetOrdinal("StartingInventory"));
                            stats.ProductHierarchyName = rdr.GetString(rdr.GetOrdinal("ProductHierarchyName"));
                            stats.LastHrQtySold = rdr.GetInt32(rdr.GetOrdinal("LastHrQtySold"));
                            stats.TodayQtySold = rdr.GetInt32(rdr.GetOrdinal("TodayQtySold"));
                            stats.RemainingInventory = rdr.GetInt32(rdr.GetOrdinal("RemainingInventory"));
                            res.Add(stats);
                        }
                    }
                }
            }
            catch (Exception eSql)
            {
                Debug.WriteLine("Exception: " + eSql.Message);
                return null;
            }
            return res;
        }

    }
}
