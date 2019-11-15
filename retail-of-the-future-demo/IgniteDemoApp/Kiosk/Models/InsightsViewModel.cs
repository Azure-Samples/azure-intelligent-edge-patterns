using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{
    public class InsightsViewModel : BaseViewModel
    {

        private IList<CustomerRegistrationInfo> registrations;
        private IList<InventoryItemStats> stats;

        public string CustomersToday { get; set; }
        public string CustomersLastHr { get; set; }

        public string LeftProductSoldToday { get; set; }
        public string RightProductSoldToday { get; set; }

        public string LeftProductSoldLastHr { get; set; }
        public string RightProductSoldLastHr { get; set; }

        public string LeftProductOnFloor { get; set; }
        public string RightProductOnFloor { get; set; }

        public string LeftProductInWarehouse { get; set; }
        public string RightProductInWarehouse { get; set; }

        public InsightsViewModel()
        {
            this.Update();
        }

        // Notify all properties are updated
        public void OnUpdate() 
        {
            OnPropertyChanged(null);
        }

        public void Update() 
        {
            try
            {
                stats = IgniteDataAccess.GetInventoryStats();
                registrations = IgniteDataAccess.GetCustomers();

                DateTime todayStart = DateTime.Now.Date;
                int customersTodayQty = (from r in registrations where r.RegistrationDate > todayStart select r).Count();
                CustomersToday = $"{customersTodayQty} new customers registered today";

                DateTime lastHrStart = DateTime.Now.AddHours(-1);
                int customersLastHrQty = (from r in registrations where r.RegistrationDate > lastHrStart select r).Count();
                CustomersLastHr = $"{customersLastHrQty} new customers registered past hour";

                int leftProdId = ProductCatalog.Instance.LeftProduct.ItemId;
                int rightProdId = ProductCatalog.Instance.RightProduct.ItemId;

                string leftProdHName = ProductCatalog.Instance.LeftProduct.ProductHierarchyName;
                string rightProdHName = ProductCatalog.Instance.RightProduct.ProductHierarchyName;

                int leftProductSoldTodayQty = (from i in stats where i.ProductHierarchyName == leftProdHName select i.TodayQtySold).Sum();
                LeftProductSoldToday = $"{leftProductSoldTodayQty} {leftProdHName} sold today";

                int rightProductSoldTodayQty = (from i in stats where i.ProductHierarchyName == rightProdHName select i.TodayQtySold).Sum();
                RightProductSoldToday = $"{rightProductSoldTodayQty} {rightProdHName} sold today";

                int leftProductSoldLastHrQty = (from i in stats where i.ProductHierarchyName == leftProdHName select i.LastHrQtySold).Sum();
                LeftProductSoldLastHr = $"{leftProductSoldLastHrQty} {leftProdHName} sold past hour";

                int rightProductSoldLastHrQty = (from i in stats where i.ProductHierarchyName == rightProdHName select i.LastHrQtySold).Sum();
                RightProductSoldLastHr = $"{rightProductSoldLastHrQty} {rightProdHName} sold past hour";

                int leftProductOnFloorQty = (from i in stats where i.ProductHierarchyName == leftProdHName select i.RemainingInventory).Sum();
                LeftProductOnFloor = $"{leftProductOnFloorQty} {leftProdHName} in stock on floor";

                int rightProductOnFloorQty = (from i in stats where i.ProductHierarchyName == rightProdHName select i.RemainingInventory).Sum();
                RightProductOnFloor = $"{rightProductOnFloorQty} {rightProdHName} in stock on floor";

                int leftProductInWarehouseQty = 100;  // steady supply :)
                LeftProductInWarehouse = $"{leftProductInWarehouseQty} {leftProdHName} in stock in warehouse";

                int rightProductInWarehouseQty = 100;
                RightProductInWarehouse = $"{rightProductInWarehouseQty} {rightProdHName} in stock in warehouse";

                //OnPropertyChanged(null);
            }
            catch (Exception ex)
            {
                Debug.Write($"Insights Page Update exception: {ex.Message}");
            }
        }
    }
}