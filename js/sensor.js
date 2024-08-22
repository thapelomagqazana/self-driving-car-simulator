import CanvasContext from './canvas_context.js';
import Logger from './logger.js';

class Sensor {
    constructor(car, angle, range) {
        this.car = car;
        this.angle = angle; // Angle relative to the car's direction
        this.range = range; // Maximum detection range
        this.reading = null; // Stores the distance to the nearest obstacle
    }

    // Method to update the sensor reading
    update(roadSegments) {
        const ctx = CanvasContext.getInstance();
        const { x: carX, y: carY } = this.car;
        const sensorAngle = this.car.angle + this.angle;

        let closestDistance = this.range;
        let closestPoint = null;

        // Calculate the end point of the sensor ray
        const endX = carX + Math.sin(sensorAngle) * this.range;
        const endY = carY - Math.cos(sensorAngle) * this.range;

        // Check for intersection with obstacles
        roadSegments.forEach(segment => {
            segment.objects.forEach(object => {
                const intersect = this.checkIntersection(
                    { x: carX, y: carY },
                    { x: endX, y: endY },
                    object
                );
                if (intersect) {
                    const distance = this.getDistance(carX, carY, intersect.x, intersect.y);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestPoint = intersect;
                    }
                }
            });
        });

        this.reading = closestPoint ? closestDistance : null;
        this.drawRay(ctx, closestPoint || { x: endX, y: endY });
    }

    // Method to check if the sensor ray intersects with an object
    checkIntersection(start, end, object) {
        const rect = {
            x: object.x,
            y: object.y,
            width: object.width,
            height: object.height
        };

        // Get the points of the object rectangle
        const rectPoints = [
            { x: rect.x, y: rect.y },
            { x: rect.x + rect.width, y: rect.y },
            { x: rect.x + rect.width, y: rect.y + rect.height },
            { x: rect.x, y: rect.y + rect.height }
        ];
        // console.log(rectPoints);
        // console.log(start);
        // console.log(end);

        // Check each edge of the rectangle
        for (let i = 0; i < 4; i++) {
            const next = (i + 1) % 4;
            const intersect = this.lineIntersect(
                start,
                end,
                rectPoints[i],
                rectPoints[next]
            );
            // console.log(intersect);
            if (intersect) {
                return intersect;
            }
        }

        return null;
    }

    // Method to detect line intersection
    lineIntersect(p1, p2, p3, p4) {
        const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
        if (denominator === 0) {
            return null;
        }

        const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
        const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return {
                x: p1.x + ua * (p2.x - p1.x),
                y: p1.y + ua * (p2.y - p1.y)
            };
        }

        return null;
    }

    // Method to calculate the distance between two points
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    // Method to draw the sensor ray on the canvas
    drawRay(ctx, endPoint) {
        ctx.beginPath();
        ctx.moveTo(this.car.x, this.car.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.reading !== null ? 'red' : 'green';
        ctx.stroke();
    }
}

export default Sensor;