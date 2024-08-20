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
    segments: [], // Array to store road segments
    segmentHeight: 100, // Height of each road segment

    // Method to calculate lane width
    getLaneWidth() {
        return this.width / this.laneCount;
    },

    // Initialize road segments
    initialize() {
        const segmentCount = Math.ceil(canvas.height / this.segmentHeight) + 1;
        for (let i = 0; i < segmentCount; i++) {
            this.segments.push(this.createSegment(-i * this.segmentHeight));
        }
    },

    // Method to create a road segment
    createSegment(offsetY) {
        const segment = {
            y: offsetY,
            objects: this.generateRoadObjects()
        };
        return segment;
    },

    // Method to generate roadside objects for a segment
    generateRoadObjects() {
        const objects = [];
        const objectCount = Math.random() > 0.5 ? 1 : 0; // Randomly decide if objects should appear

        for (let i = 0; i < objectCount; i++) {
            const isLeftSide = Math.random() > 0.5;
            const x = isLeftSide
                ? this.x - this.width / 2 - 30
                : this.x + this.width / 2 + 30;
            const y = Math.random() * this.segmentHeight;

            objects.push({
                x: x,
                y: y,
                type: isLeftSide ? 'tree' : 'barrier'
            });
        }

        return objects;
    },

    // Method to draw a segment
    drawSegment(segment) {
        ctx.fillStyle = 'gray';
        ctx.fillRect(this.x - this.width / 2, segment.y, this.width, this.segmentHeight);

        // Draw lane markings
        ctx.setLineDash([20, 20]);
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'white';

        for (let i = 1; i < this.laneCount; i++) {
            const x = this.x - this.width / 2 + i * this.getLaneWidth();
            ctx.beginPath();
            ctx.moveTo(x, segment.y);
            ctx.lineTo(x, segment.y + this.segmentHeight);
            ctx.stroke();
        }

        // Draw roadside objects
        for (let object of segment.objects) {
            this.drawObject(object, segment.y);
        }
    },

    // Method to draw a roadside object
    drawObject(object, offsetY) {
        ctx.fillStyle = object.type === 'tree' ? 'green' : 'gray';
        ctx.fillRect(object.x, object.y + offsetY, 20, 40);
    },

    // Method to draw the road with segments
    draw() {
        for (let segment of this.segments) {
            this.drawSegment(segment);
        }

        // Draw road boundaries
        ctx.setLineDash([]);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'yellow';

        ctx.beginPath();
        ctx.moveTo(this.x - this.width / 2, 0);
        ctx.lineTo(this.x - this.width / 2, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, 0);
        ctx.lineTo(this.x + this.width / 2, canvas.height);
        ctx.stroke();
    },

    // Update the road scrolling and segment positions
    update(carSpeed) {
        this.scrollSpeed = carSpeed;
        this.offsetY += this.scrollSpeed;

        for (let segment of this.segments) {
            segment.y += this.scrollSpeed;

            // Recycle segment when it moves off-screen
            if (segment.y > canvas.height) {
                segment.y = -this.segmentHeight;
                segment.objects = this.generateRoadObjects();
            }
        }
    },

    // Method to keep the car within the boundaries
    checkBoundaries(car) {
        if (car.x - car.width / 2 < this.x - this.width / 2) {
            car.x = this.x - this.width / 2 + car.width / 2;
        } else if (car.x + car.width / 2 > this.x + this.width / 2) {
            car.x = this.x + this.width / 2 - car.width / 2;
        }
    }
};

// Initialize the road's segments
road.initialize();

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
    turnSpeed: 5, // How fast the car changes lanes
    targetLane: 1, // Initial lane (center lane)
    lanePositions: [], // Array to store lane center positions

    // Initialize lane positions based on road configuration
    initialize() {
        const laneWidth = road.getLaneWidth();
        for (let i = 0; i < road.laneCount; i++) {
            this.lanePositions.push(road.x - road.width / 2 + laneWidth / 2 + i * laneWidth);
        }
        this.x = this.lanePositions[this.targetLane];
    },

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

        // Smooth transition to the target lane
        const targetX = this.lanePositions[this.targetLane];
        if (this.x < targetX) {
            this.x = Math.min(this.x + this.turnSpeed, targetX);
        } else if (this.x > targetX) {
            this.x = Math.max(this.x - this.turnSpeed, targetX);
        }

        // Update road based on the car's speed
        road.update(this.speed);

        // Check and enforce road boundaries
        road.checkBoundaries(this);
    },

    // Method to handle lane changing
    changeLane(direction) {
        if (direction === 'left' && this.targetLane > 0) {
            this.targetLane--;
        } else if (direction === 'right' && this.targetLane < road.laneCount - 1) {
            this.targetLane++;
        }
    }
};

// Initialize the car's lane positions
car.initialize();

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

    // Handle lane changes
    if (event.key === 'ArrowLeft') {
        car.changeLane('left');
    } else if (event.key === 'ArrowRight') {
        car.changeLane('right');
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
}

// Main loop function
function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw the road with dynamic segments
    road.draw();

    // Handle user input for car movement
    handleInput();

    // Update the car's speed and position
    car.update();

    // Draw the car (remains stationary)
    car.draw();

    // Repeat the loop
    requestAnimationFrame(mainLoop);
}

// Start the main loop
mainLoop();
