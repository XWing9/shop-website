import ObjectData from './objectdata.js';
import MapGeneration from './mapgeneration.js'
import ObjectLogic from './objectlogic.js';

class Main {
    selectedObject = null; // Store the currently selected object
    lastFrameTime = 0; // Track the last frame time
    fps = 60; // Target FPS
    frameDuration = 1000 / this.fps; // Duration of each frame in milliseconds

    constructor() {
        this.canvas = document.getElementById("gameCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Initialize MapGeneration with canvas and ctx
        this.mapGeneration = new MapGeneration(this.canvas, this.ctx);
        this.mapGeneration.adjustCanvasSize();
        this.mapGeneration.generateMap();
        this.mapGeneration.drawGrid();
    
        //this.buildinglogic = new ObjectLogic()
        //this.buildinglogic.processBuildings()

        this.objectPlacement();
        this.toolbar();
        this.buttonInput();
        this.gameloop();
    }

    // Game loop
    gameloop(timestamp) {
        if (timestamp - this.lastFrameTime >= this.frameDuration) {
            this.lastFrameTime = timestamp;
            this.update();
        }
        requestAnimationFrame(timestamp => this.gameloop(timestamp)); // Call the gameloop again for the next frame
    }

    // Update the game state and draw
    update() {
        this.mapGeneration.drawGrid();
    }

    // Handle object placement and calculates position with mouse to place
    objectPlacement() {
        this.canvas.addEventListener("click", (e) => {
            if (!this.selectedObject) return;
    
            const rect = this.canvas.getBoundingClientRect();
            
            // Adjust for camera position
            const col = Math.floor((e.clientX - rect.left + this.mapGeneration.cameraX) / this.mapGeneration.cellSize);
            const row = Math.floor((e.clientY - rect.top + this.mapGeneration.cameraY) / this.mapGeneration.cellSize);
    
            // Ensure placement is within bounds
            if (col >= 0 && row >= 0 && col < this.mapGeneration.mapState.length && row < this.mapGeneration.mapState[0].length) {
                this.placeObject(this.selectedObject, col, row);

                if (!this.shiftHeld) {
                    this.selectedObject = null;
                }
            }
        });
    }
    

    placeObject(selectedObject, col, row) {
        if (!this.mapGeneration.mapState[col] || this.mapGeneration.mapState[col][row] === undefined) return;
    
        // Ensure Miners can only be placed on light yellow nodes
        if (this.mapGeneration.mapState[col][row] !== null && this.mapGeneration.mapState[col][row] !== "node") {
            this.messagedisplay("There already is a building!", true);
            return;
        } else if (selectedObject === "Miner" && this.mapGeneration.mapState[col][row] !== "node") {
            this.messagedisplay("Miners can only be placed on light yellow nodes!", true);
            return;
        }
    
        // Create the object using ObjectData
        const newObject = ObjectData.create(selectedObject, col, row);
    
        if (newObject) {
            this.mapGeneration.mapState[col][row] = newObject;
            this.messagedisplay(`${selectedObject} placed at (${col}, ${row})`);
        }
    }
    

    // Handle toolbar selections
    toolbar() {
        this.shiftheld = false
        window.addEventListener( "keydown", (e) => {
            if (e.key === "Shift") this.shiftHeld = true
        })
        window.addEventListener("keyup", (e) =>{
            if(e.key === "Shift") this.shiftHeld = false
        })

        document.querySelectorAll(".object").forEach((item) => {
            item.addEventListener("click", (e) => {
                this.selectedObject = e.target.getAttribute("data-type");
                console.log(`Selected: ${this.selectedObject}`);
            });
        });
    }

    messagedisplay(message, isError = false){
        const chatMessages = document.getElementById("chatMessages")
        const newMessage = document.createElement("div")

        newMessage.textContent = message

        if(isError){
            newMessage.classList.add("error-message")
        }

        chatMessages.appendChild(newMessage)

        const messagelimit = 10;
        const messages = chatMessages.getElementsByTagName("div")

        if(messages.length > messagelimit){
            chatMessages.removeChild(messages[0])
        }

        chatMessages.scrollTop = chatMessages.scrollHeight
    }

    buttonInput(){
        const regenerateMap = document.getElementById("RegenerateMap");
        regenerateMap.addEventListener("click", () => {
            this.mapGeneration.generateMap(); // Regenerate the map
            console.log("Map has been regenerated!");
        });
        const saveGame = document.getElementById("saveGame");
        saveGame.addEventListener("click", () => {
            console.log("Save game clicked");
            // Save game logic
        });
        const loadGame = document.getElementById("loadGame");
        loadGame.addEventListener("click", () => {
            console.log("Load game clicked");
            // Load game logic
        });
    }

    // Handle resizing
    window = window.addEventListener("resize", () => this.mapGeneration.adjustCanvasSize());
}

// Initialize the game
window.onload = () => {
    new Main(); // Create and initialize the Main class when window loads
};