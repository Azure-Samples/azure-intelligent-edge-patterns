using IntelligentKioskSample.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Data
{
    // This class manages products available for display and sale
    public class ProductCatalog
    {
        public List<Product> Products { get; private set; }
        public Product LeftProduct { get; private set; }
        public Product RightProduct { get; private set; }

        public Product GetProductById(int id)
        {
            foreach (Product p in Products) 
            { 
                if (p.ItemId == id) 
                {
                    return p;
                }
            }
            return null;
        }
        public Product GetRecommendedProduct(Product prod)
        {
            foreach (Product p in Products) 
            {
                if (p.ItemId == prod.ItemId) {
                    return GetProductById(p.RecommendationItemId);
                }
            }
            return null;
        }

        public List<Product> GetSimilarProducts(Product prod)
        {
            List<Product> plist = new List<Product>();
            foreach (Product p in Products)
            {
                if (p.ProductHierarchyName == prod.ProductHierarchyName)
                {
                    plist.Add(p);
                }
            }
            return plist;
        }

        private ProductCatalog() { }
        static private ProductCatalog Initialize()
        {
            ProductCatalog ctlg = new ProductCatalog();
            ctlg.Products = presetIgniteDemoProducts; // TODO: get from DB
            ctlg.LeftProduct = presetLeftProduct; // TODO: get from app settings
            ctlg.RightProduct = presetRightProduct; // TODO: set according to recommendation for left product
            // TODO: Ensure all uri strings loaded from DB are valid (to avoid exceptions with binding)
            return ctlg;
        }

        static private ProductCatalog _productCatalog;
        static public ProductCatalog Instance
        {
            get
            {
                if (_productCatalog == null)
                {
                    _productCatalog = Initialize();
                }
                return _productCatalog;
            }
        }

        // Hardcoded products for the demo (TODO: put this in DB)
        private static Product presetLeftProduct = new Product
        {
            ItemId = 11110,
            ItemName = "Black Malibu",
            ItemDescription = "Black Malibu Sunglasses w/Pouch",
            ProductHierarchyName = "sunglasses",
            ShortName = "sunglasses",
            ShortNamePlural = "sunglasses",
            ColorDescription = "Black",
            StyleDescription = "6223",
            ProductImageSrc = "ms-appx:///Assets/Ignite/Black_Malibu.png",
            ProductButtonImageSrc = "ms-appx:///Assets/Ignite/SunglassesButtonHR2.png",
            ProductFaqSrc = "ms-appx-web:///Data/FaqZone1.html",
            RecommendationItemId = 17776
        };
        private static Product presetLeftAltProduct = new Product
        {
            ItemId = 16665,
            ItemName = "Wood Grain Malibu",
            ItemDescription = "Wood Grain Malibu Sunglasses w/Pouch",
            ProductHierarchyName = "sunglasses",
            ShortName = "sunglasses",
            ShortNamePlural = "sunglasses",
            ColorDescription = "Wood Grain",
            StyleDescription = "6286",
            ProductImageSrc = "ms-appx:///Assets/Ignite/Wood_Grain_Malibu.png",
            ProductButtonImageSrc = "ms-appx:///Assets/Ignite/SunglassesButtonHR2.png",
            ProductFaqSrc = "ms-appx-web:///Data/FaqZone1.html",
            RecommendationItemId = 18887
        };
        private static Product presetRightProduct = new Product
        {
            ItemId = 17776,
            ItemName = "Graphite Hat",
            ItemDescription = "Graphite Trucker Hat w/Tone on Tone Mesh",
            ProductHierarchyName = "trucker hats",
            ShortName = "hat",
            ShortNamePlural = "hats",
            ColorDescription = "Grey-Graphite",
            StyleDescription = "9265-083",
            ProductImageSrc = "ms-appx:///Assets/Ignite/Graphite_Hat.png",
            ProductButtonImageSrc = "ms-appx:///Assets/Ignite/HatButtonHR2.png",
            ProductFaqSrc = "ms-appx-web:///Data/FaqZone2.html",
            RecommendationItemId = 11110
        };
        private static Product presetRightAltProduct = new Product
        {
            ItemId = 18887,
            ItemName = "Black Hat",
            ItemDescription = "Black Trucker Hat w/Black Mesh",
            ProductHierarchyName = "trucker hats",
            ShortName = "hat",
            ShortNamePlural = "hats",
            ColorDescription = "Black",
            StyleDescription = "9265-016",
            ProductImageSrc = "ms-appx:///Assets/Ignite/Black_Hat.png",
            ProductButtonImageSrc = "ms-appx:///Assets/Ignite/HatButtonHR2.png",
            ProductFaqSrc = "ms-appx-web:///Data/FaqZone2.html",
            RecommendationItemId = 16665
        };

        private static List<Product> presetIgniteDemoProducts = new List<Product>
        {
            presetLeftProduct,
            presetLeftAltProduct,
            presetRightProduct,
            presetRightAltProduct,
        };

        // Orient the customer based on their preference and store layout
        public static string GetDirectionFromLuisEntity(string entity) 
        {
            string direction = "unknown";
            string leftProducts = ProductCatalog.Instance.LeftProduct.ProductHierarchyName;
            string rightProducts = ProductCatalog.Instance.RightProduct.ProductHierarchyName;
            if (entity == "Hats" && leftProducts == "trucker hats" ||
                entity == "Sunglasses" && leftProducts == "sunglasses") 
            { 
                direction = "left";
            }
            else if (entity == "Hats" && rightProducts == "trucker hats" ||
                entity == "Sunglasses" && rightProducts == "sunglasses")
            {
                direction = "right";
            }
            return direction;
        }

        // TODO: get this from DB
        private Dictionary<string, int> rfidTagToProductId = new Dictionary<string, int>()
        {
            {"7A-OF-DE-12", 11110 },
            {"7A-DF-3C-12", 16665 },
            {"7A-A3-1E-12", 17776 },
            {"7A-9B-37-12", 18887 },
            {"7A-73-DC-12", 11110 },
            {"7A-E2-59-12", 17776 },
        };

        public Product GetProductFromRfidTag(string rfid) 
        {
            Product prod = null;
            if (rfidTagToProductId.ContainsKey(rfid))
            {
                int prodId = rfidTagToProductId[rfid];
                prod = GetProductById(prodId);
            }
            return prod;
        }
    }
}
