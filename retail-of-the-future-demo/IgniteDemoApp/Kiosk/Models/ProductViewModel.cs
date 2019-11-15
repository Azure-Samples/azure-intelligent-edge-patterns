using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{
    public class ProductViewModel : BaseViewModel
    {
        private string _promoTitle = "";
        public string PromoTitle
        {
            get { return _promoTitle; }
            set { Set(ref _promoTitle, value); }
        }

        public string _productStyle = "";
        public string ProductStyle
        {
            get { return _productStyle; }
            set { Set(ref _productStyle, value); }

        }

        public string _productColor = "";
        public string ProductColor
        {
            get { return _productColor; }
            set { Set(ref _productColor, value); }

        }

        public int _productQty = 1;
        public int ProductQty
        {
            get { return _productQty; }
            set { Set(ref _productQty, value); }
        }

        public string _productImageSrc = "ms-appx:///Assets/Ignite/AzureSquare.png";  // smth valid to avoid binding exceptions
        public string ProductImageSrc
        {
            get { return _productImageSrc; }
            set { Set(ref _productImageSrc, value); }
        }

        public int ItemId { get; private set; }
        public void Reset(Product prod, int qty)
        {
            // TODO: put surrounding text like "Style: " in the view XAML to allow for flexible formatting
            ItemId = prod.ItemId;
            PromoTitle = $"{prod.ShortName.ToUpper()} GIVEAWAY";
            ProductStyle = $"Style:   {prod.StyleDescription}";
            ProductColor = $"Color:  {prod.ColorDescription}";
            ProductQty = qty > 0 ? qty : 1;  // remove the product rather than settiing its quantity to 0
            ProductImageSrc = prod.ProductImageSrc;
        }

    }
}