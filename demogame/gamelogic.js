import ObjectData from './objectdata.js';
import MapGeneration from './mapgeneration.js'
import ObjectLogic from './objectlogic.js';

class Main {
    selectedObject = null;
    lastFrameTime = 0;
    fps = 60;
    frameDuration = 1000 / this.fps;

    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        this.mapGeneration = new MapGeneration(this.canvas, this.ctx);
        this.mapGeneration.adjustCanvasSize(); // Only resize canvas, no generateMap() here!

        // Start with empty grid — drawGrid will still draw if anything is there
        this.mapGeneration.drawGrid();

        this.objectPlacement();
        this.toolbar();
        this.buttonInput();
        this.gameloop();
    }

    gameloop(timestamp) {
        if (timestamp - this.lastFrameTime >= this.frameDuration) {
            this.lastFrameTime = timestamp;
            this.update();
        }
        requestAnimationFrame(timestamp => this.gameloop(timestamp));
    }

    update() {
        this.mapGeneration.drawGrid();
    }

    objectPlacement() {
        this.canvas.addEventListener("click", (e) => {
            if (!this.selectedObject) return;

            const rect = this.canvas.getBoundingClientRect();
            const col = Math.floor((e.clientX - rect.left + this.mapGeneration.cameraX) / this.mapGeneration.cellSize);
            const row = Math.floor((e.clientY - rect.top + this.mapGeneration.cameraY) / this.mapGeneration.cellSize);

            this.placeObject(this.selectedObject, col, row);

            if (!this.shiftHeld) {
                this.selectedObject = null;
            }
        });
    }

    placeObject(selectedObject, col, row) {
        const cell = this.mapGeneration.mapState[col]?.[row];

        if (cell && cell !== "node") {
            this.messagedisplay("There already is a building!", true);
            return;
        }

        if (selectedObject === "Miner" && cell !== "node") {
            this.messagedisplay("Miners can only be placed on light yellow nodes!", true);
            return;
        }

        const newObject = ObjectData.create(selectedObject, col, row);
        if (newObject) {
            if (!this.mapGeneration.mapState[col]) this.mapGeneration.mapState[col] = {};
            this.mapGeneration.mapState[col][row] = newObject;
            this.messagedisplay(`${selectedObject} placed at (${col}, ${row})`);
        }
    }

    toolbar() {
        this.shiftheld = false;
        window.addEventListener("keydown", (e) => {
            if (e.key === "Shift") this.shiftHeld = true;
        });
        window.addEventListener("keyup", (e) => {
            if (e.key === "Shift") this.shiftHeld = false;
        });

        document.querySelectorAll(".object").forEach((item) => {
            item.addEventListener("click", (e) => {
                this.selectedObject = e.target.getAttribute("data-type");
                console.log(`Selected: ${this.selectedObject}`);
            });
        });
    }

    messagedisplay(message, isError = false) {
        const chatMessages = document.getElementById("chatMessages");
        const newMessage = document.createElement("div");

        newMessage.textContent = message;
        if (isError) newMessage.classList.add("error-message");

        chatMessages.appendChild(newMessage);

        const messagelimit = 10;
        const messages = chatMessages.getElementsByTagName("div");
        if (messages.length > messagelimit) {
            chatMessages.removeChild(messages[0]);
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    buttonInput() {
        const regenerateMap = document.getElementById("RegenerateMap");
        regenerateMap.addEventListener("click", () => {
            this.mapGeneration.generateMap(); // Clear and regen
            this.mapGeneration.adjustCanvasSize();
            this.mapGeneration.drawGrid();
            this.messagedisplay("Map has been regenerated!");
        });

        const saveGame = document.getElementById("saveGame");
        saveGame.addEventListener("click", () => {
            console.log("Save game clicked");
            // Save logic placeholder
        });

        const loadGame = document.getElementById("loadGame");
        loadGame.addEventListener("click", () => {
            console.log("Load game clicked");
            // Load logic placeholder
        });
    }

    window = window.addEventListener("resize", () => this.mapGeneration.adjustCanvasSize());
}

window.onload = () => {
    new Main();
};