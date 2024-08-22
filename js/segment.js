import CanvasContext from './canvas_context.js';
import ObjectFactory from './object_factory.js';

class Segment {
    constructor(y, segmentHeight, laneCount, roadX, roadWidth) {
        this.y = y;
        this.segmentHeight = segmentHeight;
        this.laneCount = laneCount;
        this.roadX = roadX;
        this.roadWidth = roadWidth;
        this.objects = this.generateRoadObjects();
    }

    generateRoadObjects() {
        const objects = [];
        const objectCount = Math.random() > 0.5 ? 1 : 0;

        for (let i = 0; i < objectCount; i++) {
            const isLeftSide = Math.random() > 0.5;
            const x = isLeftSide
                ? this.roadX - this.roadWidth / 2 - 30
                : this.roadX + this.roadWidth / 2 + 30;
            const y = Math.random() * this.segmentHeight;
            const type = isLeftSide ? 'tree' : 'barrier';

            try {
                const roadObject = ObjectFactory.createObject(type, x, y);
                objects.push(roadObject);
            } catch (error) {
                Logger.error(error.message);
            }
        }

        if (Math.random() < 0.3) {
            const laneWidth = this.roadWidth / this.laneCount;
            const lane = Math.floor(Math.random() * this.laneCount);
            const x = this.roadX - this.roadWidth / 2 + laneWidth / 2 + lane * laneWidth;

            const object = ObjectFactory.createObject('obstacle', x, this.y + Math.random() * this.segmentHeight);
            // console.log(object);

            objects.push(object);
        }

        return objects;
    }

    drawSegment(ctx) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.roadX - this.roadWidth / 2, this.y, this.roadWidth, this.segmentHeight);

        // Draw lane markings
        ctx.setLineDash([20, 20]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';

        const laneWidth = this.roadWidth / this.laneCount;
        for (let i = 1; i < this.laneCount; i++) {
            const x = this.roadX - this.roadWidth / 2 + i * laneWidth;
            ctx.beginPath();
            ctx.moveTo(x, this.y);
            ctx.lineTo(x, this.y + this.segmentHeight);
            ctx.stroke();
        }

        this.drawObjects(ctx);
    }

    drawObjects(ctx) {
        for (let object of this.objects) {
            ctx.fillStyle = object.color;
            ctx.fillRect(object.x, object.y + this.y, object.width, object.height);
        }
    }

    update(scrollSpeed, canvasHeight, maxSpeed) {
        // Update the segment's position
        this.y += scrollSpeed;

        // Update the position of all objects in the segment
        this.objects.forEach(object => {
            if ( object.y < canvasHeight ){
                if (scrollSpeed > maxSpeed) {
                    scrollSpeed = maxSpeed;
                }
                object.y += scrollSpeed;
            }
        });
        // console.log(this.objects);

        // If the segment moves out of the screen, reset its position
        if (this.y > canvasHeight) {
            this.y = -this.segmentHeight;
            this.objects = this.generateRoadObjects(); // Generate new objects for the segment
        }
    }
}

export default Segment;

