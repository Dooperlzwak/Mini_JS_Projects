const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restartButton");

// Game variables
let speed = 7;

let tileCount = 20;
let tileSize = canvas.width / tileCount - 2;

let headX = 10;
let headY = 10;
const snakeParts = [];
let tailLength = 2;

let appleX = 5;
let appleY = 5;

let xVelocity = 0;
let yVelocity = 0;

let score = 0;

let gameOver = false;

// Game loop
function drawGame() {
    if (gameOver) {
        return;
    }

    changeSnakePosition();
    let result = isGameOver();
    if (result) {
        return;
    }

    clearScreen();

    checkAppleCollision();
    drawApple();
    drawSnake();

    drawScore();

    setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
    // Prevent game over before the game starts
    if (yVelocity === 0 && xVelocity === 0) {
        return false;
    }

    // Walls collision
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }

    // Self collision
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === headX && part.y === headY) {
            gameOver = true;
            break;
        }
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "50px Verdana";
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        // Show the restart button
        restartButton.style.display = "block";
    }

    return gameOver;
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "10px Verdana";
    ctx.textAlign = "right";
    ctx.fillText("Score " + score, canvas.width - 10, 20);
}

function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = "green";
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        ctx.fillRect(part.x * tileCount, part.y * tileCount, tileSize, tileSize);
    }

    // Add the head to the snake parts array
    snakeParts.push({ x: headX, y: headY });
    while (snakeParts.length > tailLength) {
        // Remove the oldest part of the snake if it's longer than the tail length
        snakeParts.shift();
    }

    ctx.fillStyle = "orange";
    ctx.fillRect(headX * tileCount, headY * tileCount, tileSize, tileSize);
}

function changeSnakePosition() {
    headX += xVelocity;
    headY += yVelocity;
}

function drawApple() {
    ctx.fillStyle = "red";
    ctx.fillRect(appleX * tileCount, appleY * tileCount, tileSize, tileSize);
}

function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        // Move the apple to a new random location
        appleX = Math.floor(Math.random() * tileCount);
        appleY = Math.floor(Math.random() * tileCount);
        tailLength++; // Increase the snake length
        score++;      // Increase the score
    }
}

document.body.addEventListener("keydown", keyDown);

function keyDown(event) {
    // Up
    if (event.keyCode == 38 || event.keyCode == 87) {
        if (yVelocity == 1) return; // Prevent moving in the opposite direction
        yVelocity = -1;
        xVelocity = 0;
    }

    // Down
    if (event.keyCode == 40 || event.keyCode == 83) {
        if (yVelocity == -1) return;
        yVelocity = 1;
        xVelocity = 0;
    }

    // Left
    if (event.keyCode == 37 || event.keyCode == 65) {
        if (xVelocity == 1) return;
        yVelocity = 0;
        xVelocity = -1;
    }

    // Right
    if (event.keyCode == 39 || event.keyCode == 68) {
        if (xVelocity == -1) return;
        yVelocity = 0;
        xVelocity = 1;
    }
}

restartButton.addEventListener("click", restartGame);

function restartGame() {
    // Reset game variables
    headX = 10;
    headY = 10;
    xVelocity = 0;
    yVelocity = 0;
    snakeParts.length = 0;
    tailLength = 2;
    score = 0;
    appleX = Math.floor(Math.random() * tileCount);
    appleY = Math.floor(Math.random() * tileCount);
    gameOver = false;
    restartButton.style.display = "none";
    drawGame();
}

// Start the game
drawGame();
