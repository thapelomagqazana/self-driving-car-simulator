// Get the canvas and its context
const canvas = document.getElementById("simulatorCanvas");
const ctx = canvas.getContext("2d");

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
        }

        if (keys.ArrowRight) {
            this.angle += effectiveTurnSpeed;
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

// Main loop function
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    handleInput(); // Handle user input
    car.update(); // Update the car's position and speed
    car.draw();   // Draw the car
    requestAnimationFrame(mainLoop); // Repeat the loop
};

mainLoop();