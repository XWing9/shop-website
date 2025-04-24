import MapGeneration from "./mapgeneration.js";

export default class ObjectLogic{

    constructor() {
        this.mapGeneration = new MapGeneration();
    }

    processBuildings() {
        const now = performance.now();
    
        for (let col = 0; col < this.mapGeneration.mapState.length; col++) { // check ich ned
            for (let row = 0; row < this.mapGeneration.mapState[col].length; row++) {
                const obj = this.mapGeneration.mapState[col][row];
    
                if (!obj) continue; //check ich ned
    
                // Miner Logic
                if (obj.type === "Miner" && obj.storage < obj.capacity) {
                    if (now - obj.lastMinedTime >= 1000) { // Mines every second
                        obj.storage += obj.speed; 
                        obj.storage = Math.min(obj.storage, obj.capacity); // Cap at max storage
                        obj.lastMinedTime = now;
                    }
                }
    
                // Factory Logic
                if (obj.type === "Factory") {
                    const adjacent = this.getAdjacentTiles(col, row);
    
                    for (const tile of adjacent) {
                        if (tile && tile.type === "Miner" && tile.storage > 0) {
                            if (now - obj.lastProcessedTime >= obj.processSpeed * 1000) {
                                obj.storage += 1; // Produces 1 output
                                tile.storage -= 1; // Takes 1 ore from miner
                                obj.lastProcessedTime = now;
                            }
                        }
                    }
                }
            }
        }
    }
    getAdjacentTiles(col, row) {
        return [
            this.mapGeneration.mapState[col - 1]?.[row], // Left
            this.mapGeneration.mapState[col + 1]?.[row], // Right
            this.mapGeneration.mapState[col]?.[row - 1], // Up
            this.mapGeneration.mapState[col]?.[row + 1], // Down
        ].filter(Boolean);
    }

    buildingmessagedisyplays(){
        if (this.mapState[col][row] && this.mapState[col][row].storage !== undefined) {
            this.ctx.fillStyle = "lightgray";
            this.ctx.font = "12px Arial";
            this.ctx.fillText(this.mapState[col][row].storage, x + 5, y + 15);
        }
    }
}