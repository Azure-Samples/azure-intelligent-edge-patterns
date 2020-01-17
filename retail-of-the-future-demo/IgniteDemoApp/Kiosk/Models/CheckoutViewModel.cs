using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{
    public class CheckoutViewModel : BaseViewModel
    {
        private bool _isRecognized;
        public bool IsRecognized
        {
            get { return _isRecognized; }
            set { Set(ref _isRecognized, value); }
        }

        private bool _isUnrecognized = true;
        public bool IsUnrecognized
        {
            get { return _isUnrecognized; }
            set { Set(ref _isUnrecognized, value); }
        }

        private string _customerName = "";
        public string CustomerName
        {
            get { return _customerName; }
            set { Set(ref _customerName, value); }
        }

        private string _visitDateStr = "";
        public string VisitDateStr
        {
            get { return _visitDateStr; }
            set { Set(ref _visitDateStr, value); }
        }

        private string _previousPurchase = "";
        public string PreviousPurchase
        {
            get { return _previousPurchase; }
            set { Set(ref _previousPurchase, value); }
        }

        private string _recommendedActions = "";
        public string RecommendedActions
        {
            get { return _recommendedActions; }
            set { Set(ref _recommendedActions, value); }
        }

        private ProductViewModel _itemGiveaway;
        public ProductViewModel ItemGiveaway 
        {
            get { return _itemGiveaway; }
            set { Set(ref _itemGiveaway, value); }
        }

        public bool IsRemovable(int qtyString)
        {
            return qtyString > 1;
        }

        private int _totalItems = 1;
        public int TotalItems
        {
            get { return _totalItems; }
            set { Set(ref _totalItems, value); }
        }

        public void AddToGiveaway(int qty)
        {
            ItemGiveaway.ProductQty += 1;
        }

        public void RemoveFromGiveaway(int qty)
        {
            if (ItemGiveaway.ProductQty > 1)
            {
                ItemGiveaway.ProductQty -= 1;
            }
        }

        public ObservableCollection<Product> ProductChoices { get; set; }
        public bool IsWarningNoCheckout { get; set; }

        private CustomerInfo customerInfo;  // obtained from DB
        private CustomerRegistrationInfo customerRegistrationInfo;  // obtained form registration UI
        public void UpdateCustomer(CustomerRegistrationInfo info)
        {
            customerRegistrationInfo = info;

            if (info != null && info.CustomerName.Length > 0) 
            {
                customerInfo = IgniteDataAccess.GetCustomerInfo(info.CustomerFaceHash);

                if (customerInfo == null)  // first visit
                {
                    IsRecognized = true;
                    IsUnrecognized = false;
                    CustomerName = info.CustomerName;
                    VisitDateStr = "";
                    PreviousPurchase = "";
                    RecommendedActions = IgniteDataServices.GetRecommendedActions(customerInfo);

                    IsWarningNoCheckout = true;  // we want to avoid having registered customers without transactions
                }
                else  // second visit
                {
                    IsRecognized = true;
                    IsUnrecognized = false;
                    CustomerName = customerInfo.CustomerName;
                    VisitDateStr = customerInfo.PreviousVisitDate.ToString("MM/dd/yyyy");
                    PreviousPurchase = ProductCatalog.Instance.GetProductById(customerInfo.SourceItemId).ItemDescription;
                    RecommendedActions = IgniteDataServices.GetRecommendedActions(customerInfo);
                }
            }
            else 
            {
                customerInfo = null;
                IsRecognized = false;
                IsUnrecognized = true;
                CustomerName = "";
                VisitDateStr = "";
                PreviousPurchase = "";
                RecommendedActions = "";
            }
        }

        public void Checkout()
        {
            if (customerInfo == null)  // no previous transactions
            {
                if (customerRegistrationInfo == null)  // unregistered customer 
                {
                    IgniteDataAccess.CreateNewTransaction(ItemGiveaway.ItemId, ItemGiveaway.ProductQty, IgniteDataAccess.UNREGISTERED_CUSTOMERID);
                }
                else
                {
                    IgniteDataAccess.CreateNewTransaction(ItemGiveaway.ItemId, ItemGiveaway.ProductQty, customerRegistrationInfo.CustomerFaceHash);
                }
            }
            else
            {
                IgniteDataAccess.CreateNewTransaction(ItemGiveaway.ItemId, ItemGiveaway.ProductQty, customerInfo.CustomerFaceHash);
            }
            // TODO: report transaction success status 
            
            // Prepare for the next customer
            UpdateCustomer(null);
            ItemGiveaway.Reset(IgniteDataServices.GetLocatedProduct(), 1);
            TotalItems = 1;
            IsWarningNoCheckout = false;
        }

        public CheckoutViewModel()
        {
            // Ideally, both customer and item should be recognized somehow, but here
            // intialize with unrecognized customer and default located product
            ItemGiveaway = new ProductViewModel();
            Product locatedProd = IgniteDataServices.GetLocatedProduct();
            ItemGiveaway.Reset(locatedProd, 1);  // one item at a time please
            TotalItems = 1;
            ProductChoices = new ObservableCollection<Product>(ProductCatalog.Instance.Products);
            //  Limit choices to similar items
            //ProductChoices = new ObservableCollection<Product>(from prod in ProductCatalog.Instance.Products
            //                                                   where prod.ProductHierarchyName == locatedProd.ProductHierarchyName
            //                                                   select prod);
        }
    }
}