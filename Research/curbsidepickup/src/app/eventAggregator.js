const { EventEmitter } = require('events');
const iothub = require('./iothub.js');

class EventAggregator extends EventEmitter {

    #map = new Map();
    #ttl = new Map();
    #expireAfters = 5000; //ms
    #updateFrequency = 1000; //ms
    #lastUpdated = Date.now();

    constructor(expireAfters, updateFrequency) {
        super();

        if (expireAfters) this.#expireAfters = expireAfters;
        if (updateFrequency) this.#updateFrequency = updateFrequency;
    }

    listen(processor) {
        iothub.listen(data => {
            for (const kv of processor(data)) {
                this.add(kv.key, kv.value);
            }
        });
        setInterval(this.checkForExpirations.bind(this), this.#updateFrequency);
    }

    checkForExpirations() {
        const now = Date.now();
        const delta = now - this.#lastUpdated;
        this.#lastUpdated = now;

        for (let key of this.#ttl.keys()) {
            const newTtl = this.#ttl.get(key) - delta;
            this.#ttl.set(key, newTtl);
        }

        const expiredKeys = Array
            .from(this.#ttl)
            .filter(x => x[1] < 0)
            .map(x => x[0]);

        expiredKeys.forEach(key => {
            const expiredValue = this.#map.get(key);
            this.#ttl.delete(key);
            this.#map.delete(key);
            this.emit('removed', key, expiredValue);
        });
    }

    add(key, value) {

        if (!this.#map.has(key)) {
            this.emit('added', key, value);
        }

        this.#map.set(key, value);
        this.#ttl.set(key, this.#expireAfters);
    }
}

module.exports = { EventAggregator };