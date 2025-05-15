import ObjectData from './objectdata.js';
import MapGeneration from './mapgeneration.js';
import ObjectLogic from './objectlogic.js';

class Main {
    frameCount = 0
    selectedObject = null;
    lastFrameTime  = 0;
    fps            = 60;
    frameDuration  = 1000 / this.fps;
    activeInfoObj = null;

    constructor() {
        this.objectsById   = {};
        this.nextObjectId  = 1;

        this.canvas = document.getElementById("gameCanvas");
        this.ctx    = this.canvas.getContext("2d");

        this.mapGeneration = new MapGeneration(this.canvas, this.ctx);
        this.mapGeneration.adjustCanvasSize();
        this.mapGeneration.drawGrid();

        this.toolbar();
        this.buttonInput();

        // Combined click handler: inspect → place → hide
        this.canvas.addEventListener("click", e => {
            const rect   = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // 1) Inspect existing objects
            for (let id in this.objectsById) {
                const obj = this.objectsById[id];
                if (
                    clickX >= obj.screenX &&
                    clickX <= obj.screenX + obj.screenSize &&
                    clickY >= obj.screenY &&
                    clickY <= obj.screenY + obj.screenSize
                ) {
                    this.showInfoPanel(obj, e.clientX, e.clientY);
                    return;
                }
            }

            // 2) Place new object if one is selected
            if (this.selectedObject) {
                const col = Math.floor((clickX + this.mapGeneration.cameraX) / this.mapGeneration.cellSize);
                const row = Math.floor((clickY + this.mapGeneration.cameraY) / this.mapGeneration.cellSize);
                this.placeObject(this.selectedObject, col, row);
                if (!this.shiftHeld) this.selectedObject = null;
                return;
            }

            // 3) Otherwise, hide the info panel
            document.getElementById("infoPanel").style.display = "none";
        });

        this.gameloop();
    }

    gameloop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const deltaMs = timestamp - this.lastFrameTime;
        if (deltaMs >= this.frameDuration) {
            this.lastFrameTime = timestamp;
            this.update(deltaMs);
        }
        requestAnimationFrame(ts => this.gameloop(ts));
    }

    update(deltaTimeMs) {
        this.mapGeneration.drawGrid();
        for (let id in this.objectsById) {
            ObjectLogic.update(this.objectsById[id], this.mapGeneration.mapState);
        }

        if (this.activeInfoObj) {
            this._renderInfoPanel();
        }
        //Main.frameCount++
        //reset frame somewhere so it doesnt gets to big
    }

    placeObject(selectedObject, col, row) {
        const cell = this.mapGeneration.mapState[col]?.[row];
        if (cell && cell !== "node") {
            return this.messagedisplay("There already is a building!", true);
        }
        if (selectedObject === "Miner" && cell !== "node") {
            return this.messagedisplay("Miners can only be placed on light yellow nodes!", true);
        }

        const id  = this.nextObjectId++;
        const obj = ObjectData.create(selectedObject, col, row);
        if (!obj) return;
        obj.id  = id;
        obj.col = col;
        obj.row = row;

        this.objectsById[id] = obj;
        if (!this.mapGeneration.mapState[col]) this.mapGeneration.mapState[col] = {};
        this.mapGeneration.mapState[col][row] = obj;

        this.messagedisplay(`${selectedObject} placed at (${col}, ${row})`);
    }

    showInfoPanel(obj, pageX, pageY) {
        this.activeInfoObj = obj;       // remember which object we’re showing
        this.infoX = pageX - 40;        // also store desired panel position
        this.infoY = pageY + 100;
        this._renderInfoPanel();        // draw it immediately
    }

    _renderInfoPanel() {
        const obj   = this.activeInfoObj;
        if (!obj) return;
        const panel = document.getElementById("infoPanel");
        panel.style.display = "block";
        panel.style.left    = `${this.infoX}px`;
        panel.style.top     = `${this.infoY}px`;
        panel.innerHTML     = `
            <strong>${obj.type} (ID: ${obj.id})</strong><br>
            Storage: ${obj.storage || 0}${obj.capacity ? ` / ${obj.capacity}` : ""}<br>
            Speed: ${obj.speed || obj.processSpeed || obj.transportspeed}
        `;
    }

    toolbar() {
        this.shiftHeld = false;
        window.addEventListener("keydown", e => {
            if (e.key === "Shift") this.shiftHeld = true;
        });
        window.addEventListener("keyup", e => {
            if (e.key === "Shift") this.shiftHeld = false;
        });

        document.querySelectorAll(".object").forEach(item => {
            item.addEventListener("click", e => {
                this.selectedObject = e.target.getAttribute("data-type");
                console.log(`Selected: ${this.selectedObject}`);
            });
        });
    }

    messagedisplay(message, isError = false) {
        const chat = document.getElementById("chatMessages");
        const div  = document.createElement("div");
        div.textContent = message;
        if (isError) div.classList.add("error-message");
        chat.appendChild(div);
        while (chat.children.length > 10) chat.removeChild(chat.firstChild);
        chat.scrollTop = chat.scrollHeight;
    }

    buttonInput() {
        document.getElementById("RegenerateMap").addEventListener("click", () => {
            this.mapGeneration.generateMap();
            this.mapGeneration.adjustCanvasSize();
            this.mapGeneration.drawGrid();
            this.messagedisplay("Map has been regenerated!");
        });
        document.getElementById("saveGame").addEventListener("click", () =>
            console.log("Save game clicked")
        );
        document.getElementById("loadGame").addEventListener("click", () =>
            console.log("Load game clicked")
        );
    }
}

window.onload = () => new Main();