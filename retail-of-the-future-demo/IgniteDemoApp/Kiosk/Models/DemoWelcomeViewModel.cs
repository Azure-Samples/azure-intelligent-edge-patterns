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
    public enum DemoScreenState
    {
        NoFace,
        Greeting,
        Selection,
        LeftSelected,
        RightSelected,
        Recognized,
        NoFaceGreeting
    }

    // This ViewModel is basically a state machine with delays for certain transitions
    public class DemoWelcomeViewModel : BaseViewModel
    {
        private DemoScreenState _currentScreenState = DemoScreenState.NoFace;
        public DemoScreenState CurrentScreenState
        {
            get { return _currentScreenState; }
            private set { Set(ref _currentScreenState, value); }
        }

        // Helpers for function bindings
        public Visibility IsStandHere(DemoScreenState dss)
        {
            return dss == DemoScreenState.NoFace ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsGreeting(DemoScreenState dss)
        {
            return dss == DemoScreenState.Greeting || dss == DemoScreenState.NoFaceGreeting ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsSelection(DemoScreenState dss)
        {
            return dss == DemoScreenState.Selection ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsLeftSelected(DemoScreenState dss)
        {
            return dss == DemoScreenState.LeftSelected ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsRightSelected(DemoScreenState dss)
        {
            return dss == DemoScreenState.RightSelected ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsLeftOrRightSelected(DemoScreenState dss)
        {
            return (dss == DemoScreenState.RightSelected || dss == DemoScreenState.LeftSelected) ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsSelectionOrSelected(DemoScreenState dss)
        {
            return (dss == DemoScreenState.Selection || dss == DemoScreenState.RightSelected || dss == DemoScreenState.LeftSelected) ? Visibility.Visible : Visibility.Collapsed;
        }
        public Visibility IsRecognized(DemoScreenState dss)
        {
            return dss == DemoScreenState.Recognized ? Visibility.Visible : Visibility.Collapsed;
        }

        // Properties for various substates 
        private bool _isLeftButton;
        public bool IsLeftButton
        {
            get { return _isLeftButton; }
            set { Set(ref _isLeftButton, value); }
        }

        private bool _isRightButton;
        public bool IsRightButton
        {
            get { return _isRightButton; }
            set { Set(ref _isRightButton, value); }
        }

        private bool _isLeftArrow;
        public bool IsLeftArrow
        {
            get { return _isLeftArrow; }
            set { Set(ref _isLeftArrow, value); }
        }

        private bool _isRightArrow;
        public bool IsRightArrow
        {
            get { return _isRightArrow; }
            set { Set(ref _isRightArrow, value); }
        }

        public string _productLeftPlural = ProductCatalog.Instance.LeftProduct.ShortNamePlural;
        public string ProductLeftPlural
        {
            get { return _productLeftPlural; }
            set { Set(ref _productLeftPlural, value); }
        }

        public string _productRightPlural = ProductCatalog.Instance.RightProduct.ShortNamePlural;
        public string ProductRightPlural
        {
            get { return _productRightPlural; }
            set { Set(ref _productRightPlural, value); }
        }

        public string _productLeft = ProductCatalog.Instance.LeftProduct.ShortName;
        public string ProductLeft
        {
            get { return _productLeft; }
            set { Set(ref _productLeft, value); }
        }

        public string _productRight = ProductCatalog.Instance.RightProduct.ShortName;
        public string ProductRight
        {
            get { return _productRight; }
            set { Set(ref _productRight, value); }
        }

        private string _imageSourceLeft = ProductCatalog.Instance.LeftProduct.ProductButtonImageSrc;
        public string ImageSourceLeft
        {
            get { return _imageSourceLeft; }
            set { Set(ref _imageSourceLeft, value); }
        }

        private string _imageSourceRight = ProductCatalog.Instance.RightProduct.ProductButtonImageSrc;
        public string ImageSourceRight
        {
            get { return _imageSourceRight; }
            set { Set(ref _imageSourceRight, value); }
        }

        private string _direction = "";
        public string Direction
        {
            get { return _direction; }
            set { Set(ref _direction, value); }
        }

        private string _customerName = "";
        public string CustomerName
        {
            get { return _customerName; }
            set { Set(ref _customerName, value); }
        }

        private string _productPrevious = "";
        public string ProductPrevious
        {
            get { return _productPrevious; }
            set { Set(ref _productPrevious, value); }
        }

        private string _productSuggestion = "";
        public string ProductSuggestion
        {
            get { return _productSuggestion; }
            set { Set(ref _productSuggestion, value); }
        }

        private string _imageSourceSuggestion = ProductCatalog.Instance.RightProduct.ProductButtonImageSrc;
        public string ImageSourceSuggestion
        {
            get { return _imageSourceSuggestion; }
            set { Set(ref _imageSourceSuggestion, value); }
        }

        private string _productSelected = "";
        public string ProductSelected
        {
            get { return _productSelected; }
            set { Set(ref _productSelected, value); }
        }

        private string _customerPrompt = "";
        public string CustomerPrompt
        {
            get { return _customerPrompt; }
            set { Set(ref _customerPrompt, value); }
        }

        private static string customerPromptNoRecognized =
            "Hello and welcome to the Intelligent Retail Experience brought to you by Intel and Microsoft. " +
            "Enjoy the immersive, edge to cloud experience, powered by the latest tech available today.";

        private static string customerPromptRecognizedFmt =
            "Hello {0}!  Welcome back to the Intelligent Retail Experience with Intel and Microsoft. " +
            "We hope you are liking the {1}. We invite you to check out the {2} next. " +
            "You can find it by proceeding to the {3}.";

        private static string customerPromptSelectionOffer = "To begin, please select a product";
        private static string customerPromptModeWithSpeech = "by speaking or touching the screen";
        private static string customerPromptModeSilent = "by touching the screen";

        private string _customerPromptMode = customerPromptModeSilent;
        public string CustomerPromptMode
        {
            get { return _customerPromptMode; }
            set { Set(ref _customerPromptMode, value); }
        }

        private static string customerPromptSelectedFmt = "Great! You can find our {0} to the {1}. Enjoy your visit!";

        private DateTime lastStateChangeTime = DateTime.Now;
        private CustomerInfo lastCustomerInfo = null;

        private bool isUsingSpeech;
        public DemoWelcomeViewModel(bool withSpeech)
        {
            isUsingSpeech = withSpeech;
        }

        /// <summary>
        /// Change the current state of UI, if allowed by timeouts  
        /// </summary>
        /// <param name="newState">the state to change to</param>
        /// <param name="ci">customer informatiom</param>
        /// <param name="force">always change the state and update timer</param>
        /// <returns>true iff the change was "officially" made (timeouts are reset)</returns>
        /// Note: we want to prevent too frequent updates here so the customer can react to the prompts
        public bool Update(DemoScreenState newState, CustomerInfo ci = null, bool force = false)
        {
            if (!force)
            {
                // Take care of the cases when there is no real change of state
                if (newState == CurrentScreenState)
                {
                    if (newState == DemoScreenState.Recognized)
                    {
                        if (ci != null && lastCustomerInfo != null)
                        {
                            if (ci.CustomerName == lastCustomerInfo.CustomerName &&
                                ci.CustomerFaceHash == lastCustomerInfo.CustomerFaceHash)
                            {
                                return false;  // same customer as before - keep waiting for change of state
                            }
                        }
                    }
                    else
                    {
                        return false;  // keep waiting for change of state
                    }

                }

                // Delay state change upon ofering user a choice or giving instructions
                TimeSpan sinceLastUpdate = DateTime.Now - lastStateChangeTime;

                switch (CurrentScreenState)
                {
                    case DemoScreenState.Greeting:
                        if (newState != DemoScreenState.Selection &&
                            newState != DemoScreenState.LeftSelected &&
                            newState != DemoScreenState.RightSelected)
                        {
                            if (sinceLastUpdate.TotalMilliseconds < 10000)
                            {
                                return false; // stay with greeting for some time if user does not act
                            }

                        }
                        break;
                    case DemoScreenState.Selection:
                        if (newState != DemoScreenState.LeftSelected &&
                            newState != DemoScreenState.RightSelected &&
                            newState != DemoScreenState.NoFaceGreeting)
                        {
                            if (sinceLastUpdate.TotalMilliseconds < 15000)
                            {
                                return false; // stay with selection for some time if user does not act
                            }
                        }
                        break;
                    case DemoScreenState.LeftSelected:
                    case DemoScreenState.RightSelected:
                        if (newState != DemoScreenState.Selection)
                        {
                            if (sinceLastUpdate.TotalMilliseconds < 12000)
                            {
                                return false; // let user to read directions, unless they chose to go back to selection
                            }
                        }
                        break;
                    case DemoScreenState.Recognized:
                        if (sinceLastUpdate.TotalMilliseconds < 10000)
                        {
                            return false; // let user to read directions
                        }
                        break;
                    default:
                        break;
                }
            }

            // Now do change the state
            switch (newState)
            {
                case DemoScreenState.NoFace:
                    CustomerPrompt = "";
                    break;
                case DemoScreenState.Greeting:
                    CustomerPrompt = customerPromptNoRecognized;
                    break;
                case DemoScreenState.Selection:
                    UpdateSelectionOfferedSubstate();
                    break;
                case DemoScreenState.Recognized:
                    UpdateRecognizedSubstate(ci);
                    break;
                case DemoScreenState.LeftSelected:
                    UpdateSelectedSubstate("left");
                    break;
                case DemoScreenState.RightSelected:
                    UpdateSelectedSubstate("right");
                    break;
            }

            lastStateChangeTime = DateTime.Now;

            CurrentScreenState = newState;
            return true;
        }

        private void UpdateSelectionOfferedSubstate()
        {
            CustomerPromptMode = isUsingSpeech ? customerPromptModeWithSpeech : customerPromptModeSilent;
            CustomerPrompt = $"{customerPromptSelectionOffer} {CustomerPromptMode}.";
            IsLeftButton = true;
            IsRightButton = true;
            IsLeftArrow = false;
            IsRightArrow = false;
        }

        private void UpdateRecognizedSubstate(CustomerInfo ci)
        {
            // Assume right product should be recommended
            string direction = "right";
            // Check if the left product should be recommended instead
            Product recomProd = ProductCatalog.Instance.GetProductById(ci.RecommendedItemId);
            if (recomProd != null)
            {
                if (ProductCatalog.Instance.LeftProduct.ProductHierarchyName == recomProd.ProductHierarchyName)
                {
                    // Assume that the previous purchase is the right product and recommend left
                    direction = "left";
                }
            }

            if (direction == "right")
            {
                ProductPrevious = ProductLeft;
                ProductSuggestion = ProductRight;
                ImageSourceSuggestion = ProductCatalog.Instance.RightProduct.ProductButtonImageSrc;
            }
            else
            {
                ProductPrevious = ProductRight;
                ProductSuggestion = ProductLeft;
                ImageSourceSuggestion = ProductCatalog.Instance.LeftProduct.ProductButtonImageSrc;
            }

            Direction = direction;
            CustomerName = ci.CustomerName;  // TODO: use first name only? 
            CustomerPrompt = string.Format(customerPromptRecognizedFmt, CustomerName, ProductPrevious, ProductSuggestion, Direction);
        }

        private void UpdateSelectedSubstate(string direction)
        {
            bool isRight = (direction == "right");
            Direction = direction;
            ProductSelected = isRight ? ProductRightPlural : ProductLeftPlural;
            CustomerPrompt = string.Format(customerPromptSelectedFmt, ProductSelected, Direction);
            IsLeftButton = false;
            IsRightButton = false;
            IsLeftArrow = !isRight;
            IsRightArrow = isRight;
        }
    }
}
