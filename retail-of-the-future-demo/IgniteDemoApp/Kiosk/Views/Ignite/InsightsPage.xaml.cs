using IntelligentKioskSample.Models;
using ServiceListener;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Graphics.Imaging;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Media.Imaging;
using Windows.UI.Xaml.Navigation;
using Windows.UI.Xaml.Shapes;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=234238

namespace IntelligentKioskSample.Views.Ignite
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class InsightsPage : Page
    {

        GapListenerHub gapListener;
        public InsightsViewModel ViewModel { get; set; }
        private bool isUpdating;  // controls autoupdate from DB

        // Shelf Gap drawings
        const int StrokeThickness = 4;
        static readonly SolidColorBrush ShelfGapColor = new SolidColorBrush(Windows.UI.Colors.Teal);
        int imgWidth, imgHeight;
        bool hasGapDetection;

        public InsightsPage()
        {
            this.InitializeComponent();
            this.ViewModel = new InsightsViewModel();
            hasGapDetection = !(string.IsNullOrEmpty(SettingsHelper.Instance.DetectionDelay) || string.IsNullOrEmpty(SettingsHelper.Instance.ShelfCamera));

            if (hasGapDetection)
            {
                gapListener = new GapListenerHub(int.Parse(SettingsHelper.Instance.DetectionDelay), SettingsHelper.Instance.ShelfCamera);
            }
        }

        protected override void OnNavigatedTo(NavigationEventArgs e)
        {
            this.StartUpdateLoop();
            this.counterVis.StartListening();

            if (hasGapDetection)
            {
                this.gapListener.StartListening(OnGapDetection);
            }

            base.OnNavigatedTo(e);
        }

        private void StartUpdateLoop()
        {
            this.isUpdating = true;
            Task.Run(() => this.UpdateLoop());
        }

        private async Task UpdateLoop()
        {
            while (this.isUpdating)
            {
                await Task.Delay(5000);
                this.ViewModel.Update();
                await this.Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, () =>
                {
                    this.ViewModel.OnUpdate();
                });
            }
        }

        private async void OnGapDetection(byte[] image, List<AbsoluteBoundingRect> detections)
        {
            await Dispatcher.RunAsync(Windows.UI.Core.CoreDispatcherPriority.Normal, async () =>
            {
                using (MemoryStream stream = new MemoryStream(image))
                {
                    try
                    {
                        var ras = stream.AsRandomAccessStream();
                        BitmapDecoder decoder = await BitmapDecoder.CreateAsync(BitmapDecoder.JpegDecoderId, ras);
                        var provider = await decoder.GetPixelDataAsync();
                        byte[] buffer = provider.DetachPixelData();

                        WriteableBitmap bitmap = new WriteableBitmap((int)decoder.PixelWidth, (int)decoder.PixelHeight);

                        await bitmap.PixelBuffer.AsStream().WriteAsync(buffer, 0, buffer.Length);
                        ShelfImage.Source = bitmap;

                        ShelfCanvas.Children.Clear();
                        ShelfCanvas.Children.Add(ShelfImage);

                        imgWidth = bitmap.PixelWidth;
                        imgHeight = bitmap.PixelHeight;

                        DrawDetections(detections);
                    }
                    catch (Exception e)
                    {
                        Debug.WriteLine(e.ToString());
                    }
                }
            });

        }

        private void DrawDetections(List<AbsoluteBoundingRect> detections)
        {
            foreach (var detection in detections)
            {
                int xLeft, xRight, yTop, yBottom;
                xLeft = (int)(detection.X * (double)imgWidth);
                xRight = xLeft + (int)(detection.W * (double)imgWidth);
                yTop = (int)(detection.Y * (double)imgHeight);
                yBottom = yTop + (int)(detection.H * (double)imgHeight);

                Line horizTop = new Line { X1 = xLeft, Y1 = yTop, X2 = xRight, Y2 = yTop, Stroke = ShelfGapColor, StrokeThickness = StrokeThickness };
                Line vertRight = new Line { X1 = xRight, Y1 = yTop, X2 = xRight, Y2 = yBottom, Stroke = ShelfGapColor, StrokeThickness = StrokeThickness };
                Line horizBottom = new Line { X1 = xLeft, Y1 = yBottom, X2 = xRight, Y2 = yBottom, Stroke = ShelfGapColor, StrokeThickness = StrokeThickness };
                Line vertLeft = new Line { X1 = xLeft, Y1 = yTop, X2 = xLeft, Y2 = yBottom, Stroke = ShelfGapColor, StrokeThickness = StrokeThickness };

                ShelfCanvas.Children.AddRange(new List<UIElement> { horizTop, vertRight, horizBottom, vertLeft });
            }
        }

        protected override void OnNavigatingFrom(NavigatingCancelEventArgs e)
        {
            this.isUpdating = false;
            this.counterVis.StopListening();
            if (hasGapDetection)
            {
                this.gapListener.StopListening();
            }
            base.OnNavigatingFrom(e);
        }
    }
}
