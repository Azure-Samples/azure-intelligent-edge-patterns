using System;
using System.Collections.Generic;
using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;
using RetailDemo.Web.ApiModels;
using RetailDemo.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace RetailDemo.Web.Api
{
    public class EdgeDevicesController : BaseApiController
    {
        private readonly IRepository _repository;

        public EdgeDevicesController(IRepository repository)
        {
            _repository = repository;
        }

        // GET: api/EdgeDevices
        [HttpGet]
        public IActionResult List()
        {
            var items = _repository.List<EdgeDevice>()
                            .Select(EdgeDeviceDTO.FromEdgeDevice);
            return Ok(items);
        }

        // GET: api/EdgeDevices
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            var item = EdgeDeviceDTO.FromEdgeDevice(_repository.GetById<EdgeDevice>(id));
            return Ok(item);
        }

        // POST: api/EdgeDevices
        [HttpPost]
        public IActionResult Post([FromBody] EdgeDeviceDTO item)
        {
            var edgeDeviceItem = new EdgeDevice()
            {
                EdgeDeviceName = item.EdgeDeviceName
            };
            _repository.Add(edgeDeviceItem);
            return Ok(EdgeDeviceDTO.FromEdgeDevice(edgeDeviceItem));
        }
    }
}
