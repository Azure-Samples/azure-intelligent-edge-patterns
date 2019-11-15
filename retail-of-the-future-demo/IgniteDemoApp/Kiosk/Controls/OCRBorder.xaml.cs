﻿// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Cognitive Services: http://www.microsoft.com/cognitive
// 
// Microsoft Cognitive Services Github:
// https://github.com/Microsoft/Cognitive
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// 

using System;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media;

// The User Control item template is documented at http://go.microsoft.com/fwlink/?LinkId=234236

namespace IntelligentKioskSample.Controls
{
    public sealed partial class OCRBorder : UserControl
    {
        private double captionAngle = 0;
        private PointCollection points;

        public OCRBorder()
        {
            this.InitializeComponent();
        }

        public void SetPoints(PointCollection points, string text, double captionAngle = 0)
        {
            this.points = points;
            this.borderRectangle.Points = points;
            this.captionText.Text = text;
            this.captionAngle = captionAngle;

            // set size
            if (points.Count >= 4)
            {
                double width = Math.Abs(this.points[0].X - this.points[1].X);
                double height = Math.Abs(this.points[0].Y - this.points[3].Y);
                this.captionBorder.Width = width;
                this.captionBorder.Height = height;
            }

            // set angle
            var transform = new RotateTransform { Angle = this.captionAngle };
            this.captionViewBox.RenderTransform = transform;
            this.captionBorder.RenderTransform = transform;
            captionText.RenderTransform = new RotateTransform { Angle = -this.captionAngle };
        }

        private void OnCaptionSizeChanged(object sender, SizeChangedEventArgs e)
        {
            // set margins
            if (this.points.Count >= 4)
            {
                double left = this.points[0].X > this.points[3].X ? this.points[0].X : this.points[3].X;
                double top = this.points[0].Y;
                this.captionBorder.Margin = new Thickness(left, top, 0, 0);
            }
        }
    }
}