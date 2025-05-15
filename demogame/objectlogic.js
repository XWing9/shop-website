// objectlogic.js
import MapGeneration from "./mapgeneration.js";  // only if you need helper funcs

export default class ObjectLogic {
  static update(obj, mapState) {
    switch (obj.type) {
      case "Miner":
        return ObjectLogic.miner(obj, mapState);
      case "Factory":
        return ObjectLogic.factory(obj, mapState);
      case "ConveyorBelt":
        return ObjectLogic.conveyorBelt(obj, mapState);
    }
  }

  static miner(miner, mapState) {
    const now = performance.now();
    const elapsed = (now - miner.lastMinedTime) / 1000; 
    const canMine = elapsed * miner.speed;
    if (miner.storage == miner.capacity){
      miner.lastMinedTime = now
    } else if (canMine >= 1 && miner.storage < miner.capacity) {
      miner.storage += Math.floor(canMine);
      miner.lastMinedTime = now;
    }
    // Optionally push ore onto an adjacent belt?
  }

  static factory(factory, mapState) {
    const now = performance.now();
    const elapsed = (now - factory.lastProcessedTime) / 1000;
    const canProcess = elapsed * (factory.processSpeed / 60);
    if (factory.storage > 0 && canProcess >= 1) {
      factory.storage--;
      factory.lastProcessedTime = now;
      // produce output somewhere…
    }
  }

  static conveyorBelt(belt, mapState) {

    if (belt.justPulled === undefined) belt.justPulled = false;
    // map directions to offsets
    const dirMap = {
      LEFT:  { dx: -1, dy:  0 },
      RIGHT: { dx:  1, dy:  0 },
      UP:    { dx:  0, dy: -1 },
      DOWN:  { dx:  0, dy:  1 },
    };
    const { dx, dy } = dirMap[belt.direction];
    if (!dx && !dy) return;  // invalid direction

    if (belt.justPulled) {
      belt.justPulled = false;  // reset for next frame
      return;
    }

    // 1) PUSH if full
    if (belt.storage === belt.capacity) {
      const dst = mapState[belt.col + dx]?.[belt.row + dy];
      if (dst && (
          (dst.type === "Factory" && dst.storage < dst.capacity) ||
          (dst.type === "ConveyorBelt" && dst.storage < dst.capacity)
        )) {
        belt.storage--;
        dst.storage++;
        return;  // pushed, skip pull
      }
    }
    
    // 2) PULL if empty
    if (belt.storage === 0) {
      const src = mapState[belt.col - dx]?.[belt.row - dy];
      if (src && (
          (src.type === "Miner"   && src.storage > 0) ||
          (src.type === "ConveyorBelt" && src.storage > 0)
        )) {
        src.storage--;
        belt.storage++;
        belt.justPulled = true; 
      }
    }
  } 
}