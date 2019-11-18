using IntelligentKioskSample.Models;
using ServiceListener;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Data
{
    public static class IgniteDataServices
    {
        private static Product lastLocatedProduct = ProductCatalog.Instance.LeftProduct;
        /// <summary>
        /// Locate product to present to customer based on global settings and NFC readings
        /// </summary>
        /// <param name="zoneId">zone identification mode</param>
        /// <returns></returns>
        public static Product GetLocatedProduct()
        {
            Product prod = ProductCatalog.Instance.LeftProduct;  // fallback
            string zoneId = Util.NormalizeString(SettingsHelper.Instance.ZoneId);

            switch (zoneId) 
            {
                case "1":  // manual override
                    prod = ProductCatalog.Instance.LeftProduct;
                    break;
                case "2":  // manual override
                    prod = ProductCatalog.Instance.RightProduct;
                    break;
                case "auto": // use last NFC proximity sensor reading
                    prod = lastLocatedProduct;
                    break;
            }

            return prod;
        }

        public static void SetLocatedProduct(string rfid)
        {
            
            if (string.IsNullOrEmpty(rfid)) 
            {
                // reset to default
                lastLocatedProduct = ProductCatalog.Instance.LeftProduct;
            }

            Product locatedProd = ProductCatalog.Instance.GetProductFromRfidTag(rfid);
            if (locatedProd != null)
            {
                lastLocatedProduct = locatedProd;
            }
            // else no change
        }

        /// <summary>
        /// Obtain text of recommended actions for the sales representative
        /// </summary>
        /// <param name="ci"></param>
        /// <returns></returns>
        public static string GetRecommendedActions(CustomerInfo ci)
        {
            // TODO: taylor according to customer info and the product in question
            return "\u2022 Ask the customer about their shopping experience.\n" +
                "\u2022 Ask when they'll be coming back.";
        }
                
        /// <summary>
        /// Customer counter reset helper
        /// </summary>
        /// <param name="val">number of customers in store currently</param>
        /// <returns></returns>
        public static async Task<bool> ResetCustomerCounter(int val)
        {
            bool succeeded = false;
            try
            {
                CounterListener counterListener = new CounterListener(SettingsHelper.Instance.CustomerCounterEndpoint,
                    Util.ToIntSafely(SettingsHelper.Instance.CustomerCounterTiming, 5));
                counterListener.StartListening(null);
                succeeded = await counterListener.ResetAsync(val);
                counterListener.StopListening();
            }
            catch (Exception)
            {
                // Ignore 
            }

            return succeeded;
        }
    }
}
