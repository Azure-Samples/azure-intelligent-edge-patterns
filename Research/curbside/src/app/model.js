const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { EventAggregator } = require('./eventAggregator.js');

const imageBaseUrl = process.env.IMAGE_BASE_URL || 'https://cdn.vox-cdn.com/thumbor/uJ5pW5aXxI-6RUoUzLVCQmV83Qg=/0x0:6000x4000/1200x800/filters:focal(2520x1520:3480x2480)/cdn.vox-cdn.com/uploads/chorus_image/image/62865330/RPlate_Tesla_S_300_200.0.jpg?'

class Model extends EventEmitter {

    customers = [];
    vehiclesInLot = new Map();
    available = [];
    lot = [];
    events; // the provider of aggregated events from the IoT Hub

    constructor() {
        super();

        const numOfParkingSpots = process.env.PARKING_LOT_SIZE || 2;
        //initalize the spots
        for (let i = 0; i < numOfParkingSpots; i++) {
            this.available.push(i);
            this.lot.push(i);
        }

        // wire event handlers
        this.events = new EventAggregator();
        this.events.on('added', this.trackPlate.bind(this));
        this.events.on('removed', this.removePlate.bind(this));
    }

    intialize = async () => {
        const filePath = path.join(__dirname, 'public/data/customers.json')
        const json = fs.readFileSync(filePath, 'utf-8');
        this.customers = JSON.parse(json).customers;
        this.events.listen(this.processEvent);
        return this;
    }

    * processEvent(eventData) {
        const result = eventData.inferenceData.result;
        const blobframe = eventData.inferenceData.blobframe;

        for (const key in result) {
            if (result.hasOwnProperty(key)) {
                const r = result[key];

                // ignore vehicles that haven't arrived
                if (r['vehicle_state'] != 'arrived') continue;

                r.blobframe = blobframe;
                yield { key: r.plate, value: r };
            }
        }
    }

    determineSpotInLot(inferenceResult) {
        // todo: use the result in the inference to determine the spot
        // randomly choose an available spot 
        const r = Math.floor(Math.random() * this.available.length);
        return this.available.splice(1)[0];
    }

    findSpotForPlate(plate) {
        for (let [k, v] of this.vehiclesInLot.entries()) {
            if (v.licensePlate == plate) return k;
        }
        throw `Could not find a spot for ${plate}!`;
    }

    get parkingSpots() {
        return this.lot.map(i => {
            if (this.vehiclesInLot.has(i)) {
                return this.vehiclesInLot.get(i);
            } else {
                return { index: i + 1 };
            }
        });
    }

    trackPlate(plate, inferenceResult) {
        if (this.customers.length == 0) {
            console.log("We ran out of customers!");
            return;
        }

        const customer = this.customers.pop();
        const spot = this.determineSpotInLot(inferenceResult);
        this.vehiclesInLot.set(spot,
            {
                index: spot + 1,
                name: customer.fullName,
                licensePlate: plate,
                vehicleImageUrl: `${imageBaseUrl}/${inferenceResult.blobframe}`,
                packages: ["blue box", "green container"]
            });

        this.emit('update', this.parkingSpots);
    }

    removePlate(plate) {
        const spot = this.findSpotForPlate(plate);
        this.available.push(spot);
        this.vehiclesInLot.delete(spot);
        this.emit('update', this.parkingSpots);
    }
}

module.exports = { Model };