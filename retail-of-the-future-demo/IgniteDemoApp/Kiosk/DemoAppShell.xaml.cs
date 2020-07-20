using IntelligentKioskSample.Views;
using IntelligentKioskSample.Views.Ignite;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace IntelligentKioskSample
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class DemoAppShell : Page
    {
        // Declare the top level nav items 
        public ObservableCollection<NavMenuItem> DemoMenuItems = new ObservableCollection<NavMenuItem>(
            new NavMenuItem[]
            {
                new NavMenuItem() { Glyph = "\uE716", Label = "Frequently Asked Questions", DestPage = typeof(FaqPage) },
                new NavMenuItem() { Glyph = "\uE7BF", Label = "Checkout", DestPage = typeof(CheckoutPage) },
                new NavMenuItem() { Glyph = "\uE781", Label = "Retail Insights", DestPage = typeof(InsightsPage) },
                new NavMenuItem() { Glyph = "\uE8BD", Label = "Welcome", DestPage = typeof(DemoWelcomePage) },
                new NavMenuItem() { Glyph = "\uE719", Label = "Shopping", DestPage = typeof(ShoppingPage) },
                new NavMenuItem() { Glyph = "\uE8D4", Label = "Face Identification Setup", DestPage = typeof(FaceIdentificationSetup) },
                new NavMenuItem() { Glyph = "\uE77B", Label = "Greeting Kiosk", DestPage = typeof(GreetingKiosk) }
            }
        );

        public DemoAppShell()
        {
            this.InitializeComponent();
        }

        public Frame AppFrame { get { return this.contentFrame; } }

        #region NavigationView event handlers
        private void nvTopLevelNav_Loaded(object sender, RoutedEventArgs e)
        {
            // Hide debug only items
            if (!SettingsHelper.Instance.ShowDebugInfo)
            {
                for (int i = 5; i < DemoMenuItems.Count; i++)
                {
                    var containerMenuItem = nvTopLevelNav.ContainerFromMenuItem(DemoMenuItems[i]) as NavigationViewItem;
                    if (containerMenuItem != null) { containerMenuItem.Visibility = Visibility.Collapsed; }
                }
            }

            // Navigate to the first page
            nvTopLevelNav.SelectedItem = DemoMenuItems[0];
            contentFrame.Navigate(DemoMenuItems[0].DestPage);
        }

        private void nvTopLevelNav_SelectionChanged(NavigationView sender, NavigationViewSelectionChangedEventArgs args)
        {
            // We do all work on item invoked, so no-op here
        }

        private void nvTopLevelNav_ItemInvoked(NavigationView sender, NavigationViewItemInvokedEventArgs args)
        {
            if (args.IsSettingsInvoked)
            {
                contentFrame.Navigate(typeof(SettingsPage));
            }
            else
            {
                NavMenuItem invokedItem = args.InvokedItem as NavMenuItem;
                foreach (NavMenuItem item in DemoMenuItems)
                {
                    if (item == invokedItem)
                    {
                        contentFrame.Navigate(item.DestPage);
                        break;
                    }
                }

                nvTopLevelNav.IsPaneOpen = false;

                // Navigating to Welcome page precludes further navigation
                if (invokedItem != null && invokedItem.Label.StartsWith("Welcome"))
                {
                    nvTopLevelNav.IsSettingsVisible = false;
                    nvTopLevelNav.IsPaneToggleButtonVisible = false;
                    nvTopLevelNav.PaneDisplayMode = NavigationViewPaneDisplayMode.LeftMinimal;
                }
            }
        }
        #endregion

    }
}