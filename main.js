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
    friction: 0.05, // How much the car slows down
    angle: 0, // Initial angle (facing upwards)
    turnSpeed: 0.03, // How fast the car turns

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
        // Move the car forward based on its speed and angle
        this.y -= this.speed * Math.cos(this.angle);
        this.x += this.speed * Math.sin(this.angle);

        // Apply friction to gradually slow down the car
        if (this.speed > 0) {
            this.speed -= this.friction;
        } else if (this.speed < 0) {
            this.speed += this.friction;
        }

        // Prevent the car from exceeding its maximum speed
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        } else if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed;
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
        car.speed += car.acceleration;
    }

    if (keys.ArrowDown) {
        car.speed -= car.acceleration;
    }

    if (keys.ArrowLeft) {
        car.angle -= car.turnSpeed;
    }

    if (keys.ArrowRight) {
        car.angle += car.turnSpeed;
    }
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