import CanvasContext from './canvas_context.js';
import Road from './road.js';
import Car from './car.js';
import Logger from './logger.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        const ctx = CanvasContext.getInstance();
        const road = new Road(ctx.canvas.width / 2, 300, 3, 100);
        const car = new Car(road);

        const keys = {
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

            if (event.key === 'ArrowLeft') {
                car.changeLane('left');
            } else if (event.key === 'ArrowRight') {
                car.changeLane('right');
            }
        });

        function handleInput() {
            if (keys.ArrowUp) {
                car.speed += car.acceleration;
            }
            if (keys.ArrowDown) {
                car.speed -= car.acceleration;
            }
        }

        function mainLoop() {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            road.draw();
            handleInput();
            car.update(road);
            car.draw();

            requestAnimationFrame(mainLoop);
        }

        mainLoop();
    } catch (error) {
        Logger.error(`Initialization failed: ${error.message}`);
    }
});