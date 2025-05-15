export default class ObjectData {
    static create(type, col, row) {
        switch (type) {
            case "Miner":
                return {
                    type: "Miner",
                    storage: 0,
                    capacity: 10, // Max 10 ores
                    speed: 30 / 60, // 10 per minute → converted to per second
                    lastMinedTime: performance.now(),
                    color: "red",
                };

            case "Factory":
                return {
                    type: "Factory",
                    storage: 0,
                    capacity: 10,
                    inputRequired: "ore",
                    output: "processedMaterial",
                    processSpeed: 10 / 1, // 20 items every minute
                    lastProcessedTime: performance.now(),
                    color: "green",
                };

            case "ConveyorBelt":
                return {
                    type: "ConveyorBelt",
                    storage: 0,
                    capacity: 1,
                    transportspeed: 10/1,
                    direction: "RIGHT",
                    color: "grey",
                };

            default:
                return null;
        }
    }
}