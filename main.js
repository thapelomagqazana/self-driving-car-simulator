// Get the canvas and its context
const canvas = document.getElementById("simulatorCanvas");
const ctx = canvas.getContext("2d");

// Array to store skid marks
const skidMarks = [];

// Road object definition
const road = {
    x: canvas.width / 2, // Center of the canvas
    width: 300, // Width of the road
    laneCount: 3, // Number of lanes
    leftBoundary: null, // Left boundary of the road
    rightBoundary: null, // Right boundary of the road

    // Method to calculate lane width
    getLaneWidth() {
        return this.width / this.laneCount;
    },

    // Method to draw the road and lanes
    draw() {
        // Draw the road background
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - this.width / 2, 0, this.width, canvas.height);

        // Draw lane markings
        for (let i = 1; i < this.laneCount; i++) {
            const x = this.x - this.width / 2 + i * this.getLaneWidth();
            ctx.setLineDash([20, 20]); // Dashed line
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'white';
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
    x: canvas.width / 2, // Starting position (middle of the canvas)
    y: canvas.height - 100, // A bit above the bottom of the canvas
    width: 50, // Car width
    height: 80, // Car height
    speed: 0, // Initial speed
    acceleration: 0.2, // How fast the car accelerates
    maxSpeed: 5, // Maximum speed
    maxReverseSpeed: -3, // Maximum reverse speed
    friction: 0.05, // How much the car slows down
    angle: 0, // Initial angle (facing upwards)
    turnSpeed: 0.05, // How fast the car turns at low speeds
    handlingFactor: 0.02, // Reduced turning at higher speeds
    skidThreshold: 3, // Minimum speed for skidding to occur
    skidIntensity: 2, // Intensity of skid marks (higher is more intense)
    steeringAngle: 0, // Angle of the steering wheel

    // Method to draw the car on the canvas
    draw() {
        ctx.save(); // Save the current state of the context
        ctx.translate(this.x, this.y); // Move the context to the car's position
        ctx.rotate(-this.angle); // Rotate the context to match the car's angle
        ctx.fillStyle = "red"; // Car color
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
    

    // Method to update the car's position and speed
    update() {
        // Calculate the change in position based on the car's angle and speed
        this.x += this.speed * Math.sin(this.angle);
        this.y -= this.speed * Math.cos(this.angle);


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

        // Check and enforce road boundaries
        road.checkBoundaries(this);

        // // Add skid marks if the car is turning sharply and moving fast enough
        // if (Math.abs(this.speed) > this.skidThreshold && keys.ArrowLeft || keys.ArrowRight) {
        //     skidMarks.push({
        //         x: this.x,
        //         y: this.y,
        //         angle: this.angle,
        //         intensity: Math.min(Math.abs(this.speed), this.skidIntensity)
        //     });
        // }
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
            this.steeringAngle = Math.max(this.steeringAngle - 2, -30); // Rotating steering wheel left
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

document.addEventListener("keydown", (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

// Function to update the car's movement based on key presses
function handleInput() {
    if (keys.ArrowUp) {
        car.speed += car.acceleration; // Move forward
    }

    if (keys.ArrowDown) {
        car.speed -= car.acceleration; // Move backward
    }

    car.turn(); // Handle turning separately to adjust based on speed
}

// Function to draw skid marks
function drawSkidMarks() {
    ctx.save();
    ctx.globalAlpha = 0.5; // Make the skid marks slightly transparent
    ctx.fillStyle = 'black';
    skidMarks.forEach((mark) => {
        ctx.translate(mark.x, mark.y);
        ctx.rotate(-mark.angle);
        ctx.fillRect(-car.width / 2, -car.height / 4, mark.intensity, 5);
        ctx.resetTransform();
    });
    ctx.restore();
}

// Function to draw the steering wheel
function drawSteeringWheel() {
    const wheelRadius = 40;
    const centerX = 100;
    const centerY = canvas.height - 100;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(car.steeringAngle * Math.PI / 180); // Rotate based on steering angle
    ctx.beginPath();
    ctx.arc(0, 0, wheelRadius, 0, 2 * Math.PI); // Draw the outer circle
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.moveTo(-wheelRadius, 0);
    ctx.lineTo(wheelRadius, 0);
    ctx.stroke();

    ctx.moveTo(0, -wheelRadius);
    ctx.lineTo(0, wheelRadius);
    ctx.stroke();

    ctx.restore();
}

// Main loop function
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    road.draw(); // Draw the road and lanes
    // drawSkidMarks(); // Draw skid marks
    handleInput(); // Handle user input
    car.update(); // Update the car's position and speed
    car.draw();   // Draw the car
    drawSteeringWheel(); // Draw the steering wheel
    requestAnimationFrame(mainLoop); // Repeat the loop
};

mainLoop();