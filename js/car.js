import CanvasContext from './canvas_context.js';
import Logger from './logger.js';

class Car {
    constructor(road) {
        this.x = road.x;
        this.y = CanvasContext.getInstance().canvas.height - 100;
        this.width = 50;
        this.height = 80;
        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = 10;
        this.maxReverseSpeed = -3;
        this.friction = 0.05;
        this.angle = 0;
        this.turnSpeed = 5;
        this.targetLane = 1;
        this.lanePositions = this.initializeLanePositions(road);
    }

    initializeLanePositions(road) {
        const laneWidth = road.width / road.laneCount;
        const positions = [];
        for (let i = 0; i < road.laneCount; i++) {
            positions.push(road.x - road.width / 2 + laneWidth / 2 + i * laneWidth);
        }
        return positions;
    }

    draw() {
        const ctx = CanvasContext.getInstance();
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(-this.angle);

        // Draw the car body
        ctx.fillStyle = 'red';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Draw the wheels
        this.drawWheels(ctx);

        ctx.restore();
    }

    drawWheels(ctx) {
        const wheelWidth = 10;
        const frontWheelHeight = 20;
        const rearWheelHeight = 25;

        // Rear left wheel
        ctx.fillStyle = 'black';
        ctx.fillRect(-this.width / 2 - wheelWidth / 2, this.height / 4 - rearWheelHeight / 2, wheelWidth, rearWheelHeight);

        // Rear right wheel
        ctx.fillRect(this.width / 2 - wheelWidth / 2, this.height / 4 - rearWheelHeight / 2, wheelWidth, rearWheelHeight);

        // Front left wheel
        ctx.fillRect(-this.width / 2 - wheelWidth / 2, -this.height / 4 - frontWheelHeight / 2, wheelWidth, frontWheelHeight);

        // Front right wheel
        ctx.fillRect(this.width / 2 - wheelWidth / 2, -this.height / 4 - frontWheelHeight / 2, wheelWidth, frontWheelHeight);
    }

    update(road) {
        try {
            this.applyFriction();
            this.limitSpeed();
            this.smoothTransitionToTargetLane();
            road.update(this.speed);
            road.checkBoundaries(this);
        } catch (error) {
            Logger.error(`Failed to update car: ${error.message}`);
        }
    }

    applyFriction() {
        if (this.speed > 0) {
            this.speed -= this.friction;
            if (this.speed < 0) this.speed = 0;
        } else if (this.speed < 0) {
            this.speed += this.friction;
            if (this.speed > 0) this.speed = 0;
        }
    }

    limitSpeed() {
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        } else if (this.speed < this.maxReverseSpeed) {
            this.speed = this.maxReverseSpeed;
        }
    }

    smoothTransitionToTargetLane() {
        const targetX = this.lanePositions[this.targetLane];
        if (this.x < targetX) {
            this.x = Math.min(this.x + this.turnSpeed, targetX);
        } else if (this.x > targetX) {
            this.x = Math.max(this.x - this.turnSpeed, targetX);
        }
    }

    changeLane(direction) {
        if (direction === 'left' && this.targetLane > 0) {
            this.targetLane--;
        } else if (direction === 'right' && this.targetLane < this.lanePositions.length - 1) {
            this.targetLane++;
        }
    }
}

export default Car;