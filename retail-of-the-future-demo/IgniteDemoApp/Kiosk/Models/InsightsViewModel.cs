using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{
    public class ChartPointRecord 
    {
        public string Label { get; set; }
        public int Value { get; set; }
        public int Id { get; set; }
    }

    public class InsightsViewModel : BaseViewModel
    {
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

        public List<ChartPointRecord> SeriesSales;
        public List<ChartPointRecord> SeriesInventory;
        public List<ChartPointRecord> SeriesRegistrations;
        public List<ChartPointRecord> SeriesArrivals;

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
                var stats = IgniteDataAccess.GetInventoryStats();
                var registrations = IgniteDataAccess.GetCustomers();

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


                SeriesSales = new List<ChartPointRecord>();
                SeriesSales.Add(new ChartPointRecord { Label = $"{leftProdHName} sold today -", Value = leftProductSoldTodayQty, Id = 1 });
                SeriesSales.Add(new ChartPointRecord { Label = $"{rightProdHName} sold today -", Value = rightProductSoldTodayQty, Id = 2 });
                SeriesSales.Add(new ChartPointRecord { Label = $"{leftProdHName} sold past hour -", Value = leftProductSoldLastHrQty, Id = 3 });
                SeriesSales.Add(new ChartPointRecord { Label = $"{rightProdHName} sold past hour -", Value = rightProductSoldLastHrQty, Id = 4 });

                SeriesInventory = new List<ChartPointRecord>();
                SeriesInventory.Add(new ChartPointRecord { Label = $"{leftProdHName} in stock on floor -", Value = leftProductOnFloorQty, Id = 1 });
                SeriesInventory.Add(new ChartPointRecord { Label = $"{rightProdHName} in stock on floor -", Value = rightProductOnFloorQty, Id = 2 });
                SeriesInventory.Add(new ChartPointRecord { Label = $"{leftProdHName} in stock in warehouse -", Value = leftProductInWarehouseQty, Id = 3 });
                SeriesInventory.Add(new ChartPointRecord { Label = $"{rightProdHName} in stock in warehouse -", Value = rightProductInWarehouseQty, Id = 4 });

                SeriesRegistrations = new List<ChartPointRecord>();
                SeriesRegistrations.Add(new ChartPointRecord { Label = "registered today -", Value = customersTodayQty, Id = 1 });
                SeriesRegistrations.Add(new ChartPointRecord { Label = "registered past hour -", Value = customersLastHrQty, Id = 2 });

                // Prepare last 8 hours of arrival data labeled by local time hour
                string seriesId = SettingsHelper.Instance.CustomerCounterSourceId;
                var arrivals = IgniteDataAccess.GetArrivalCounts(seriesId, 8);
                SeriesArrivals = new List<ChartPointRecord>();
                int id = 0;
                foreach (Arrival a in arrivals)
                {
                    // Label arrivals by the start of their time interval (i.e. arrival at 10:30AM gets labeled by 10AM)
                    DateTime dt = (a.ArrivalDate + new TimeSpan(a.ArrivalHour, 0, 0)).ToLocalTime();
                    // Use only today's data
                    if (dt.Date == DateTime.Now.Date) {
                        id++;
                        SeriesArrivals.Add(new ChartPointRecord { Label = dt.ToString("htt"), Value = a.Arrivals, Id = id });
                    }
                }
                // Make sure that we have at least one data point
                if (SeriesArrivals.Count == 0)
                {
                    DateTime dt = (DateTime.UtcNow).ToLocalTime();
                    SeriesArrivals.Add(new ChartPointRecord { Label = dt.ToString("htt"), Value = 0, Id = 1 });
                }
                //OnPropertyChanged(null);
            }
            catch (Exception ex)
            {
                Debug.Write($"Insights Page Update exception: {ex.Message}");
            }
        }
    }
}