import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
import { GameState, NUMBER_STARS } from "./utils/constants.js";

const soundEffects = new SoundEffects();

const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");
const buttonMainMenu = document.querySelector(".button-main-menu");
const shipButtons = document.querySelectorAll('.ship-btn');

gameOverScreen.remove();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

ctx.imageSmoothingEnabled = false;

let currentState = GameState.START;

const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

const showGameData = () => {
    scoreElement.textContent = gameData.score;
    levelElement.textContent = gameData.level;
    highElement.textContent = gameData.high;
};

// ====== SELEÇÃO DE NAVE ======
let selectedShipIndex = 0;
shipButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        shipButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedShipIndex = parseInt(btn.getAttribute('data-ship'), 10);
    });
});
shipButtons[0].classList.add('selected');

// ====== PLAYER ======
let player = new Player(canvas.width, canvas.height, selectedShipIndex);

const stars = [];
const playerProjectiles = [];
const invadersProjectiles = [];
const particles = [];
const obstacles = [];

const initObstacles = () => {
    const x = canvas.width / 2 - 50;
    const y = canvas.height - 250;
    const offset = canvas.width * 0.15;
    const color = "crimson";
    const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color);
    const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color);
    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
};

initObstacles();

const grid = new Grid(
    Math.round(Math.random() * 9 + 1),
    Math.round(Math.random() * 9 + 1)
);

const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true,
    },
};

const incrementScore = (value) => {
    gameData.score += value;
    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }
};

const incrementLevel = () => {
    gameData.level += 1;
};

const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height));
    }
};

const drawStars = () => {
    stars.forEach((star) => {
        star.draw(ctx);
        star.update();
    });
};

const drawProjectiles = () => {
    const projectiles = [...playerProjectiles, ...invadersProjectiles];
    projectiles.forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};

const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx);
        particle.update();
    });
};

const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

const clearProjectiles = () => {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        if (playerProjectiles[i].position.y <= 0) {
            playerProjectiles.splice(i, 1);
        }
    }
    for (let i = invadersProjectiles.length - 1; i >= 0; i--) {
        if (invadersProjectiles[i].position.y > canvas.height) {
            invadersProjectiles.splice(i, 1);
        }
    }
};

const clearParticles = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }
};

const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        const particle = new Particle(
            {
                x: position.x,
                y: position.y,
            },
            {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5,
            },
            2,
            color
        );
        particles.push(particle);
    }
};

const checkShootInvaders = () => {
    for(let invaderIndex = grid.invaders.length - 1; invaderIndex >= 0; invaderIndex--) {
        const invader = grid.invaders[invaderIndex];
        for(let projectileIndex = playerProjectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
            const projectile = playerProjectiles[projectileIndex];
            if (invader.hit(projectile)) {
                soundEffects.playHitSound();
                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#941CFF"
                );
                incrementScore(10);
                grid.invaders.splice(invaderIndex, 1);
                playerProjectiles.splice(projectileIndex, 1);
                break;
            }
        }
    }
};

const showGameOverScreen = () => {
    document.body.append(gameOverScreen);
    gameOverScreen.classList.add("zoom-animation");
};

const gameOver = () => {
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10,
        "white"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "#4D9BE6"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5,
        "crimson"
    );
    player.alive = false;
    currentState = GameState.GAME_OVER;
    showGameOverScreen();
};

const checkShootPlayer = () => {
    for(let i = invadersProjectiles.length - 1; i >= 0; i--) {
        if (player.hit(invadersProjectiles[i])) {
            soundEffects.playExplosionSound();
            invadersProjectiles.splice(i, 1);
            gameOver();
            break;
        }
    }
};

const checkShootObstacles = () => {
    obstacles.forEach((obstacle) => {
        for (let i = playerProjectiles.length - 1; i >= 0; i--) {
            if (obstacle.hit(playerProjectiles[i])) {
                playerProjectiles.splice(i, 1);
                break;
            }
        }
        for (let i = invadersProjectiles.length - 1; i >= 0; i--) {
            if (obstacle.hit(invadersProjectiles[i])) {
                invadersProjectiles.splice(i, 1);
                break;
            }
        }
    });
};

const checkInvadersCollidedObstacles = () => {
    for(let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        for(const invader of grid.invaders) {
            if (invader.collided(obstacle)) {
                obstacles.splice(i, 1);
                break;
            }
        }
    }
};

const checkPlayerCollidedInvaders = () => {
    for(const invader of grid.invaders) {
        if (
            invader.position.x >= player.position.x &&
            invader.position.x <= player.position.x + player.width &&
            invader.position.y >= player.position.y
        ) {
            gameOver();
            break;
        }
    }
};

const spawnGrid = () => {
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();
        grid.rows = Math.round(Math.random() * 9 + 1);
        grid.cols = Math.round(Math.random() * 9 + 1);
        grid.restart();
        incrementLevel();
        if (obstacles.length === 0) {
            initObstacles();
        }
    }
};

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

    if (currentState === GameState.PLAYING) {
        showGameData();
        spawnGrid();
        drawProjectiles();
        drawParticles();
        drawObstacles();
        clearProjectiles();
        clearParticles();
        checkShootInvaders();
        checkShootPlayer();
        checkShootObstacles();
        checkInvadersCollidedObstacles();
        checkPlayerCollidedInvaders();
        grid.draw(ctx);
        grid.update(player.alive);

        ctx.save();
        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );

        if (keys.shoot.pressed && keys.shoot.released) {
            soundEffects.playShootSound();
            player.shoot(playerProjectiles);
            keys.shoot.released = false;
        }

        if (keys.left && player.position.x >= 0) {
            player.moveLeft();
            ctx.rotate(-0.15);
        }

        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight();
            ctx.rotate(0.15);
        }

        ctx.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );

        player.draw(ctx);
        ctx.restore();
    }

    if (currentState === GameState.GAME_OVER) {
        checkShootObstacles();
        drawProjectiles();
        drawParticles();
        drawObstacles();
        clearProjectiles();
        clearParticles();
        grid.draw(ctx);
        grid.update(player.alive);
    }

    requestAnimationFrame(gameLoop);
};

const restartGame = () => {
    currentState = GameState.PLAYING;
    player = new Player(canvas.width, canvas.height, selectedShipIndex);
    player.alive = true;
    grid.invaders.length = 0;
    grid.invadersVelocity = 1;
    invadersProjectiles.length = 0;
    playerProjectiles.length = 0;
    gameData.score = 0;
    gameData.level = 1;
    obstacles.length = 0;
    initObstacles();
};

const goToMainMenu = () => {
    gameOverScreen.remove();
    scoreUi.style.display = "none";
    currentState = GameState.START;
    if (!document.body.contains(startScreen)) {
        document.body.append(startScreen);
    }
    player = new Player(canvas.width, canvas.height, selectedShipIndex);
    player.alive = true;
    grid.invaders.length = 0;
    grid.invadersVelocity = 1;
    invadersProjectiles.length = 0;
    playerProjectiles.length = 0;
    gameData.score = 0;
    gameData.level = 1;
    obstacles.length = 0;
    initObstacles();
};

addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a") keys.left = true;
    if (key === "d") keys.right = true;
    if (key === " ") keys.shoot.pressed = true;
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    if (key === "a") keys.left = false;
    if (key === "d") keys.right = false;
    if (key === " ") {
        keys.shoot.pressed = false;
        keys.shoot.released = true;
    }
});

buttonPlay.addEventListener("click", () => {
    startScreen.remove();
    scoreUi.style.display = "block";
    currentState = GameState.PLAYING;
    player = new Player(canvas.width, canvas.height, selectedShipIndex);

    const shootLoop = () => {
        const invader = grid.getRandomInvader();
        if (invader) {
            invader.shoot(invadersProjectiles);
        }

        let shootInterval = 1000 - gameData.level * 50;
        if (shootInterval < 300) shootInterval = 300;

        setTimeout(shootLoop, shootInterval);
    };

    shootLoop();
});

buttonRestart.addEventListener("click", restartGame);
buttonMainMenu.addEventListener("click", goToMainMenu);

generateStars();
gameLoop();