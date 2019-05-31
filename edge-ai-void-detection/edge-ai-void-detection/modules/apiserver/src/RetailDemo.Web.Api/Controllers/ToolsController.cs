using RetailDemo.Core;
using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace RetailDemo.Web.Controllers
{
    public class ToolsController : Controller
    {
        private readonly IRepository _repository;

        public ToolsController(IRepository repository)
        {
            _repository = repository;
        }

        public IActionResult Index()
        {
            var items = _repository.List<ImageEvent>();
            return View(items);
        }

        public IActionResult Populate()
        {
            int recordsAdded = DatabasePopulator.PopulateImageEventsDatabase(_repository);
            int recordsAddedEdgeDevices = DatabasePopulator.PopulateEdgeDevicesDatabase(_repository);
            return Ok(recordsAdded);
        }
    }
}
