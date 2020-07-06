using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Markup;
using Windows.UI.Xaml.Media;

namespace IntelligentKioskSample.Models
{
    public enum ShoppingScreenState
    {
        Choice,
        Selected,
    }

    public enum ShoppingChoice
    {
        TopLeft,
        TopRight
    }

    // This ViewModel is basically a state machine with delays for certain transitions
    public class ShoppingViewModel : BaseViewModel
    {
        private ShoppingScreenState _currentScreenState = ShoppingScreenState.Choice;
        public ShoppingScreenState CurrentScreenState
        {
            get { return _currentScreenState; }
            private set { Set(ref _currentScreenState, value); }
        }

        // Helpers for function bindings
        public Visibility IsChoice(ShoppingScreenState sss)
        {
            return sss == ShoppingScreenState.Choice ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsSelected(ShoppingScreenState sss)
        {
            return sss == ShoppingScreenState.Selected ? Visibility.Visible : Visibility.Collapsed;
        }

        public string imageSourceChoiceTopLeft = ProductCatalog.Instance.LeftProduct.ProductButtonImageSrc;
        public string imageSourceChoiceTopRight = ProductCatalog.Instance.RightProduct.ProductButtonImageSrc;

        private static string imageSourceSelectedTopLeft = ProductCatalog.Instance.LeftProduct.ProductButtonImageSrc;
        private static string imageSourceSelectedTopRight = ProductCatalog.Instance.RightProduct.ProductButtonImageSrc;

        private string _imageSourceSelected = imageSourceSelectedTopLeft;
        public string ImageSourceSelected
        {
            get { return _imageSourceSelected; }
            set { Set(ref _imageSourceSelected, value); }
        }

        private string _selectedPromoLine1 = "";
        public string SelectedPromoLine1
        {
            get { return _selectedPromoLine1; }
            set { Set(ref _selectedPromoLine1, value); }
        }
        private string _selectedPromoLine2 = "";
        public string SelectedPromoLine2
        {
            get { return _selectedPromoLine2; }
            set { Set(ref _selectedPromoLine2, value); }
        }
        private string _selectedPromoLine3 = "";
        public string SelectedPromoLine3
        {
            get { return _selectedPromoLine3; }
            set { Set(ref _selectedPromoLine3, value); }
        }

        private DateTime lastStateChangeTime = DateTime.Now;

        public ShoppingViewModel()
        {
        }

        /// <summary>
        /// Change the current state of UI, if allowed by timeouts  
        /// </summary>
        /// <param name="newState">the state to change to</param>
        /// <param name="choice">customer informatiom</param>
        /// <param name="force">always change the state and update timer</param>
        /// <returns>true iff the change was "officially" made (timeouts are reset)</returns>
        /// Note: we want to prevent too frequent updates here so the customer can react to the prompts
        public bool Update(ShoppingScreenState newState, ShoppingChoice choice = ShoppingChoice.TopLeft, bool force = false)
        {
            if (!force)
            {
                // Take care of the cases when there is no real change of state
                if (newState == CurrentScreenState)
                {
                    return false;  // keep waiting for change of state
                }

                TimeSpan sinceLastUpdate = DateTime.Now - lastStateChangeTime;

                switch (CurrentScreenState)
                {
                    // Delay state change to prevent flickering 
                    case ShoppingScreenState.Selected:
                        if (sinceLastUpdate.TotalMilliseconds < 5000)
                        {
                            return false; // let user to absorb the info
                        }
                        break;
                    case ShoppingScreenState.Choice:
                        if (sinceLastUpdate.TotalMilliseconds < 1000)
                        {
                            return false; // wait for gaze stabilization
                        }
                        break;
                }
            }

            // Now do change the state
            switch (newState)
            {
                case ShoppingScreenState.Choice:
                    break;
                case ShoppingScreenState.Selected:
                    SetSelectedSubstate(choice);
                    break;
            }

            lastStateChangeTime = DateTime.Now;
            CurrentScreenState = newState;
            return true;
        }

        private void SetSelectedSubstate(ShoppingChoice choice)
        {
            if (choice == ShoppingChoice.TopLeft)
            {
                ImageSourceSelected = imageSourceSelectedTopLeft;
                SelectedPromoLine1 = ProductCatalog.leftPromoLines[0];
                SelectedPromoLine2 = ProductCatalog.leftPromoLines[1];
                SelectedPromoLine3 = ProductCatalog.leftPromoLines[2];
            }
            else if (choice == ShoppingChoice.TopRight)
            {
                ImageSourceSelected = imageSourceSelectedTopRight;
                SelectedPromoLine1 = ProductCatalog.rightPromoLines[0];
                SelectedPromoLine2 = ProductCatalog.rightPromoLines[1];
                SelectedPromoLine3 = ProductCatalog.rightPromoLines[2];
            }
        }
    }
}
