require('dotenv').config();

const client = require('azure-iot-device-amqp').clientFromConnectionString(process.env.DEVICE_CONNECTION_STRING);
const Message = require('azure-iot-device').Message;
const readline = require('readline');

const maxPlates = process.env.PARKING_LOT_SIZE || 2;
var plates = [];
var lastUpdate = Date.now();
const loopInterval = 500;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getPlate() {
    var plate = '';
    for (let i = 0; i < 6; i++) {
        const l = Math.random() * (90 - 65) + 65;
        plate += String.fromCharCode(l);
    }
    return plate;
}

function shouldMakeNewPlate() {
    if (plates.length >= maxPlates) return;

    if (Math.random() > (0.1 / plates.length)) return;

    const plate = {
        plate: getPlate(),
        ttl: parseInt((Math.random() * 25 + 5) * 1000, 10)
    }
    console.log(`new plate ${plate.plate} with ttl ${Math.round(plate.ttl / 1000)}s`);
    plates.push(plate);
}

function loop() {
    const delta = Date.now() - lastUpdate;
    lastUpdate = Date.now();

    // should we make a new plate?
    shouldMakeNewPlate();

    // decrement existing plates?
    plates.forEach(p => p.ttl = p.ttl - delta);
    plates = plates.filter(p => p.ttl > 0);

    // send messages
    const data = {
        "timestamp": Date.now(),
        "inferenceData": {
            "object_count": plates.length,
            "result": {},
            "blobframe": "2020-04-26/2020-04-26_17-11-59.062330.jpg"
        }
    };

    plates.forEach((p, i) => {
        data.inferenceData.result[i.toString()] = {
            "plate": p.plate,
            "confidence": Math.random() * 0.3 + 0.7,
            "xmin": 859,
            "ymin": 116,
            "xmax": 1593,
            "ymax": 1074,
            "vehicle_state": "arrived"
        };
    });

    client.open(err => {
        if (err) {
            console.error('Could not connect: ' + err);
        } else {
            const json = JSON.stringify({ data: data });
            const msg = new Message(json);
            // console.log(`sent ${lastUpdate}, ${delta}`);

            client.sendEvent(msg, (err) => {
                if (err) {
                    console.log(err.toString());
                }
            });
        };
    });
}

const handle = setInterval(loop, loopInterval);

rl.question('Press enter to exit...\n', _ => {

    console.log('Exiting...')
    client.close();
    clearInterval(handle);

    rl.close();
});