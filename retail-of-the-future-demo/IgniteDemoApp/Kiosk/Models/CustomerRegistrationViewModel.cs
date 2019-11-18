using IntelligentKioskSample.Data;
using Microsoft.Azure.CognitiveServices.Vision.Face.Models;
using ServiceHelpers;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.UI;
using Windows.UI.Xaml.Markup;
using Windows.UI.Xaml.Media;

namespace IntelligentKioskSample.Models
{
    public class CustomerRegistrationViewModel : BaseViewModel
    {
        private CustomerRegistrationInfo customerInfo { get; set; }
        private ImageAnalyzer customerFace;

        private bool _isRegistrationMode;
        public bool IsRegistrationMode
        {
            get { return _isRegistrationMode; }
            set { Set(ref _isRegistrationMode, value); }
        }

        private bool _isRegistrationEnabled;
        public bool IsRegistrationEnabled
        {
            get { return _isRegistrationEnabled; }
            set { Set(ref _isRegistrationEnabled, value); }
        }

        private string _firstName = "";
        public string FirstName
        {
            get { return _firstName; }
            set { Set(ref _firstName, value.Trim()); }
        }

        private string _lastName = "";
        public string LastName
        {
            get { return _lastName; }
            set { Set(ref _lastName, value.Trim()); }
        }

        public string FullName
        {
            get { return Util.FullName(FirstName, LastName); }
        }

        private string _statusText = "";
        public string StatusText
        {
            get { return _statusText; }
            set { Set(ref _statusText, value); }
        }


        private Brush _statusTextColor = Util.ToBrush("black");
        public Brush StatusTextColor
        {
            get { return _statusTextColor; }
            set { Set(ref _statusTextColor, value); }
        }

        public void Reset(bool isRegistration)
        {
            customerInfo = null;
            customerFace = null;
            FirstName = "";
            LastName = "";
            IsRegistrationEnabled = false;
            IsRegistrationMode = isRegistration;
            StatusText = isRegistration ? "Please enter the first and last name and take a picture" : "Please take a picture to sign in";
            StatusTextColor = Util.ToBrush("black");
        }

        public async Task UpdateFaceCaptured(ImageAnalyzer img)
        {
            customerFace = img;
            if (IsRegistrationMode)
            {
                if (FullName.Length > 0 && img != null)
                {
                    IsRegistrationEnabled = true;
                    StatusText = "";
                }
                else
                {
                    IsRegistrationEnabled = false;
                    StatusText = "Please enter the first and last name and take a picture";
                }
            }
            else
            {
                await SignIn();
            }
        }

        public CustomerRegistrationInfo GetCustomerInfo()
        {
            // For now 
            return customerInfo;
        }

        private IEnumerable<PersonGroup> PersonGroups { get; set; }
        private PersonGroup CurrentPersonGroup { get; set; }
        private Person CurrentPerson { get; set; }
        private PersistedFace CurrentFace { get; set; }

        public async void Register()
        {
            try
            {
                IEnumerable<PersonGroup> PersonGroups = null;
                int i = 3; //retry count 

                // 1. Select group
                // If the group is full, another one needs to added manually with alphabetically preceeding name
                do
                {
                    PersonGroups = await FaceServiceHelper.ListPersonGroupsAsync(SettingsHelper.Instance.WorkspaceKey);
                    if (PersonGroups.Count() > 0)
                    {
                        CurrentPersonGroup = PersonGroups.OrderBy(pg => pg.Name).First();
                    }
                    // Do not forget to create a persons group if there is not one
                    else
                    {
                        await FaceServiceHelper.CreatePersonGroupAsync(Guid.NewGuid().ToString(), "DefaultGroup", SettingsHelper.Instance.WorkspaceKey);
                    }

                    i--;

                } while (PersonGroups.Count() < 1 && i >= 0);

                // 2. Create a person in that group
                CurrentPerson = await FaceServiceHelper.CreatePersonAsync(this.CurrentPersonGroup.PersonGroupId, FullName);

                // 3. Add face to that person
                CurrentFace = await FaceServiceHelper.AddPersonFaceFromStreamAsync(
                            CurrentPersonGroup.PersonGroupId,
                            CurrentPerson.PersonId,
                            imageStreamCallback: customerFace.GetImageStreamCallback,
                            userData: customerFace.LocalImagePath,
                            targetFaceRect: null);

                // 4. Train model
                await FaceServiceHelper.TrainPersonGroupAsync(CurrentPersonGroup.PersonGroupId);

                bool trainingSucceeded = false;
                bool recordAdded = false;

                while (true)
                {
                    TrainingStatus trainingStatus = await FaceServiceHelper.GetPersonGroupTrainingStatusAsync(CurrentPersonGroup.PersonGroupId);

                    if (trainingStatus.Status == TrainingStatusType.Succeeded)
                    {
                        trainingSucceeded = true;
                        break;
                    }
                    else if (trainingStatus.Status == TrainingStatusType.Failed)
                    {
                        break;
                    }

                    await Task.Delay(100);
                }

                // 5. Add record to the database
                if (trainingSucceeded)
                {
                    customerInfo = new CustomerRegistrationInfo
                    {
                        CustomerFaceHash = CurrentPerson.PersonId.ToString(),
                        CustomerName = FullName,
                        RegistrationDate = DateTime.Now
                    };

                    recordAdded = IgniteDataAccess.CreateCustomerRecord(customerInfo.CustomerFaceHash, customerInfo.CustomerName);
                }

                // 6. Update status
                if (trainingSucceeded && recordAdded)
                {
                    StatusTextColor = Util.ToBrush("green");
                    StatusText = "Success!";
                }
                else
                {
                    customerInfo = null;
                    StatusTextColor = Util.ToBrush("red");
                    StatusText = "Please try again later";
                }
            }
            catch (Exception)
            {
                customerInfo = null;
                StatusTextColor = Util.ToBrush("red");
                StatusText = "Please try again";
            }
        }

        public async Task SignIn()
        {
            try
            {
                // 1. Try to identify the person
                await customerFace.DetectFacesAsync();
                await customerFace.IdentifyFacesAsync();

                // TODO: consider looping over identified persons to find matching DB record
                customerInfo = new CustomerRegistrationInfo();
                customerInfo.CustomerFaceHash = customerFace.IdentifiedPersons.First().Person.PersonId.ToString();
                customerInfo.CustomerName = customerFace.IdentifiedPersons.First().Person.Name;

                // 2. Try to obtain customer info from DB
                CustomerInfo dbCustomerInfo = IgniteDataAccess.GetCustomerInfo(customerInfo.CustomerFaceHash);
                customerInfo.RegistrationDate = dbCustomerInfo.PreviousVisitDate;

                // 3. Update status
                StatusTextColor = Util.ToBrush("green");
                StatusText = $"Welcome, {customerInfo.CustomerName}!";
            }
            catch (Exception)
            {
                customerInfo = null;
                StatusTextColor = Util.ToBrush("red");
                StatusText = "Please try again.";
            }
        }
    }
}

