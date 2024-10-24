const canvas = document.getElementById('gameCanvas');
canvas.width = 1200; // Increase the width of the canvas
canvas.height = 600; // Adjust the height as needed
const ctx = canvas.getContext('2d');

class Car {
    constructor(x, y, imageUrl) {
        this.startingX = x;
        this.startingY = y;
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.angle = Math.PI; // Facing left
        this.width = 50;
        this.height = 30;
        this.image = new Image();
        this.image.onload = () => this.draw();
        this.image.src = imageUrl;
        this.accelerationRate = 0.1;
        this.turnRate = 0.05;
        this.roadFriction = 0.98;
        this.offRoadFriction = 0.95;
        this.roadRadius = 200; // Increased radius for wider circles
        this.roadWidth = 100; // Increased width for overlapping effect
        this.timer = 0;
        this.startTime = null;
        this.runningTimer = false;
        this.passedCheckpoint = false;
        this.bestTime = Infinity; // Initialize the best time to infinity
        // Angles for start and checkpoint lines
        this.startAngle = Math.PI; // Start/Finish on the left side of the left circle
        this.checkpointAngle = 0; // Checkpoint on the right side of the right circle
        this.leftTrail = []; // Array to store the left trail positions
        this.rightTrail = []; // Array to store the right trail positions
        this.trailMaxLength = 100; // Maximum length of the trail
        this.trailFadeRate = 0.01; // Rate at which the trail fades out
    }

    update() {
        const onRoad = this.isOnRoad();
        const friction = onRoad ? this.roadFriction : this.offRoadFriction;
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
        this.checkLines();

        // Adjust the offset to make the trail spots closer together
        const offset = this.height / 4; 

        // Calculate the positions of the left and right rear ends of the car
        const leftRearX = this.x + this.width / 2 - (this.width / 2) * Math.cos(this.angle) - offset * Math.sin(this.angle);
        const leftRearY = this.y + this.height / 2 - (this.width / 2) * Math.sin(this.angle) + offset * Math.cos(this.angle);
        const rightRearX = this.x + this.width / 2 - (this.width / 2) * Math.cos(this.angle) + offset * Math.sin(this.angle);
        const rightRearY = this.y + this.height / 2 - (this.width / 2) * Math.sin(this.angle) - offset * Math.cos(this.angle);

        // Add current positions to the trails with full opacity
        this.leftTrail.push({ x: leftRearX, y: leftRearY, opacity: 1 });
        this.rightTrail.push({ x: rightRearX, y: rightRearY, opacity: 1 });

        // Fade out and remove trail particles
        this.leftTrail = this.leftTrail.map(p => ({ ...p, opacity: p.opacity - this.trailFadeRate })).filter(p => p.opacity > 0);
        this.rightTrail = this.rightTrail.map(p => ({ ...p, opacity: p.opacity - this.trailFadeRate })).filter(p => p.opacity > 0);

        if (this.runningTimer && this.startTime) {
            this.timer = ((Date.now() - this.startTime) / 1000).toFixed(2);
        }
    }

    resetToStart() {
        this.x = this.startingX;
        this.y = this.startingY;
        this.velocity = { x: 0, y: 0 };
        this.angle = Math.PI; // Facing left
        this.timer = 0;
        this.runningTimer = false;
        this.passedCheckpoint = false;
        this.leftTrail = []; // Clear the left trail
        this.rightTrail = []; // Clear the right trail
    }

    checkLines() {
        const angle = Math.atan2(this.y + this.height / 2 - canvas.height / 2, this.x + this.width / 2 - canvas.width / 2);
        if (Math.abs(angle - this.startAngle) < 0.05) { // Finish line (Start and Stop)
            if (!this.runningTimer) {
                this.startTime = Date.now();
                this.runningTimer = true;
                this.passedCheckpoint = false;
            } else if (this.runningTimer && this.passedCheckpoint) {
                if (parseFloat(this.timer) < this.bestTime) {
                    this.bestTime = parseFloat(this.timer);
                }
                this.runningTimer = false;
            }
        } else if (Math.abs(angle - this.checkpointAngle) < 0.05) { // Checkpoint
            this.passedCheckpoint = true;
        }
    }

    isOnRoad() {
        const roadCenterX1 = canvas.width / 2 - this.roadRadius - this.roadWidth / 4;
        const roadCenterY = canvas.height / 2;
        const roadCenterX2 = canvas.width / 2 + this.roadRadius + this.roadWidth / 4;
        const distanceFromCenter1 = Math.sqrt((this.x + this.width / 2 - roadCenterX1) ** 2 + (this.y + this.height / 2 - roadCenterY) ** 2);
        const distanceFromCenter2 = Math.sqrt((this.x + this.width / 2 - roadCenterX2) ** 2 + (this.y + this.height / 2 - roadCenterY) ** 2);
        return (distanceFromCenter1 < this.roadRadius + this.roadWidth / 2 && distanceFromCenter1 > this.roadRadius - this.roadWidth / 2) ||
               (distanceFromCenter2 < this.roadRadius + this.roadWidth / 2 && distanceFromCenter2 > this.roadRadius - this.roadWidth / 2);
    }

    draw() {
        // Clear the canvas with the lighter dark grey color
        ctx.fillStyle = '#333333'; // Lighter dark grey
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.drawRoad();
        this.drawTrail(); // Draw the trail
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
        this.displaySpeed();
        this.displayTimer();
        this.displayBestTime();
    }

    drawRoad() {
        const roadCenterX1 = canvas.width / 2 - this.roadRadius - this.roadWidth / 4;
        const roadCenterY = canvas.height / 2;
        const roadCenterX2 = canvas.width / 2 + this.roadRadius + this.roadWidth / 4;

        // Draw the left circle of the figure-eight
        ctx.beginPath();
        ctx.arc(roadCenterX1, roadCenterY, this.roadRadius + this.roadWidth / 2, 0, 2 * Math.PI, false);
        ctx.arc(roadCenterX1, roadCenterY, this.roadRadius - this.roadWidth / 2, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();

        // Draw the right circle of the figure-eight
        ctx.beginPath();
        ctx.arc(roadCenterX2, roadCenterY, this.roadRadius + this.roadWidth / 2, 0, 2 * Math.PI, false);
        ctx.arc(roadCenterX2, roadCenterY, this.roadRadius - this.roadWidth / 2, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fillStyle = 'black';
        ctx.fill();

        // Draw start line
        this.drawLine(roadCenterX1, roadCenterY, this.startAngle, 'red');
        // Draw checkpoint line
        this.drawLine(roadCenterX2, roadCenterY, this.checkpointAngle, 'blue');
    }

    drawLine(centerX, centerY, angle, color) {
        const innerX = centerX + (this.roadRadius - this.roadWidth / 2) * Math.cos(angle);
        const innerY = centerY + (this.roadRadius - this.roadWidth / 2) * Math.sin(angle);
        const outerX = centerX + (this.roadRadius + this.roadWidth / 2) * Math.cos(angle);
        const outerY = centerY + (this.roadRadius + this.roadWidth / 2) * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    drawTrail() {
        // Draw left trail
        this.leftTrail.forEach(p => {
            ctx.fillStyle = `rgba(148, 0, 211, ${p.opacity})`; // Neon purple color with varying opacity
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw right trail
        this.rightTrail.forEach(p => {
            ctx.fillStyle = `rgba(148, 0, 211, ${p.opacity})`; // Neon purple color with varying opacity
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    displaySpeed() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "right";
        ctx.strokeText(`Speed: ${this.getSpeed()} units/s`, canvas.width - 10, 20);
        ctx.fillText(`Speed: ${this.getSpeed()} units/s`, canvas.width - 10, 20);
    }

    displayTimer() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "right";
        ctx.strokeText(`Time: ${this.timer} s`, canvas.width - 10, canvas.height - 10);
        ctx.fillText(`Time: ${this.timer} s`, canvas.width - 10, canvas.height - 10);
    }

    displayBestTime() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "right";
        ctx.strokeText(`Best Time: ${this.bestTime === Infinity ? 'N/A' : this.bestTime + ' s'}`, canvas.width - 10, canvas.height - 30);
        ctx.fillText(`Best Time: ${this.bestTime === Infinity ? 'N/A' : this.bestTime + ' s'}`, canvas.width - 10, canvas.height - 30);
    }

    accelerate() {
        this.velocity.x += Math.cos(this.angle) * this.accelerationRate;
        this.velocity.y += Math.sin(this.angle) * this.accelerationRate;
    }

    turnLeft() {
        this.angle -= this.turnRate;
    }

    turnRight() {
        this.angle += this.turnRate;
    }

    getSpeed() {
        return Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2).toFixed(2);
    }
}

// Adjust the spawn location to the top of the left ring
const roadCenterX1 = canvas.width / 2 - 200 - 100 / 4;
const roadCenterY = canvas.height / 2;
const car = new Car(roadCenterX1, roadCenterY - 200 - 50 / 2, 'https://openclipart.org/image/800px/190179');

let keys = {};

function updateGameArea() {
    if (keys['ArrowUp']) car.accelerate();
    if (keys['ArrowLeft']) car.turnLeft();
    if (keys['ArrowRight']) car.turnRight();
    if (keys['r']) car.resetToStart();

    car.update();
    car.draw();
    requestAnimationFrame(updateGameArea);
}

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

requestAnimationFrame(updateGameArea);
