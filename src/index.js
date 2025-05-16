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

gameOverScreen.remove(); // Remove tela de game over do DOM inicialmente

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth; // Ajusta canvas à largura da janela
canvas.height = innerHeight; // Ajusta canvas à altura da janela

ctx.imageSmoothingEnabled = false; // Desabilita suavização para pixel art ficar nítida

let currentState = GameState.START; // Estado inicial do jogo

const gameData = {
    score: 0,
    level: 1,
    high: 0,
};

const showGameData = () => {
    scoreElement.textContent = gameData.score; // Atualiza score na UI
    levelElement.textContent = gameData.level; // Atualiza nível na UI
    highElement.textContent = gameData.high; // Atualiza recorde na UI
};

const player = new Player(canvas.width, canvas.height); // Cria jogador

const stars = []; // Fundo de estrelas
const playerProjectiles = []; // Tiros do jogador
const invadersProjectiles = []; // Tiros dos inimigos
const particles = []; // Partículas para explosões
const obstacles = []; // Obstáculos para proteção

const initObstacles = () => {
    const x = canvas.width / 2 - 50;
    const y = canvas.height - 250;
    const offset = canvas.width * 0.15;
    const color = "crimson";

    const obstacle1 = new Obstacle({ x: x - offset, y }, 100, 20, color); // Obstáculo esquerdo
    const obstacle2 = new Obstacle({ x: x + offset, y }, 100, 20, color); // Obstáculo direito

    obstacles.push(obstacle1);
    obstacles.push(obstacle2);
};

initObstacles(); // Inicializa obstáculos

const grid = new Grid(
    Math.round(Math.random() * 9 + 1), // Número aleatório de linhas
    Math.round(Math.random() * 9 + 1)  // Número aleatório de colunas
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
    gameData.score += value; // Incrementa score

    if (gameData.score > gameData.high) { // Atualiza recorde se necessário
        gameData.high = gameData.score;
    }
};

const incrementLevel = () => {
    gameData.level += 1; // Incrementa nível
};

const generateStars = () => {
    for (let i = 0; i < NUMBER_STARS; i += 1) {
        stars.push(new Star(canvas.width, canvas.height)); // Cria fundo estrelado
    }
};

const drawStars = () => {
    stars.forEach((star) => {
        star.draw(ctx); // Desenha estrela
        star.update();  // Atualiza posição ou brilho da estrela
    });
};

const drawProjectiles = () => {
    const projectiles = [...playerProjectiles, ...invadersProjectiles]; // Junta todos os tiros

    projectiles.forEach((projectile) => {
        projectile.draw(ctx); // Desenha cada tiro
        projectile.update();  // Atualiza posição do tiro
    });
};

const drawParticles = () => {
    particles.forEach((particle) => {
        particle.draw(ctx); // Desenha partícula (explosão)
        particle.update();  // Atualiza opacidade e movimento da partícula
    });
};

const drawObstacles = () => {
    obstacles.forEach((obstacle) => obstacle.draw(ctx)); // Desenha obstáculos
};

const clearProjectiles = () => {
    playerProjectiles.forEach((projectile, i) => {
        if (projectile.position.y <= 0) { // Remove tiros do jogador que saíram da tela
            playerProjectiles.splice(i, 1);
        }
    });

    invadersProjectiles.forEach((projectile, i) => {
        if (projectile.position.y > canvas.height) { // Remove tiros dos inimigos que saíram da tela
            invadersProjectiles.splice(i, 1);
        }
    });
};

const clearParticles = () => {
    particles.forEach((particle, i) => {
        if (particle.opacity <= 0) { // Remove partículas invisíveis
            particles.splice(i, 1);
        }
    });
};

const createExplosion = (position, size, color) => {
    for (let i = 0; i < size; i += 1) {
        const particle = new Particle(
            {
                x: position.x,
                y: position.y,
            },
            {
                x: (Math.random() - 0.5) * 1.5, // Movimento aleatório da partícula
                y: (Math.random() - 0.5) * 1.5,
            },
            2,
            color
        );

        particles.push(particle); // Adiciona partícula para explosão visual
    }
};

const checkShootInvaders = () => {
    grid.invaders.forEach((invader, invaderIndex) => {
        playerProjectiles.some((projectile, projectileIndex) => {
            if (invader.hit(projectile)) { // Se o tiro do jogador acertou inimigo
                soundEffects.playHitSound();

                createExplosion(
                    {
                        x: invader.position.x + invader.width / 2,
                        y: invader.position.y + invader.height / 2,
                    },
                    10,
                    "#941CFF"
                );

                incrementScore(10); // Adiciona pontos

                grid.invaders.splice(invaderIndex, 1); // Remove inimigo
                playerProjectiles.splice(projectileIndex, 1); // Remove tiro

                return true; // Para o loop some() para esse inimigo
            }
        });
    });
};

const showGameOverScreen = () => {
    document.body.append(gameOverScreen); // Adiciona tela de game over
    gameOverScreen.classList.add("zoom-animation"); // Animação da tela
};

const gameOver = () => {
    // Cria explosões coloridas na posição do jogador
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

    player.alive = false; // Marca jogador como morto
    currentState = GameState.GAME_OVER; // Muda estado do jogo para game over
    showGameOverScreen(); // Mostra tela de game over
};

const checkShootPlayer = () => {
    invadersProjectiles.some((projectile, index) => {
        if (player.hit(projectile)) { // Se jogador foi atingido por tiro inimigo
            soundEffects.playExplosionSound();
            invadersProjectiles.splice(index, 1); // Remove o tiro

            gameOver(); // Aciona fim do jogo
            return true;
        }
    });
};

const checkShootObstacles = () => {
    obstacles.forEach((obstacle) => {
        playerProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) { // Se tiro do jogador atingiu obstáculo
                playerProjectiles.splice(index, 1); // Remove tiro
                return true;
            }
        });

        invadersProjectiles.some((projectile, index) => {
            if (obstacle.hit(projectile)) { // Se tiro inimigo atingiu obstáculo
                invadersProjectiles.splice(index, 1); // Remove tiro
                return true;
            }
        });
    });
};

const checkInvadersCollidedObstacles = () => {
    obstacles.forEach((obstacle, i) => {
        grid.invaders.some((invader) => {
            if (invader.collided(obstacle)) { // Se inimigo colidiu com obstáculo
                obstacles.splice(i, 1); // Remove obstáculo
                return true;
            }
        });
    });
};

const checkPlayerCollidedInvaders = () => {
    grid.invaders.some((invader) => {
        if (
            invader.position.x >= player.position.x &&
            invader.position.x <= player.position.x + player.width &&
            invader.position.y >= player.position.y
        ) {
            gameOver(); // Se inimigo avançou até o jogador, fim do jogo
            return true;
        }
    });
};

const spawnGrid = () => {
    if (grid.invaders.length === 0) { // Se todos os inimigos foram eliminados
        soundEffects.playNextLevelSound();

        grid.rows = Math.round(Math.random() * 9 + 1); // Novas linhas aleatórias
        grid.cols = Math.round(Math.random() * 9 + 1); // Novas colunas aleatórias
        grid.restart(); // Reinicia grid de inimigos

        incrementLevel(); // Avança nível

        if (obstacles.length === 0) {
            initObstacles(); // Reinicia obstáculos caso tenham acabado
        }
    }
};

const gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa tela

    drawStars(); // Fundo de estrelas

    if (currentState === GameState.PLAYING) {
        showGameData(); // Atualiza UI de score e nível
        spawnGrid(); // Checa se deve gerar nova leva de inimigos

        drawProjectiles(); // Desenha tiros
        drawParticles(); // Desenha partículas de explosão
        drawObstacles(); // Desenha obstáculos

        clearProjectiles(); // Remove tiros fora da tela
        clearParticles(); // Remove partículas invisíveis

        checkShootInvaders(); // Verifica se tiros acertaram inimigos
        checkShootPlayer(); // Verifica se inimigos acertaram jogador
        checkShootObstacles(); // Verifica tiros atingindo obstáculos
        checkInvadersCollidedObstacles(); // Verifica colisão inimigos e obstáculos
        checkPlayerCollidedInvaders(); // Verifica colisão inimigos e jogador

        grid.draw(ctx); // Desenha inimigos
        grid.update(player.alive); // Atualiza posição inimigos

        ctx.save();

        // Centraliza contexto no jogador para aplicar rotação
        ctx.translate(
            player.position.x + player.width / 2,
            player.position.y + player.height / 2
        );

        if (keys.shoot.pressed && keys.shoot.released) { // Se tecla de tiro foi pressionada e está liberada
            soundEffects.playShootSound();
            player.shoot(playerProjectiles); // Cria tiro
            keys.shoot.released = false; // Impede tiro contínuo
        }

        if (keys.left && player.position.x >= 0) {
            player.moveLeft(); // Move jogador para esquerda
            ctx.rotate(-0.15); // Rotaciona ligeiramente o sprite para esquerda
        }

        if (keys.right && player.position.x <= canvas.width - player.width) {
            player.moveRight(); // Move jogador para direita
            ctx.rotate(0.15); // Rotaciona ligeiramente o sprite para direita
        }

        // Reverte translação para desenhar jogador no local correto
        ctx.translate(
            -player.position.x - player.width / 2,
            -player.position.y - player.height / 2
        );

        player.draw(ctx); // Desenha jogador
        ctx.restore();
    }

    if (currentState === GameState.GAME_OVER) {
        checkShootObstacles(); // Ainda checa tiros e obstáculos

        drawProjectiles(); // Desenha tiros
        drawParticles(); // Desenha partículas
        drawObstacles(); // Desenha obstáculos

        clearProjectiles(); // Limpa tiros fora da tela
        clearParticles(); // Limpa partículas invisíveis

        grid.draw(ctx); // Desenha inimigos
        grid.update(player.alive); // Atualiza inimigos (mesmo com jogador morto)
    }

    requestAnimationFrame(gameLoop); // Loop recursivo
};

const restartGame = () => {
    currentState = GameState.PLAYING;

    player.alive = true;

    grid.invaders.length = 0; // Limpa inimigos
    grid.invadersVelocity = 1; // Reseta velocidade dos inimigos

    invadersProjectiles.length = 0; // Limpa tiros inimigos
    gameData.score = 0; // Reseta pontuação
    gameData.level = 0; // Reseta nível

    gameOverScreen.remove(); // Remove tela de game over
};

addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = true; // Tecla esquerda pressionada
    if (key === "d") keys.right = true; // Tecla direita pressionada
    if (key === " ") keys.shoot.pressed = true; // Tecla tiro pressionada
});

addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();

    if (key === "a") keys.left = false; // Tecla esquerda liberada
    if (key === "d") keys.right = false; // Tecla direita liberada
    if (key === "enter") {
        keys.shoot.pressed = false; // Tecla tiro liberada 
        keys.shoot.released = true; // Permite próximo tiro
    }
});

buttonPlay.addEventListener("click", () => {
    startScreen.remove(); // Remove tela inicial
    scoreUi.style.display = "block"; // Exibe UI de score
    currentState = GameState.PLAYING; // Inicia o jogo

    setInterval(() => {
        const invader = grid.getRandomInvader();

        if (invader) {
            invader.shoot(invadersProjectiles); // Inimigos disparam periodicamente
        }
    }, 1000);
});

buttonRestart.addEventListener("click", restartGame);

generateStars(); // Cria estrelas para fundo
gameLoop(); // Inicia loop principal
