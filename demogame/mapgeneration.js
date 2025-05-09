export default class MapGeneration {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.optionsPanel = document.querySelector(".canvasoptions");
        this.mapState = {};

        this.cameraX = 0;
        this.cameraY = 0;
        this.cellSize = 50;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Cluster parameters
        this.clusterCenters = [];
        this.clusterDistance = 25;    
        this.clusterProbability = 0.02;

        this.minClusterRadius = 3;
        this.maxClusterRadius = 6;

        this.adjustCanvasSize();
        this.generateMap();

        this.canvas.addEventListener("wheel", (e) => this.handleZoom(e));
        this.canvas.addEventListener("mousedown", (e) => this.startDrag(e));
        this.canvas.addEventListener("mousemove", (e) => this.handleDrag(e));
        this.canvas.addEventListener("mouseup", () => this.stopDrag());
        this.canvas.addEventListener("mouseleave", () => this.stopDrag());
    }

    adjustCanvasSize() {
        this.viewportWidth = Math.floor((window.innerWidth * 0.75) / this.cellSize) * this.cellSize;
        this.viewportHeight = window.innerHeight;

        this.canvas.width = this.viewportWidth;
        this.canvas.height = this.viewportHeight;

        this.optionsPanel.style.width = `${window.innerWidth * 0.25}px`;
    }

    isFarFromClusters(x, y) {
        return this.clusterCenters.every(c => {
            return Math.hypot(c.x - x, c.y - y) >= this.clusterDistance;
        });
    }

    generateCluster(cx, cy) {

        const r = Math.floor(
          Math.random() * (this.maxClusterRadius - this.minClusterRadius + 1)
        ) + this.minClusterRadius;
    
        for (let dx = -r; dx <= r; dx++) {
            for (let dy = -r; dy <= r; dy++) {
                if (dx*dx + dy*dy <= r*r) {
                    const x = cx + dx;
                    const y = cy + dy;
                    if (!this.mapState[x]) this.mapState[x] = {};
                    this.mapState[x][y] = "node";
                }
            }
        }
    
        this.clusterCenters.push({ x: cx, y: cy });
    }
    
    generateMap() {
        this.adjustCanvasSize();
        this.clusterCenters = [];

        const visibleCols = Math.ceil(this.canvas.width / this.cellSize);
        const visibleRows = Math.ceil(this.canvas.height / this.cellSize);
        const halfCols = Math.floor(visibleCols / 2);
        const halfRows = Math.floor(visibleRows / 2);

        this.mapState = {};

        for (let x = -halfCols; x < halfCols; x++) {
            if (!this.mapState[x]) this.mapState[x] = {};
            for (let y = -halfRows; y < halfRows; y++) {
                
                if (Math.random() < this.clusterProbability && this.isFarFromClusters(x, y)) {
                    this.generateCluster(x, y);
                } else if (this.mapState[x][y] === undefined) {
                    
                    this.mapState[x][y] = null;
                }
            }
        }

        this.cameraX = -(this.canvas.width / 2 - this.cellSize / 2);
        this.cameraY = -(this.canvas.height / 2 - this.cellSize / 2);
    }

    continuesGeneration(minCol, maxCol, minRow, maxRow) {
        for (let x = minCol; x <= maxCol; x++) {
            if (!this.mapState[x]) this.mapState[x] = {};
            for (let y = minRow; y <= maxRow; y++) {
                if (this.mapState[x][y] === undefined) {
                    
                    if (Math.random() < this.clusterProbability && this.isFarFromClusters(x, y)) {
                        this.generateCluster(x, y);
                    } else {
                        this.mapState[x][y] = null;
                    }
                }
            }
        }
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const cellSize = this.cellSize;

        for (let x in this.mapState) {
            for (let y in this.mapState[x]) {
                const cell = this.mapState[x][y];
                const screenX = x * cellSize - this.cameraX;
                const screenY = y * cellSize - this.cameraY;
                
                this.ctx.strokeStyle = "#ccc";
                this.ctx.strokeRect(screenX, screenY, cellSize, cellSize);
                
                if (cell === "node") {
                    this.ctx.fillStyle = "lightyellow";
                    this.ctx.fillRect(screenX, screenY, cellSize, cellSize);
                }
               
                else if (cell && cell.type) {
                    this.ctx.fillStyle = cell.color;
                    this.ctx.fillRect(screenX, screenY, cellSize, cellSize);

                    cell.screenX    = screenX;
                    cell.screenY    = screenY;
                    cell.screenSize = cellSize;
                }
            }
        }
    }

    handleZoom(event) {
        event.preventDefault();
        if (event.deltaY < 0) {
            this.cellSize = Math.min(this.cellSize + 5, 100);
        } else {
            this.cellSize = Math.max(this.cellSize - 5, 20);
        }
        const minCol = Math.floor(this.cameraX / this.cellSize) - 1;
        const maxCol = minCol + Math.ceil(this.canvas.width / this.cellSize) + 2;
        const minRow = Math.floor(this.cameraY / this.cellSize) - 1;
        const maxRow = minRow + Math.ceil(this.canvas.height / this.cellSize) + 2;
        this.continuesGeneration(minCol, maxCol, minRow, maxRow);
        this.adjustCanvasSize();
        this.drawGrid();
    }

    startDrag(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    handleDrag(event) {
        if (!this.isDragging) return;
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;
        this.cameraX -= deltaX;
        this.cameraY -= deltaY;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        const minCol = Math.floor(this.cameraX / this.cellSize) - 1;
        const maxCol = minCol + Math.ceil(this.canvas.width / this.cellSize) + 2;
        const minRow = Math.floor(this.cameraY / this.cellSize) - 1;
        const maxRow = minRow + Math.ceil(this.canvas.height / this.cellSize) + 2;
        this.continuesGeneration(minCol, maxCol, minRow, maxRow);
        this.drawGrid();
    }

    stopDrag() {
        this.isDragging = false;
    }
}