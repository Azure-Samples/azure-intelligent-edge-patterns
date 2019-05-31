using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using React.UI.Web.ViewModels;

namespace React.UI.Web
{
    [Route("api/[controller]")]
    public class SampleDataController : Controller
    {
        [HttpGet("[action]")]
        public async Task<IActionResult> GetImageEvent()
        {
            throw new NotImplementedException();
        }
    }
}
