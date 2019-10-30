using System;
using System.Collections.Generic;
using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;
using RetailDemo.Web.ApiModels;
using RetailDemo.Web.Filters;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace RetailDemo.Web.Api
{
    public class ImageEventsController : BaseApiController
    {
        private readonly IImageEventRepository _repository;
        private readonly IRedisDbContext _redisDb;

        public ImageEventsController(IRedisDbContext redisDb)
        {
            //_repository = repository;
            _redisDb = redisDb;
        }

        // GET: api/ImageEvents
        [HttpGet]
        public IActionResult List()
        {
            var items = _repository.List<ImageEvent>()
                            .Select(ImageEventDTO.FromImageEvent);
            return Ok(items);
        }

        // GET: api/ImageEvents
        [HttpGet("{id:int}")]
        public IActionResult GetById(int id)
        {
            ImageEvent imageEvent = new ImageEvent();

            if (id > 0)
            {
                imageEvent = _repository.GetById<ImageEvent>(id);
            }

            if (String.IsNullOrEmpty(imageEvent.Name))
            {
                return BadRequest("Not found");
            }

            var body = _repository.GetById<Body>(imageEvent.Id);
            var result = _repository.GetById<Result>(body.Id);
            var size = _repository.GetById<Size>(result.Id);
            //var detectionBoxes = _repository.List<DetectionBoxes>().Select(d => d.);

            imageEvent.Body = body;
            imageEvent.Body.Result = result;
            imageEvent.Body.Result.Size = size;
            //imageEvent.Body.Result.Detection_boxes = detectionBoxes;


            return Ok(ImageEventDTO.FromImageEvent(imageEvent));
        }

        // GET: api/ImageEvents/EdgeDvice
        //NOTE: this method retrieves the image event form redis and not SQL for perf reasons
        [HttpGet("edgeDevice/{edgeDevice}")]
        public IActionResult GetLast(string edgeDevice)
        {
            ImageEvent imageEvent = new ImageEvent();

            // var strGetData = _redisDb.GetEvent(edgeDevice);
            var strGetData = _redisDb.GetEvent("ImageEvent");

            if (String.IsNullOrEmpty(strGetData) || String.IsNullOrEmpty(edgeDevice))
            {
                return BadRequest("No image events were found");
            }

            ImageEventDTO imageEventDTO = JsonConvert.DeserializeObject<ImageEventDTO>(strGetData);

            imageEvent = ImageEventDTO.ToImageEvent(imageEventDTO);

            //imageEvent = _inMemRepository.GetLast(edgeDevice);

            //if (String.IsNullOrEmpty(imageEvent.Name) || String.IsNullOrEmpty(edgeDevice))
            //{
            //    return BadRequest("Not found");
            //}

            //var body = _inMemRepository.GetById<Body>(imageEvent.Id);
            //var result = _inMemRepository.GetById<Result>(body.Id);
            //var size = _inMemRepository.GetById<Size>(result.Id);
            ////var detectionBoxes = _repository.List<DetectionBoxes>().Select(d => d.);

            //imageEvent.Body = body;
            //imageEvent.Body.Result = result;
            //imageEvent.Body.Result.Size = size;
            //imageEvent.Body.Result.Detection_boxes = detectionBoxes;


            return Ok(ImageEventDTO.FromImageEvent(imageEvent));
        }

        // POST: api/ImageEvents
        [HttpPost]
        public IActionResult Post([FromBody] ImageEventDTO item)
        {
            if (String.IsNullOrEmpty(item.EdgeDeviceName))
            {
                return BadRequest("No Edge device found in POST request.");
            }

            var imageEvent = ImageEventDTO.ToImageEvent(item);

            var serImageEvent = JsonConvert.SerializeObject(imageEvent);

            var response = _redisDb.SetEvent(item.EdgeDeviceName, serImageEvent);

            if (!response) {
                return BadRequest("Can't persist on Redis cache.");
            }

            // Commenting out this lines to skip persisting to SQL
            //_repository.Add(imageEvent);
            //imageEvent.Id = 0;
            //imageEvent.Body.Id = 0;
            //imageEvent.Body.Result.Id = 0;
            //imageEvent.Body.Result.Size.Id = 0;

            //_repository.Add(imageEvent);

            return Ok(ImageEventDTO.FromImageEvent(imageEvent));
        }

        // PUT: api/ImageEvents
        [HttpPut]
        public async Task<IActionResult> Put([FromBody] IFormFileImageEvent imageEventFile)
        {
            if (imageEventFile.imageFile == null || imageEventFile.imageFile.Length == 0)
            {
                return BadRequest("Invalid file or empty.");
            }

            var imageEvent = ImageEventDTO.ToImageEvent(imageEventFile.imageEventDTO);

            using (var memoryStream = new MemoryStream())
            {
                await imageEventFile.imageFile.CopyToAsync(memoryStream);

                imageEvent.EncodedImage = memoryStream.ToArray();
            }


            var response = _redisDb.SetEvent(imageEvent.EdgeDeviceName, JsonConvert.SerializeObject(imageEvent));

            if (!response)
            {
                return BadRequest("Can't persist on Redis cache.");
            }

            // TODO: Clean this as part of code clean up for memory cache changes
            imageEvent.Id = 0;
            imageEvent.Body.Id = 0;
            imageEvent.Body.Result.Id = 0;
            imageEvent.Body.Result.Size.Id = 0;
            imageEvent.EncodedImage = new byte[0]; // Clear encoded image before saving to sql, remove this line to persist image in SQL

            //_repository.Add(imageEvent); //Uncomment this line to enable SQL persist

            return Ok(ImageEventDTO.FromImageEvent(imageEvent));
        }
    }

    // Wrapper of the IFormFile to include the image event object
    public class IFormFileImageEvent
    {
        public ImageEventDTO imageEventDTO { get; set; }
        public IFormFile imageFile { get; set; }
    }
}
