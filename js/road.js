import CanvasContext from './canvas_context.js';
import Segment from './segment.js';
import Logger from './logger.js';

class Road {
    constructor(x, width, laneCount, segmentHeight) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.segmentHeight = segmentHeight;
        this.segments = [];
        this.scrollSpeed = 5;
        this.offsetY = 0;
        this.initializeSegments();
    }

    initializeSegments() {
        const ctx = CanvasContext.getInstance();
        const segmentCount = Math.ceil(ctx.canvas.height / this.segmentHeight) + 1;
        for (let i = 0; i < segmentCount; i++) {
            this.segments.push(new Segment(-i * this.segmentHeight, this.segmentHeight, this.laneCount, this.x, this.width));
        }
    }

    draw() {
        const ctx = CanvasContext.getInstance();
        try {
            this.segments.forEach(segment => segment.drawSegment(ctx));

            // Draw road boundaries
            ctx.setLineDash([]);
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'yellow';

            ctx.beginPath();
            ctx.moveTo(this.x - this.width / 2, 0);
            ctx.lineTo(this.x - this.width / 2, ctx.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, 0);
            ctx.lineTo(this.x + this.width / 2, ctx.canvas.height);
            ctx.stroke();
        } catch (error) {
            Logger.error(`Failed to draw road: ${error.message}`);
        }
    }

    update(scrollSpeed) {
        this.scrollSpeed = scrollSpeed;
        const ctx = CanvasContext.getInstance();
        this.segments.forEach(segment => segment.update(this.scrollSpeed, ctx.canvas.height));
    }

    checkBoundaries(car) {
        const leftBoundary = this.x - this.width / 2;
        const rightBoundary = this.x + this.width / 2;

        if (car.x - car.width / 2 < leftBoundary) {
            car.x = leftBoundary + car.width / 2;
        } else if (car.x + car.width / 2 > rightBoundary) {
            car.x = rightBoundary - car.width / 2;
        }
    }
}

export default Road;