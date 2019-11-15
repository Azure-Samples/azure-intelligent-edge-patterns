using IntelligentKioskSample.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IntelligentKioskSample.Models
{
    public class FaqViewModel : BaseViewModel
    {
        private System.Uri _faqUri;
        public System.Uri FaqUri
        {
            get { return _faqUri; }
            set { Set(ref _faqUri, value); }
        }

        public FaqViewModel()
        {
            Update();
        }

        public void Update()
        {
            FaqUri = new System.Uri(IgniteDataServices.GetLocatedProduct().ProductFaqSrc);
        }
    }
}