export default class MapGeneration {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.optionsPanel = document.querySelector(".canvasoptions");
        this.mapState = [];

        this.cameraX = 0;
        this.cameraY = 0;
        this.cellSize = 50;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.generateMap();
        this.adjustCanvasSize();

        //Mousewheel event for zoom
        this.canvas.addEventListener("wheel", (e) => this.handleZoom(e));

        // Mouse drag events for panning
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("mousemove", (e) => this.handleDrag(e));
        this.canvas.addEventListener("mouseup", () => this.stopDrag());
        this.canvas.addEventListener("mouseleave", () => this.stopDrag());
    }

    // Adjust canvas size dynamically
    adjustCanvasSize() {
        this.viewportWidth = Math.floor((window.innerWidth * 0.75) / this.cellSize) * this.cellSize; // 75% of screen, rounded
        this.viewportHeight = window.innerHeight; // Full height

        this.canvas.width = this.viewportWidth;
        this.canvas.height = this.viewportHeight;

        this.optionsPanel.style.width = `${window.innerWidth * 0.25}px`; // Sidebar takes 25%
    }

    // Generate the grid with random light yellow nodes
    generateMap(visibleCol,visibleRow) {
        
        const cols = Math.ceil(this.viewportWidth / this.cellSize);
        const rows = Math.ceil(this.viewportHeight / this.cellSize);

        
        this.mapState = Array.from({ length: cols }, () => Array(rows).fill(null));
        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                if (Math.random() < 0.1) { // 10% chance for a yellow node
                    this.mapState[col][row] = "node";
                }
            }
        }
        
    }
    continuesgeneration(visibleCol,visibleRow){
        const currentCols = this.mapState.length;
        const currentRows = this.mapState[0] ? this.mapState[0].length : 0;

        if(currentCols < visibleCol){
            for (currentCols; currentCols < visibleCol; currentCols++) {
                for (currentRows; currentRows < visibleRow; currentRows++) {
                    if (Math.random() < 0.1) { // 10% chance for a yellow node
                        this.mapState[col][row] = "node";
                    }
                }
            }
        }
    }

    // Draw the grid, nodes, and objects
    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear canvas
        for (let col = 0; col < this.mapState.length; col++) {
            for (let row = 0; row < this.mapState[col].length; row++) {
                const x = col * this.cellSize - this.cameraX;
                const y = row * this.cellSize - this.cameraY;

                // Draw grid lines
                this.ctx.strokeStyle = "#ccc";
                this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);

                // Draw light yellow nodes
                if (this.mapState[col][row] === "node") {
                    this.ctx.fillStyle = "lightyellow";
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }

                // Draw objects with stored color
                if (this.mapState[col][row] && this.mapState[col][row].type) {
                    this.ctx.fillStyle = this.mapState[col][row].color;
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }
    }

    // Handle mouse wheel zoom
    handleZoom(event) {
        event.preventDefault();

        if (event.deltaY < 0) {
            // Zoom in
            this.cellSize = Math.min(this.cellSize + 5, 100); // Max zoom in
        } else if (event.deltaY > 0) {
            // Zoom out
            this.cellSize = Math.max(this.cellSize - 5, 20); // Min zoom out

            const visibleCol = Math.ceil(this.canvas.width/this.cellSize)
            const visibleRow = Math.ceil(this.canvas.height/this.cellSize)
            if(visibleCol > this.mapState.length || visibleRow > this.mapState.length){
                this.continuesgeneration(visibleCol,visibleRow)
            }
        }

        this.adjustCanvasSize();
        this.drawGrid();
    }

    // Start dragging for panning
    startDrag(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    // Handle mouse movement during drag (panning)
    handleDrag(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.cameraX -= deltaX;
        this.cameraY -= deltaY;

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;

        if(this.cameraX < deltaX){
            this.continuesgeneration()
        } else {
            this.drawGrid();
        }
    }

    // Stop dragging (panning)
    stopDrag() {
        this.isDragging = false;
    }
}