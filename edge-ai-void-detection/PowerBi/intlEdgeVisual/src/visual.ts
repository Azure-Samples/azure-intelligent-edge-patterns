/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import { blob } from "d3";

export interface columnDefs {
    bbxmin: number;
    bbxmax: number;
    bbymin: number;
    bbymax: number;
    time: number;
    cameraId: number;
}

export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private imageId: string = "tsiImage";
    private canvasId: string = "tsiCanvas";
    private columnIndexes: columnDefs = {
        bbxmin: 0,
        bbxmax: 0,
        bbymin: 0,
        bbymax: 0,
        time: 0,
        cameraId: 0
    };
    private table;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.target = options.element;
        
        if (document) {

            const img: HTMLElement = document.createElement("img");
            img.id = this.imageId;
            img.style.zIndex = '10';
            img.style.position = 'absolute';
            img.style.width = '100%';
            img.addEventListener('load', function() {
                console.log("IMAGE LOADED");
                this.drawVoids();
            }.bind(this));
            this.target.appendChild(img);

            const canvas: HTMLCanvasElement = document.createElement("canvas");
            canvas.id = this.canvasId;
            canvas.style.zIndex = '20';
            canvas.style.position = 'relative';
            this.target.appendChild(canvas);
        }
    }

    private updateImage(blobName) {
        // we're expecting a url like https://storage.blob.core.windows.net/?sv=restOfSasToken
        // split it at the first ? and put the container name and blob name in the middle to result in something like
        // https://storage.blob.core.windows.net/container/blob?sv=restOfSasToken
        var img: HTMLImageElement = <HTMLImageElement>document.getElementById(this.imageId);
        if(this.settings.visuals.blobSasUrl.length == 0) {
            if (img != null) {
                img.alt = 'Need to set Blob SAS URL in Visualizations - Format - Settings';
            }
            return;
        }
            
        var parts = this.settings.visuals.blobSasUrl.split('?', 2);
        var url = parts[0] + this.settings.visuals.blobContainerName + '/' + blobName + '?' + parts[1];
        console.log("IMAGE SRC ", url);

        if (img != null) {
            img.src = url;
            img.alt = blobName;
            // the void will be drawn on the image after it loads
        }
    }

    // this gets called from the load event listener on the image
    private drawVoids() {
        var imageElement: HTMLImageElement = <HTMLImageElement>document.getElementById(this.imageId);
        let imgWidth: number = 0; 
        let imgHeight: number = 0;

        if (imageElement != null) {
            imgWidth = imageElement.width;
            imgHeight = imageElement.height;
        }

        console.log('imgWidth, imgHeight', imgWidth, imgHeight);


        var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(this.canvasId);
        if (canvas != null) {
            canvas.width = imgWidth;
            canvas.height = imgHeight;
            var canvasContext = canvas.getContext("2d");
            canvasContext.clearRect(0, 0, imgWidth, imgHeight);
            canvasContext.strokeStyle = this.settings.visuals.strokeColor;
            canvasContext.lineWidth = this.settings.visuals.lineWidth;

            for(var x = 0; x < this.table.rows.length; x++) {
                let xMin = this.table.rows[x][this.columnIndexes.bbxmin];
                let xMax = this.table.rows[x][this.columnIndexes.bbxmax];
                let yMin = this.table.rows[x][this.columnIndexes.bbymin];
                let yMax = this.table.rows[x][this.columnIndexes.bbymax];
                let canvasX = Math.floor(imgWidth * xMin);
                let canvasY = Math.floor(imgHeight * yMin);
                let canvasWidth = Math.floor(imgWidth * (xMax - xMin));
                let canvasHeight = Math.floor(imgHeight * (yMax - yMin));
                canvasContext.strokeRect(canvasX, canvasY, canvasWidth, canvasHeight);
                console.log("Draw Rect x,y,w,h", canvasX, canvasY, canvasWidth, canvasHeight);
            }
            
        }
    }

    private formatBlobPath(cameraId: string, timestamp: string) {
        // TSI has a small bug where a trailing 0 on the timestamp gets lost 
        // example   : 2019-10-11T08:02:33.5Z 
        // should be : 2019-10-11T08:02:33.500Z
        const formatStr = 'yyyy-mm-ddThh:mm:ss.xxxZ';

        while(timestamp.length < formatStr.length) {
            // pop off the Z and append 0Z
            timestamp = timestamp.slice(0, timestamp.length-1) + '0Z';
        }
        return cameraId + '/' + timestamp + '.jpg';
    }

    public update(options: VisualUpdateOptions) {
        
        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        console.log('Visual update', options);
        console.log('Visual update', this.settings);

        // map the order the data is coming in 
        this.table = options.dataViews[0].table;
        for(var x = 0; x < this.table.columns.length; x++) {
            switch(this.table.columns[x].displayName) {
                case 'bbxmin' : 
                    this.columnIndexes.bbxmin = x; 
                    break;
                case 'bbxmax' : 
                    this.columnIndexes.bbxmax = x; 
                    break;
                case 'bbymin' : 
                    this.columnIndexes.bbymin = x; 
                    break;
                case 'bbymax' : 
                    this.columnIndexes.bbymax = x; 
                    break;
                case 'time' :
                    this.columnIndexes.time = x; 
                    break;
                case 'cameraId' : 
                    this.columnIndexes.cameraId = x; 
                    break;
                default: break;
            }
        }
        console.log('ColumnIndexes', this.columnIndexes);
        // the timestamp and cameraId should be the same for all rows so just pull it off the first row
        let timestamp: string = String(this.table.rows[0][this.columnIndexes.time]);
        let cameraId: string = String(this.table.rows[0][this.columnIndexes.cameraId]);
        console.log('cameraId, timestamp', cameraId, timestamp);
        let blobName = this.formatBlobPath(cameraId, timestamp);
        this.updateImage(blobName);

    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}