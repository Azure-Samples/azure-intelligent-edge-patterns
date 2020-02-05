// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Cognitive Services: http://www.microsoft.com/cognitive
// 
// Microsoft Cognitive Services Github:
// https://github.com/Microsoft/Cognitive
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// 

using IntelligentKioskSample.Data;
using IntelligentKioskSample.Models;
using System.Threading.Tasks;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Navigation;

namespace IntelligentKioskSample.Views.Ignite
{
    public sealed partial class CheckoutPage : Page
    {
        public CheckoutViewModel ViewModel { get; set; }

        public CheckoutPage()
        {
            this.InitializeComponent();
            this.ViewModel = new CheckoutViewModel();
        }

        //protected override void OnNavigatedTo(NavigationEventArgs e)
        //{
        //    base.OnNavigatedTo(e);
        //}

        protected override async void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            // TODO: make NavigationView control to update its navigation pane accordingly
            if (this.ViewModel.IsWarningNoCheckout)
            {
                e.Cancel = true;
                await Util.ConfirmActionAndExecute("Are you sure to proceed without checking out?",
                    async () => { this.ViewModel.IsWarningNoCheckout = false; await Task.CompletedTask; },
                    cancelActionLabel: "No");
            }

            base.OnNavigatingFrom(e);
        }

        private void OnCustomerUpdate(object sender, CustomerRegistrationInfo args) 
        {
            this.ViewModel.UpdateCustomer(args);
        }

        private void OnEdit_Click(object sender, Windows.UI.Xaml.RoutedEventArgs e)
        {
            FlyoutBase.ShowAttachedFlyout((FrameworkElement)sender);
        }

        private void OnAdd_Click(object sender, Windows.UI.Xaml.RoutedEventArgs e)
        {
            this.ViewModel.AddToGiveaway(1);
        }

        private void OnRemove_Click(object sender, Windows.UI.Xaml.RoutedEventArgs e)
        {
            this.ViewModel.RemoveFromGiveaway(1);   
        }

        private void OnSelectionFlyout_Opened(object sender, object e)
        {
        }

        private void OnSelectionFlyout_Closed(object sender, object e)
        {
            // Set givaway based on currect selection from the list if any
            Product selectedProd = this.choicesList.SelectedItem as Product;
            if (selectedProd != null)
            {
                this.ViewModel.ItemGiveaway.Reset(selectedProd, 1);
                this.ViewModel.TotalItems = 1;
            }
        }

        private async void CheckoutButton_Click(object sender, RoutedEventArgs e)
        {
            this.progressControl.IsActive = true;
            this.checkoutBtn.IsEnabled = false;
            await Task.Delay(1);   // allow progress animation to start
            this.ViewModel.Checkout();
            await Task.Delay(100); // ensure perceptible visual feedback
            this.checkoutBtn.IsEnabled = true;
            this.progressControl.IsActive = false;
        }
    }
}