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
    if (canMine >= 1 && miner.storage < miner.capacity) {
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
    const dirs = [
      { dx: -1, dy: 0 },
      { dx:  1, dy: 0 },
      { dx:  0, dy: -1 },
      { dx:  0, dy:  1 },
    ];
  
    // — PUSH PHASE first: if buffer > 0, try moving it onward
    if (belt.storage > 0) {
      for (let { dx, dy } of dirs) {
        const dst = mapState[belt.col + dx]?.[belt.row + dy];
        // accept into factory or another belt’s buffer
        if (dst && (
              (dst.type === "Factory") ||
              (dst.type === "ConveyorBelt" && dst.storage < dst.capacity)
            )) {
          // move one item
          belt.storage--;
          dst.storage++;
          break;
        }
      }
      // after pushing, we don’t pull this tick
      return;
    }
  
    // — PULL PHASE: if buffer empty, try pulling
    for (let { dx, dy } of dirs) {
      const src = mapState[belt.col + dx]?.[belt.row + dy];
      // miner or belt upstream
      if (src && (src.type === "Miner" || src.type === "ConveyorBelt") && src.storage > 0) {
        src.storage--;
        belt.storage++;
        break;
      }
    }
  }  
}