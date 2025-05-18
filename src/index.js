import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
import { GameState, NUMBER_STARS } from "./utils/constants.js";
import Boss from "./classes/Boss.js";

// Instancia efeitos sonoros e elementos de interface
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

let boss = null;         // Boss do jogo
let bossActive = false;  // Flag para saber se o boss está ativo

// Remove a tela de game over do DOM inicialmente
gameOverScreen.remove();

// Prepara o canvas para o jogo
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
ctx.imageSmoothingEnabled = false;

// Estado inicial do jogo
let currentState = GameState.START;

// Dados do jogo (pontuação, level, recorde)
const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

// Atualiza a interface com os dados do jogo
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

// Arrays para entidades do jogo
const stars = [];                // Estrelas de fundo
const playerProjectiles = [];    // Tiros do jogador
const invadersProjectiles = [];  // Tiros dos invasores
const particles = [];            // Partículas de explosão
const obstacles = [];            // Obstáculos/barreiras

// Função para criar obstáculos iniciais no cenário
const initObstacles = () => {
    const x = canvas.width / 2 - 50;
    const y = canvas.height - 250;
    const offset = canvas.width * 0.15;
    const color = "crimson";
    obstacles.length = 0;
    obstacles.push(new Obstacle({ x: x - offset, y }, 100, 20, color));
    obstacles.push(new Obstacle({ x: x + offset, y }, 100, 20, color));
};

initObstacles();

// Cria a grade de inimigos inicial
const grid = new Grid(2, 2);

// Teclas de controle do jogador
const keys = {
    left: false,
    right: false,
    shoot: {
        pressed: false,
        released: true,
    },
};

// Função para aumentar a pontuação
const incrementScore = (value) => {
    gameData.score += value;
    if (gameData.score > gameData.high) {
        gameData.high = gameData.score;
    }
};

// Função para passar de fase
const incrementLevel = () => {
    gameData.level += 1;
};

// Gera estrelas de fundo
const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height));
    }
};

// Desenha e atualiza as estrelas de fundo
const drawStars = () => {
    stars.forEach((star) => {
        star.draw(ctx);
        star.update();
    });
};

// Desenha e atualiza todos os projéteis do jogo
const drawProjectiles = () => {
    const projectiles = [...playerProjectiles, ...invadersProjectiles];
    projectiles.forEach((projectile) => {
        projectile.draw(ctx);
        projectile.update();
    });
};

// Desenha e atualiza partículas de explosão
const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx);
        particle.update();
    });
};

// Desenha obstáculos/barreiras
const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx));
};

// Remove projéteis que saíram da tela
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

// Remove partículas que já sumiram (opacity <= 0)
const clearParticles = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].opacity <= 0) {
            particles.splice(i, 1);
        }
    }
};

// Cria uma explosão de partículas em determinada posição, tamanho e cor
const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        const particle = new Particle(
            { x: position.x, y: position.y },
            { x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5 },
            2,
            color
        );
        particles.push(particle);
    }
};

// Checa colisão de tiros do player com invaders
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

// Exibe a tela de Game Over
const showGameOverScreen = () => {
    document.body.append(gameOverScreen);
    gameOverScreen.classList.add("zoom-animation");
};

// Função chamada quando o player morre
const gameOver = () => {
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        10, "white"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5, "#4D9BE6"
    );
    createExplosion(
        {
            x: player.position.x + player.width / 2,
            y: player.position.y + player.height / 2,
        },
        5, "crimson"
    );
    player.alive = false;
    currentState = GameState.GAME_OVER;
    showGameOverScreen();
};

// Checa se o player levou tiro dos invaders
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

// Checa se tiros (player/invader) colidem com obstáculos
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

// Checa se invasores colidiram com obstáculos
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

// Checa se invasores colidiram com o player (fim de jogo)
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

// Função para criar nova grade de invasores ou boss se for o caso
const spawnGrid = () => {
    // Level 10: boss
    if (gameData.level === 10 && !bossActive) {
        boss = new Boss(canvas.width, canvas.height);
        bossActive = true;
        return;
    }
    // Se boss está ativo, não cria grid de invasores
    if (bossActive) return;

    // Se todos os inimigos morreram, cria novo grid e sobe level
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();

        const minGrid = 2;
        const maxGrid = 8;
        let gridSize = Math.min(minGrid + Math.floor((gameData.level - 1) / 2), maxGrid);

        grid.rows = gridSize;
        grid.cols = gridSize;

        grid.restart();
        incrementLevel(); // O level só sobe aqui!
        if (obstacles.length === 0) {
            initObstacles();
        }
    }
};

// Loop principal do jogo
const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa a tela
    drawStars(); // Fundo animado

    // Tela inicial
    if (currentState === GameState.START) {
        requestAnimationFrame(gameLoop);
        return;
    }

    // Tela de Game Over
    if (currentState === GameState.GAME_OVER) {
        showGameData();
        drawProjectiles();
        drawParticles();
        drawObstacles();
        clearProjectiles();
        clearParticles();
        grid.draw(ctx);
        grid.update(player.alive);

        // Player desenhado parado
        ctx.save();
        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );
        player.draw(ctx);
        ctx.restore();

        requestAnimationFrame(gameLoop);
        return;
    }

    // Durante o jogo
    showGameData();
    drawProjectiles();
    drawParticles();
    drawObstacles();
    clearProjectiles();
    clearParticles();
    checkShootPlayer();
    checkShootObstacles();

    // --- BOSS ---
    if (bossActive && boss && boss.alive) {
        boss.update();
        boss.draw(ctx);

        // Checa se tiros do player acertam o boss
        for (let i = playerProjectiles.length - 1; i >= 0; i--) {
            if (boss.hit(playerProjectiles[i])) {
                boss.takeDamage();
                playerProjectiles.splice(i, 1);
            }
        }

        // Se o boss morreu, prepara próxima fase
        if (!boss.alive) {
            bossActive = false;
            boss = null;

            soundEffects.playNextLevelSound();
            const minGrid = 2;
            const maxGrid = 8;
            let gridSize = Math.min(minGrid + Math.floor((gameData.level - 1) / 2), maxGrid);
            grid.rows = gridSize;
            grid.cols = gridSize;
            grid.restart();
            incrementLevel();
            if (obstacles.length === 0) {
                initObstacles();
            }
        }
        // Enquanto boss está ativo, não atualiza/dedesenha grid
    } else {
        // --- GRID NORMAL (quando NÃO for boss) ---
        spawnGrid();
        checkShootInvaders();
        checkInvadersCollidedObstacles();
        checkPlayerCollidedInvaders();
        grid.draw(ctx);
        grid.update(player.alive);
    }

    // --- PLAYER SEMPRE APARECE (exceto na tela inicial) ---
    ctx.save();
    ctx.translate(
        player.position.x + player.width / 2,
        player.position.y + player.height / 2
    );

    // Atira se espaço pressionado
    if (keys.shoot.pressed && keys.shoot.released) {
        soundEffects.playShootSound();
        player.shoot(playerProjectiles);
        keys.shoot.released = false;
    }

    // Movimento do player
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

    requestAnimationFrame(gameLoop);
};

// Função para reiniciar o jogo após game over
const restartGame = () => {
    gameOverScreen.remove();
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
    boss = null;
    bossActive = false;
    initObstacles();
};

// Volta ao menu principal
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
    boss = null;
    bossActive = false;
    initObstacles();
};

// Controles de teclado para mover e atirar
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

// Inicia o jogo ao clicar em Play
buttonPlay.addEventListener("click", () => {
    startScreen.remove();
    scoreUi.style.display = "block";
    currentState = GameState.PLAYING;
    player = new Player(canvas.width, canvas.height, selectedShipIndex);

    // Função para invaders atirarem em loop (exceto se boss está ativo)
    const shootLoop = () => {
        if (!bossActive) {
            const invader = grid.getRandomInvader();
            if (invader) {
                invader.shoot(invadersProjectiles);
            }
        }
        let shootInterval = 1000 - gameData.level * 50;
        if (shootInterval < 300) shootInterval = 300;
        setTimeout(shootLoop, shootInterval);
    };

    shootLoop();
});

// Botões para reiniciar ou voltar ao menu
buttonRestart.addEventListener("click", restartGame);
buttonMainMenu.addEventListener("click", goToMainMenu);

// Gera estrelas de fundo e inicia o loop do jogo
generateStars();
gameLoop();