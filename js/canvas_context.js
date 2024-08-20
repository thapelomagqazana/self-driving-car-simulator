class CanvasContext {
    constructor() {
        if (CanvasContext.instance) {
            return CanvasContext.instance;
        }

        this.canvas = document.getElementById('simulatorCanvas');
        if (!this.canvas) {
            throw new Error("Canvas element not found");
        }
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            throw new Error("Unable to get canvas context");
        }

        CanvasContext.instance = this;
    }

    static getInstance() {
        if (!CanvasContext.instance) {
            new CanvasContext();
        }
        return CanvasContext.instance.ctx;
    }
}

export default CanvasContext;