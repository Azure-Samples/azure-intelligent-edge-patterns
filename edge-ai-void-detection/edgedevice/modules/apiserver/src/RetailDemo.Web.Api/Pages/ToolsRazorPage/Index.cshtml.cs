using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

namespace RetailDemo.Web.Pages.ToDoRazorPage
{
    public class IndexModel : PageModel
    {
        private readonly IRepository _repository;

        public List<ImageEvent> ImageEventItems { get; set; }

        public IndexModel(IRepository repository)
        {
            _repository = repository;
        }

        public void OnGet()
        {
            ImageEventItems = _repository.List<ImageEvent>();
        }
    }
}
