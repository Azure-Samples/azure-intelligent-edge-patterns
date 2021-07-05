// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

using System;
using System.IO;
using System.Net.Mime;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Newtonsoft.Json.Linq;

namespace VAPManagerService.Controllers
{
    #region ImageController
    [Route("api/[controller]")]
    [ApiController]
    public class ImageItemsController : ControllerBase
    {
        static SemaphoreSlim _semaphoreSlim = new SemaphoreSlim(1, 1);

        public ImageItemsController() { }
        #endregion

        #region snippet_CreateImage
        // POST: api/ImageItems
        [Produces("application/json")]
        [HttpPost]
        public async Task<IActionResult> PostImageItem()
        {
            string results = "";
            JObject response;
            MediaTypeCollection myContentTypes = new MediaTypeCollection { MediaTypeNames.Application.Json };
            byte[] imageByte = null;
            using (var ms = new MemoryStream())
            {
                await Request.Body.CopyToAsync(ms);
                imageByte = ms.ToArray();
            }

            //System.IO.File.WriteAllBytes("image.jpg", imageByte);
            int imageSize = imageByte.Length;

            //buffer the latest frame
            VideoPipelineCore.VAPCore.BufferFrame(imageByte);
            Console.WriteLine($"Post Received.\tImage Size: {imageSize}\tTime: {DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss.fff tt")}\tbSize: {VideoPipelineCore.VAPCore.GetFrameBufferSize()}");

            //wait until processing on previous frames is done
            while (VideoPipelineCore.VAPCore.GetDNNRunningState())
            {
                //Console.WriteLine("backoff...");
                Thread.Sleep(20);
            }

            
            await _semaphoreSlim.WaitAsync();
            //process the first frame in the buffer queue
            try
            {
                results = VideoPipelineCore.VAPCore.RunOneFrame();
            }
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                VideoPipelineCore.VAPCore.isDNNRunning = false;
            }
            finally
            {
                _semaphoreSlim.Release();
            }

            if (results == "" || results == null)
                return Ok(results); //only when dequeue exception happens (i.e., with *****Resize Reset*****)

            response = JObject.Parse(results);
            return new ObjectResult(response) { StatusCode = 200, ContentTypes = myContentTypes };
        }
        #endregion
    }
}
