// Get the canvas and its context
const canvas = document.getElementById('simulatorCanvas');
const ctx = canvas.getContext('2d');

// Road object definition with scrolling
const road = {
    x: canvas.width / 2,  // Center of the canvas
    width: 300,  // Width of the road
    laneCount: 3,  // Number of lanes
    scrollSpeed: 5,  // Speed at which the road scrolls
    offsetY: 0,  // Offset for vertical scrolling
    laneHeight: 40,  // Height of each lane marking section

    // Method to calculate lane width
    getLaneWidth() {
        return this.width / this.laneCount;
    },

    // Method to draw the road and lanes with scrolling
    draw() {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - this.width / 2, 0, this.width, canvas.height);

        // Draw lane markings with scrolling effect
        ctx.setLineDash([20, 20]); // Dashed line
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';

        for (let i = 1; i < this.laneCount; i++) {
            const x = this.x - this.width / 2 + i * this.getLaneWidth();
            ctx.beginPath();
            ctx.moveTo(x, -this.offsetY % this.laneHeight);
            for (let y = -this.offsetY % this.laneHeight; y < canvas.height; y += this.laneHeight) {
                ctx.lineTo(x, y + 10);
                ctx.moveTo(x, y + 30);
            }
            ctx.stroke();
        }

        // Calculate road boundaries
        this.leftBoundary = this.x - this.width / 2;
        this.rightBoundary = this.x + this.width / 2;

        // Draw boundaries
        ctx.setLineDash([]); // Solid line
        ctx.beginPath();
        ctx.moveTo(this.leftBoundary, 0);
        ctx.lineTo(this.leftBoundary, canvas.height);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'yellow';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.rightBoundary, 0);
        ctx.lineTo(this.rightBoundary, canvas.height);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    },

    // Update the road scrolling
    update(carSpeed) {
        this.scrollSpeed = carSpeed;
        this.offsetY += this.scrollSpeed;
    },

    // Method to keep the car within the boundaries
    checkBoundaries(car) {
        if (car.x - car.width / 2 < this.leftBoundary) {
            car.x = this.leftBoundary + car.width / 2;
        } else if (car.x + car.width / 2 > this.rightBoundary) {
            car.x = this.rightBoundary - car.width / 2;
        }
    }
};

// Car object definition
const car = {
    x: road.x,  // Start in the center of the road
    y: canvas.height - 100, // Fixed position near the bottom of the canvas
    width: 50,  // Car width
    height: 80, // Car height
    speed: 0,   // Initial speed
    acceleration: 0.2,  // How fast the car accelerates
    maxSpeed: 10,  // Maximum forward speed
    maxReverseSpeed: -3,  // Maximum reverse speed
    friction: 0.05,  // How much the car slows down
    angle: 0,   // Initial angle (facing upwards)
    turnSpeed: 0.03, // How fast the car turns at low speeds
    handlingFactor: 0.02, // Reduced turning at higher speeds
    steeringAngle: 0, // Angle of the steering wheel

    // Method to draw the car on the canvas
    draw() {
        ctx.save(); // Save the current state of the context
        ctx.translate(this.x, this.y); // Move the context to the car's position
        ctx.rotate(-this.angle); // Rotate the context to match the car's angle

        // Draw the car body
        ctx.fillStyle = 'red'; // Car color
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height); // Draw the car

        // Draw the wheels
        this.drawWheels();

        ctx.restore(); // Restore the context to its original state
    },

    // Method to draw wheels
    drawWheels() {
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
    },

    // Method to update the car's speed
    update() {
        // Apply friction to gradually slow down the car
        if (this.speed > 0) {
            this.speed -= this.friction;
            if (this.speed < 0) this.speed = 0; // Prevents flipping from forward to reverse due to friction
        } else if (this.speed < 0) {
            this.speed += this.friction;
            if (this.speed > 0) this.speed = 0; // Prevents flipping from reverse to forward due to friction
        }

        // Prevent the car from exceeding its maximum speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        } else if (this.speed < this.maxReverseSpeed) {
            this.speed = this.maxReverseSpeed;
        }

        // Update road based on the car's speed
        road.update(this.speed);

        // Check and enforce road boundaries
        road.checkBoundaries(this);
    },

    // Method to handle turning based on speed
    turn() {
        let effectiveTurnSpeed = this.turnSpeed;
        
        // Reduce turning ability at higher speeds to simulate realistic handling
        if (Math.abs(this.speed) > 2) {
            effectiveTurnSpeed -= this.handlingFactor * Math.abs(this.speed);
        }

        if (keys.ArrowLeft) {
            this.angle -= effectiveTurnSpeed;
            this.steeringAngle = Math.max(this.steeringAngle - 2, -30); // Rotate steering wheel left
        } else if (keys.ArrowRight) {
            this.angle += effectiveTurnSpeed;
            this.steeringAngle = Math.min(this.steeringAngle + 2, 30); // Rotate steering wheel right
        } else {
            // Gradually return the steering wheel to the center
            if (this.steeringAngle > 0) {
                this.steeringAngle -= 2;
            } else if (this.steeringAngle < 0) {
                this.steeringAngle += 2;
            }
        }
    }
};

// Event listeners for key presses
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

// Function to update the car's movement based on key presses
function handleInput() {
    if (keys.ArrowUp) {
        car.speed += car.acceleration; // Increase speed
    }
    if (keys.ArrowDown) {
        car.speed -= car.acceleration; // Decrease speed
    }
    car.turn(); // Handle turning separately to adjust based on speed
}

// Main loop function
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the road and lanes
    road.draw();

    // Handle user input for car movement
    handleInput();

    // Update the car's speed
    car.update();

    // Draw the car (remains stationary)
    car.draw();

    // Repeat the loop
    requestAnimationFrame(mainLoop);
}

// Start the main loop
mainLoop();
