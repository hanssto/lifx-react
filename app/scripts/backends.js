
/**
 * Backend which manipulates data in memory.
 *
 * All data is reset on a reload of the backend.
 */
function MemoryBackend () {

    //Initial data to test with. Will be reset on reload.
    this.data = {
        "foo": {id: "foo", label: "Foo", power: "on", color: "red"},
        "bar": {id: "bar", label: "Bar", power: "off", color: "yellow"},
        "baz": {id: "baz", label: "Baz", power: "off", color: "green"},
    }

    // Fields used in a state change this backend supports.
    this.validFields = [
        "color",
        "power",
    ]

    /**
     * Fetch the list of lights identified by {selector}.
     *
     * This backend supports only the "all" selector.
     */
    this.listLights = function (selector, callbacks) {
        console.log("MemoryBackend.listLights:", selector); 

       if (selector != "all") {
            throw new Error("Selector not supported.");
        }
        var data = this.data;
        var values = Object.keys(data).map(function(key) {
            return data[key];
        })
        // Poor man's clone, to break pass-by-reference issues.
        // Incidentally makes it behave more like a data transfer.
        values = JSON.parse(JSON.stringify(values));
        callbacks.success.call(this, values);
    }

    /**
     * Toggle the power of the lights identified by {selector}.
     *
     * This backend only supports the id selector, and toggling power for only
     * one light at a time.
     */
    this.togglePower = function (selector, callbacks) {
        console.log("MemoryBackend.togglePower:", selector);

        id = selector.split(":")[1];
        // TODO Handle the nonexistent case.
        var light = this.data[id];

        light.power = light.power == "on" ? "off" : "on";

        var results = {id: light.id, status: "ok", label: light.label};
        callbacks.success.call(this, {results: results});
    }    

    /**
     * Set the state of the lights identified by {selector}.
     *
     * This backend only supports the id selector, and setting state for only
     * one light at a time.
     */
    this.setState = function (selector, state, callbacks) {
        console.log("MemoryBackend..setState:", selector, state);

        id = selector.split(":")[1];
        // TODO Handle the nonexistent case.
        var light = this.data[id];

        this.validFields.forEach(function(field) {
            if (field in state) {
                light[field] = state[field];
            }
        })

        var results = {id: light.id, status: "ok", label: light.label};
        callbacks.success.call(this, {results: results});
    }
}

function DummyAPIBackend () {
    // TODO ...
}

function APIBackend () {
    // TODO ...
}
