class Soil {
    constructor(id, PH, moisture, time, deviceId) {
        this.id = id;
        this.PH = PH;
        this.moisture = moisture;
        this.time = time;
        this.deviceId = deviceId;
    }
}

module.exports = Soil;