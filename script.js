const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

const gameContainer = document.getElementById('gameContainer');
const gameOverModal = document.getElementById('gameOverModal');
const retryButton = document.getElementById('retryButton');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const startText = document.getElementById('startText');
const finalScore = document.getElementById('finalScore');
const levelText = document.getElementById('levelText'); 

canvas.width = 640;
canvas.height = 360;

const birdImg = new Image();
birdImg.src = '1/bird.png'; 
const pipeImg = new Image();
pipeImg.src = '1/pipe2.png'; 
const backgroundImg = new Image();
backgroundImg.src = '1/background.jpg'; 

const levels = [
    { pipeSpeed: 2, pipeGap: 150, gravity: 0.5, scoreThreshold: 7 },
    { pipeSpeed: 2.5, pipeGap: 110, gravity: 0.7, scoreThreshold: 20 },
    { pipeSpeed: 3, pipeGap: 100, gravity: 0.8, scoreThreshold: 30 },
    { pipeSpeed: 3.5, pipeGap: 90, gravity: 0.9, scoreThreshold: 40 },
    { pipeSpeed: 4, pipeGap: 80, gravity: 1.0, scoreThreshold: 50 }
];

let currentLevel = 0;
let gameStarted = false;

const bird = {
    x: 130,
    y: 150,
    width: 34,
    height: 24,
    lift: -6,
    velocity: 0
};

const pipes = [];
const pipeWidth = 52;
let frameCount = 0;
let score = 0;

function drawBird() {
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        context.drawImage(pipeImg, pipe.x, 0, pipeWidth, pipe.top);
        context.drawImage(pipeImg, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    });
}

function updateBird() {
    bird.velocity += levels[currentLevel].gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        endGame();
    }
}

function updatePipes() {
    if (frameCount % 90 === 0) {
        const topHeight = Math.random() * (canvas.height - levels[currentLevel].pipeGap - 20) + 20;
        const bottomHeight = canvas.height - topHeight - levels[currentLevel].pipeGap;
        pipes.push({ x: canvas.width, top: topHeight, bottom: bottomHeight });
    }

    pipes.forEach(pipe => {
        pipe.x -= levels[currentLevel].pipeSpeed;
        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
            score++;
            scoreElement.innerText = `Score: ${score}`;
            checkLevelChange();
        }

        if (bird.x < pipe.x + pipeWidth && bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)) {
            endGame();
        }
    });
}

function endGame() {
    gameStarted = false;
    showGameOverModal();
    cancelAnimationFrame(animationFrameId);
    finalScore.innerText = `Final Score: ${score}`;
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    scoreElement.innerText = `Score: ${score}`;
    gameOverModal.style.display = 'none';
    startButton.style.display = 'block';
    startText.style.display = 'block';
    frameCount = 0;
    currentLevel = 0;
    drawInitialFrame();
}

function drawInitialFrame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height); 
    drawBird();
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    drawBird();
    drawPipes();
}

function update() {
    updateBird();
    updatePipes();
}

let animationFrameId;
function loop() {
    if (gameStarted) {
        draw();
        update();
        frameCount++;
        animationFrameId = requestAnimationFrame(loop);
    }
}

function showGameOverModal() {
    gameOverModal.style.display = 'block';
}

function checkLevelChange() {
    const currentLevelData = levels[currentLevel];
    if (score >= currentLevelData.scoreThreshold && currentLevel < levels.length - 1) {
        currentLevel++;
        levelText.innerText = `Level ${currentLevel + 1}`;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted) {
        bird.velocity = bird.lift;
    }
});

retryButton.addEventListener('click', () => {
    resetGame();
});

startButton.addEventListener('click', () => {
    gameStarted = true;
    startButton.style.display = 'none';
    startText.style.display = 'none';
    levelText.innerText = `Level ${currentLevel + 1}`;
    loop();
});

let imagesLoaded = 0;
const totalImages = 3;

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        startButton.style.display = 'block';
        startText.style.display = 'block';
        drawInitialFrame();
    }
}

birdImg.onload = onImageLoad;
pipeImg.onload = onImageLoad;
backgroundImg.onload = onImageLoad;
