using Microsoft.AspNetCore.Mvc;

namespace RetailDemo.Web.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseApiController : Controller
    {
    }
}
