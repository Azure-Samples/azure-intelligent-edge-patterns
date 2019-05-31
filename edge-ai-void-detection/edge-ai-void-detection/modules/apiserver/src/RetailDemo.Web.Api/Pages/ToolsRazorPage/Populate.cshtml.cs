using RetailDemo.Core;
using RetailDemo.Core.Interfaces;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace RetailDemo.Web.Pages.ToDoRazorPage
{
    public class PopulateModel : PageModel
    {
        private readonly IRepository _repository;

        public PopulateModel(IRepository repository)
        {
            _repository = repository;
        }

        public int RecordsAdded { get; set; }

        public void OnGet()
        {
            RecordsAdded = DatabasePopulator.PopulateEdgeDevicesDatabase(_repository);
            RecordsAdded = DatabasePopulator.PopulateImageEventsDatabase(_repository);
        }
    }
}
