import CanvasContext from './canvas_context.js';
import Logger from './logger.js';
import Sensor from './sensor.js';

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

        // Attach sensors
        this.sensors = [
            new Sensor(this, 0, 150), // Front center
            new Sensor(this, Math.PI / 4, 150), // Front right
            new Sensor(this, -Math.PI / 4, 150), // Front left
            new Sensor(this, Math.PI / 2, 100), // Right side
            new Sensor(this, -Math.PI / 2, 100) // Left side
        ];
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

        // Draw sensors
        this.sensors.forEach(sensor => sensor.drawRay(ctx, { x: this.x, y: this.y }));
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

    interpretSensorData() {
        // console.log(this.speed);
        let obstacleAhead = false;
        let obstacleOnLeft = false;
        let obstacleOnRight = false;

        // Threshold distance to consider something as an obstacle
        const thresholdDistance = 50;

        // Interpret data from each sensor
        this.sensors.forEach((sensor, index) => {
            if (sensor.reading !== null && sensor.reading < thresholdDistance) {
                switch (index) {
                    case 0: // Front center sensor
                        obstacleAhead = true;
                        break;
                    case 1: // Front right sensor
                        obstacleAhead = true;
                        obstacleOnRight = true;
                        break;
                    case 2: // Front left sensor
                        obstacleAhead = true;
                        obstacleOnLeft = true;
                        break;
                    case 3: // Right side sensor
                        obstacleOnRight = true;
                        break;
                    case 4: // Left side sensor
                        obstacleOnLeft = true;
                        break;
                    default:
                        break;
                }
            }
        });

        // Make decisions based on the interpreted sensor data
        if (obstacleAhead) {
            this.speed -= this.acceleration; // Slow down
            if (this.speed < 0) this.speed = 0; // Stop if the speed goes below 0

            if (obstacleOnLeft && !obstacleOnRight) {
                this.changeLane('right'); // Change lane to the right if the left is blocked
            } else if (obstacleOnRight && !obstacleOnLeft) {
                this.changeLane('left'); // Change lane to the left if the right is blocked
            } else if (!obstacleOnLeft && !obstacleOnRight) {
                this.changeLane(Math.random() > 0.5 ? 'left' : 'right'); // Random lane change if both sides are clear
            }
        } else {
            this.speed += this.acceleration; // Speed up if no obstacle ahead
            if (this.speed > this.maxSpeed) this.speed = this.maxSpeed; // Cap the speed to maxSpeed
        }
    }

    update(road) {
        try {
            this.applyFriction();
            this.limitSpeed();
            this.smoothTransitionToTargetLane();

            // Simulate road movement relative to car speed
            road.update(this.speed, this.maxSpeed);

            // Ensure car stays within road boundaries (if the car is moving sideways)
            road.checkBoundaries(this);

            // Update sensor readings
            this.sensors.forEach(sensor => sensor.update(road.segments));

            // Interpret sensor data
            // this.interpretSensorData();

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