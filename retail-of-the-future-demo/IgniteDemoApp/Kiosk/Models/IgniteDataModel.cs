using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{

    // Info needed to create a customer record via CreateCustomerRecord SP 
    public class CustomerRegistrationInfo
    {
        public string CustomerFaceHash { get; set; }  // This is actually a GUID associated with a person via Azure Face API
        public string CustomerName { get; set; }
        public DateTime RegistrationDate { get; set; }  // used in UI while record/transactions are not yet created
    }

    // Record in the result set returned by GetCustomerInfo SP
    public class CustomerInfo
    {
        public string CustomerFaceHash { get; set; }  // This is actually a GUID associated with a person via Azure Face API
        public string CustomerName { get; set; }
        public DateTime PreviousVisitDate { get; set; }
        public int SourceItemId { get; set; }
        public string SourceItemDesc { get; set; }
        public int RecommendedItemId { get; set; }
        public string RecommendedItemDesc { get; set; }
    }

    // Record in the result set returned by GetInventoryStats SP
    public class InventoryItemStats
    {
        public int ItemId { get; set; }
        public DateTime BusinessDate { get; set; }
        public int StartingInventory { get; set; }
        public string ProductHierarchyName { get; set; }
        public int LastHrQtySold { get; set; }
        public int TodayQtySold { get; set; }
        public int RemainingInventory { get; set; }
    }

    // TODO: define a stored procedure to produce these records (join of products and recomendations tables with unique recommendation per product)
    public class Product
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; }  // name used for customer info/recommendation
        public string ItemDescription { get; set; }  // full product description 
        public string ProductHierarchyName { get; set; }  // generic name (plural, lowercase - used to group similar items)

        // TODO: add these fields to products table in the database
        public string ShortName { get; set; }  // name to refer to the product in the greeting UI (singular, lowercase)
        public string ShortNamePlural { get; set; }  // name to refer to the product in the greeting UI (plural, lowercase)
        public string ColorDescription { get; set; }  // for item display on checkout page (Capitalized)
        public string StyleDescription { get; set; }  // for item display on checkout page (Capitalized)
        public string ProductImageSrc { get; set; } // e.g. "ms-appx:///Assets/Ignite/Shirt.png" (image uri from our app package)
        public string ProductButtonImageSrc { get; set; } // e.g. "ms-appx:///Assets/Ignite/Shirt.png" (image uri from our app package)
        public string ProductFaqSrc { get; set; } // e.g. "ms-appx-web:///Data/FaqZone1.html" (FAQ html page uri from our app package)

        // TODO: this field should be set according to recommendations table
        public int RecommendationItemId { get; set; }
    }


    




}
