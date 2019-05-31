using RetailDemo.Core.Entities;
using RetailDemo.Core.Interfaces;
using System.Linq;

namespace RetailDemo.Core
{
    public static class DatabasePopulator
    {
        public static int PopulateImageEventsDatabase(IRepository imageEventsRepository)
        {
            if (imageEventsRepository.List<ImageEvent>().Any()) return 0;

            imageEventsRepository.Add(new ImageEvent
            {
                Name = "Test 1",
                Body = new Body
                {
                    Dest_img = "https://retailimages.blob.core.windows.net/dest/9db17470-12af-45c5-8169-09283e7a3163.jpeg",
                    Result = new Result
                    {
                        Num_detections = 3,
                        Size = new Size
                        {
                            Height = string.Empty,
                            Width = string.Empty
                        }
                    }
                }
            });

            imageEventsRepository.Add(new ImageEvent
            {
                Name = "Test 2",
                Body = new Body
                {
                    Dest_img = "https://retailimages.blob.core.windows.net/dest/c521bb54-10de-4d12-82ff-668d102a7b20.jpeg",
                    Result = new Result
                    {
                        Num_detections = 1,
                        Size = new Size
                        {
                            Height = string.Empty,
                            Width = string.Empty
                        }
                    }
                }
            });

            return imageEventsRepository.List<ImageEvent>().Count;
        }

        public static int PopulateEdgeDevicesDatabase(IRepository edgeDevicesRepository)
        {
            if (edgeDevicesRepository.List<EdgeDevice>().Any()) return 0;

            edgeDevicesRepository.Add(new EdgeDevice
            {
                EdgeDeviceId = 1,
                EdgeDeviceName = "retail-onsite-dbe-edge"
            });

            edgeDevicesRepository.Add(new EdgeDevice
            {
                EdgeDeviceId = 2,
                EdgeDeviceName = "retail-test-dbe-edge"
            });

            return edgeDevicesRepository.List<EdgeDevice>().Count;
        }
    }
}
