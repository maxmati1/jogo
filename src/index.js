import Grid from "./classes/Grid.js";
import Obstacle from "./classes/Obstacle.js";
import Particle from "./classes/Particle.js";
import Player from "./classes/Player.js";
import SoundEffects from "./classes/SoundEffects.js";
import Star from "./classes/Star.js";
import { GameState, NUMBER_STARS } from "./utils/constants.js";
import Boss from "./classes/Boss.js";
import Boss1 from "./classes/Boss1.js"; // Adicionado para boss do level 15
import Boss2 from "./classes/Boss2.js"; // Adicionado para boss do level 20

const difficulties = [
  {
    nome: "Fácil",
    gridRows: 2,
    gridCols: 2,
    invaderVelocity: 1
  },
  {
    nome: "Médio",
    gridRows: 3,
    gridCols: 4,
    invaderVelocity: 1.7
  },
  {
    nome: "Difícil",
    gridRows: 5,
    gridCols: 6,
    invaderVelocity: 3.2
  }
];
let difficultyIndex = 1; // Começa em Médio
let currentDifficulty = difficulties[difficultyIndex];

// Adiciona novo estado para cutscene do boss
GameState.CUTSCENE_BOSS = 99;

// Instancia efeitos sonoros e elementos de interface
const soundEffects = new SoundEffects();
const startScreen = document.querySelector(".start-screen");
const gameOverScreen = document.querySelector(".game-over");
const scoreUi = document.querySelector(".score-ui");
const scoreElement = scoreUi.querySelector(".score > span");
const levelElement = scoreUi.querySelector(".level > span");
const highElement = scoreUi.querySelector(".high > span");
const difficultyBtn = document.getElementById("difficulty-btn");
difficultyBtn.textContent = currentDifficulty.nome;

// Evento para alternar dificuldade
difficultyBtn.addEventListener("click", () => {
  difficultyIndex = (difficultyIndex + 1) % difficulties.length;
  currentDifficulty = difficulties[difficultyIndex];
  difficultyBtn.textContent = currentDifficulty.nome;
});

const buttonPlay = document.querySelector(".button-play");
const buttonRestart = document.querySelector(".button-restart");
const buttonMainMenu = document.querySelector(".button-main-menu");
const shipButtons = document.querySelectorAll('.ship-btn');
const shipHistories = [
    {
        text:"Capitão Astro: Líder corajoso da frota espacial, pilota a nave Solarion para defender a Terra dos ataques alienígenas dos Draxxion. ",
        img: "src/assets/images/piloto1.png"
    },
    {
        text: "Tenente Nova: Jovem gênio da navegação, venceu a Corrida de Andrômeda aos 16 anos.",
        img: "src/assets/images/piloto2.png"
    },
    {
        text: "Comandante Orion: Sobrevivente do ataque de Vega, promete vingança contra invasores.",
        img: "src/assets/images/piloto3.png"
    },
    {
        text: "Dra. Stella: Cientista e piloto, inventora do propulsor de dobra quântica.",
        img: "src/assets/images/piloto4.png"
    },
    {
        text: "Major Pulsar: Ex-mercenário, agora luta pela liberdade dos planetas aliados.",
        img: "src/assets/images/piloto5.png"
    },
    {
        text: "Ensign Comet: Recruta promissor, sonha em ser o maior herói da galáxia.",
        img: "src/assets/images/piloto6.png"
    }
];

let boss = null;         // Boss do jogo
let bossActive = false;  // Flag para saber se o boss está ativo

// Cutscene do boss
let cutsceneStartTime = 0;
let cutsceneDuration = 3000; // ms

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
    enemiesDefeated: 0,
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

//Função que faz aparecer uma caixa de texto ao passar o mouse em cima da seleção de nave
const shipTooltip = document.getElementById('ship-tooltip');
shipButtons.forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => {
        shipTooltip.innerHTML = `
            <img src="${shipHistories[idx].img}" alt="Nave ${idx}" style="width:48px;height:48px;display:block;margin:0 auto 0.5em auto;">
            <div>${shipHistories[idx].text}</div>
        `;
        const rect = btn.getBoundingClientRect();
        shipTooltip.style.left = `${rect.left + rect.width / 2 - 120}px`;
        shipTooltip.style.top = `${rect.top - 70}px`;
        shipTooltip.style.display = "block";
    });
    btn.addEventListener('mouseleave', () => {
        shipTooltip.style.display = "none";
    });
});

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
                gameData.enemiesDefeated++; // incrementa abates
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
    // Atualiza as estatísticas na tela
    gameOverScreen.querySelector(".stat-score").textContent = gameData.score;
    gameOverScreen.querySelector(".stat-level").textContent = gameData.level;
    gameOverScreen.querySelector(".stat-kills").textContent = gameData.enemiesDefeated;
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

// Checa se o boss colidiu com barreiras e destrói elas
const checkBossCollidedObstacles = () => {
    if (bossActive && boss && boss.alive) {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            if (boss.collided(obstacles[i])) {
                obstacles.splice(i, 1); // destrói a barreira
            }
        }
    }
};
// Checa se o boss colidiu com o player e mata o jogador
const checkBossCollidedPlayer = () => {
    if (bossActive && boss && boss.alive && player.alive) {
        if (boss.collided(player)) {
            soundEffects.playExplosionSound();
            createExplosion(
                {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 10, "white"
            );
            createExplosion(
                {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 5, "#4D9BE6"
            );
            createExplosion(
                {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 5, "crimson"
            );
            player.alive = false;
            currentState = GameState.GAME_OVER;
            showGameOverScreen();
        }
    }
};

// ===========================
// CONTROLE DE TIRO DOS INVADERS
// ===========================

let shootLoopTimeout = null;

function startShootLoop() {
    if (shootLoopTimeout) {
        clearTimeout(shootLoopTimeout);
        shootLoopTimeout = null;
    }
    shootLoop();
}

function shootLoop() {
    if (bossActive || currentState === GameState.CUTSCENE_BOSS) {
        shootLoopTimeout = null;
        return;
    }
    const invader = grid.getRandomInvader();
    if (invader) {
        invader.shoot(invadersProjectiles);
    }
    let shootInterval = 2000 - gameData.level * 50;
    if (shootInterval < 300) shootInterval = 300;
    shootLoopTimeout = setTimeout(shootLoop, shootInterval);
}

// ===========================
// FIM DO CONTROLE DE TIRO DOS INVADERS
// ===========================

const MAX_ROWS = 6; // Máximo de linhas de invaders
const MAX_COLS = 10; // Máximo de colunas de invaders
const MAX_INVADER_VELOCITY = 6; // Velocidade máxima dos invaders

const spawnGrid = () => {
    // Level 10: boss padrão
    if (gameData.level === 10 && !bossActive) {
        if (currentState !== GameState.CUTSCENE_BOSS) {
            currentState = GameState.CUTSCENE_BOSS;
            cutsceneStartTime = Date.now();
            return;
        }
        if (Date.now() - cutsceneStartTime >= cutsceneDuration) {
            boss = new Boss(canvas.width, canvas.height);
            bossActive = true;
            playerProjectiles.length = 0;
            invadersProjectiles.length = 0;
            if (shootLoopTimeout) {
                clearTimeout(shootLoopTimeout);
                shootLoopTimeout = null;
            }
            currentState = GameState.PLAYING;
        }
        return;
    }
    // Level 15: Boss1
    if (gameData.level === 15 && !bossActive) {
        if (currentState !== GameState.CUTSCENE_BOSS) {
            currentState = GameState.CUTSCENE_BOSS;
            cutsceneStartTime = Date.now();
            return;
        }
        if (Date.now() - cutsceneStartTime >= cutsceneDuration) {
            boss = new Boss1(canvas.width, canvas.height);
            bossActive = true;
            playerProjectiles.length = 0;
            invadersProjectiles.length = 0;
            if (shootLoopTimeout) {
                clearTimeout(shootLoopTimeout);
                shootLoopTimeout = null;
            }
            currentState = GameState.PLAYING;
        }
        return;
    }
    // Level 20: Boss2
    if (gameData.level === 20 && !bossActive) {
        if (currentState !== GameState.CUTSCENE_BOSS) {
            currentState = GameState.CUTSCENE_BOSS;
            cutsceneStartTime = Date.now();
            return;
        }
        if (Date.now() - cutsceneStartTime >= cutsceneDuration) {
            boss = new Boss2(canvas.width, canvas.height);
            bossActive = true;
            playerProjectiles.length = 0;
            invadersProjectiles.length = 0;
            if (shootLoopTimeout) {
                clearTimeout(shootLoopTimeout);
                shootLoopTimeout = null;
            }
            currentState = GameState.PLAYING;
        }
        return;
    }
    // Se boss está ativo, não cria grid de invasores
    if (bossActive) return;

    // Se todos os inimigos morreram, cria novo grid e sobe level
    if (grid.invaders.length === 0) {
        soundEffects.playNextLevelSound();

        // Limite de linhas e colunas
        let gridRows = Math.min(
            currentDifficulty.gridRows + Math.floor((gameData.level - 1) / 2),
            MAX_ROWS
        );
        let gridCols = Math.min(
            currentDifficulty.gridCols + Math.floor((gameData.level - 1) / 2),
            MAX_COLS
        );

        grid.rows = gridRows;
        grid.cols = gridCols;
        grid.restart();

        // Limita a velocidade máxima dos invaders
        const velocity = Math.min(
            currentDifficulty.invaderVelocity + gameData.level * 0.2,
            MAX_INVADER_VELOCITY
        );
        grid.invaders.forEach(invader => {
            invader.velocity = velocity;
        });

        incrementLevel();
        if (obstacles.length === 0) {
            initObstacles();
        }
        if (!bossActive && !shootLoopTimeout) startShootLoop();
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

 // CUTSCENE DO BOSS - Entrada dramática com descida ao centro, zoom e tremor
 if (currentState === GameState.CUTSCENE_BOSS) {
    // Instancia o boss se ainda não existe
    if (!boss) {
        if (gameData.level === 10) boss = new Boss(canvas.width, canvas.height);
        else if (gameData.level === 15) boss = new Boss1(canvas.width, canvas.height);
        else if (gameData.level === 20) boss = new Boss2(canvas.width, canvas.height);
        else boss = new Boss(canvas.width, canvas.height);

        boss.position.x = canvas.width / 2 - boss.width / 2;
        boss.position.y = -boss.height;
        // Descer até o centro da tela na cutscene
        boss.targetY = canvas.height / 2 - boss.height / 2;
        boss.entryStart = Date.now();
        boss.entryDuration = 4000; // desce lentamente
        boss.cutsceneSoundPlayed = false;
    }

    const elapsed = Date.now() - boss.entryStart;
    const t = Math.min(elapsed / boss.entryDuration, 1);
    // Easing para descida mais suave
    const eased = 1 - Math.pow(1 - t, 3);
    boss.position.y = -boss.height + (boss.targetY + boss.height) * eased;

    // Tremor da tela (shake)
    let shakeX = Math.sin(elapsed * 0.18) * 10 * (1 - t);
    let shakeY = Math.cos(elapsed * 0.21) * 8 * (1 - t);

    // Zoom dramático no boss (aumenta de 1x até 2x no final da cutscene)
    let zoom = 1 + 1 * t;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-canvas.width / 2 + shakeX / zoom, -canvas.height / 2 + shakeY / zoom);

    // Desenha o boss (com zoom e shake aplicados)
    boss.draw(ctx);

    ctx.restore();

    // Desenha o player parado durante a cutscene (sem zoom, no lugar normal)
    player.draw(ctx);

    // CHECA COLISÃO BOSS X PLAYER
    if (
        boss.position.x < player.position.x + player.width &&
        boss.position.x + boss.width > player.position.x &&
        boss.position.y < player.position.y + player.height &&
        boss.position.y + boss.height > player.position.y &&
        player.alive
    ) {
        player.alive = false;
        soundEffects.playExplosionSound();
        createExplosion(
            {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 10, "white"
        );
        createExplosion(
            {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 5, "#4D9BE6"
        );
        createExplosion(
            {x: player.position.x + player.width / 2, y: player.position.y + player.height / 2}, 5, "crimson"
        );
        currentState = GameState.GAME_OVER;
        showGameOverScreen();
        return;
    }

    // Texto só aparece quando boss está quase no lugar
    if (t > 0.85) {
        ctx.save();
        ctx.globalAlpha = (t - 0.85) / 0.15;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Prepare-se para o chefe!", canvas.width/2, boss.targetY + boss.height + 120);
        ctx.restore();
    }

    // Efeito sonoro quando chega
    if (t > 0.95 && !boss.cutsceneSoundPlayed) {
        soundEffects.playNextLevelSound();
        boss.cutsceneSoundPlayed = true;
    }

    // Espera boss terminar a descida + tempo extra (total da cutscene)
    if (elapsed > boss.entryDuration + 1200) {
        bossActive = true;
        // Depois da cutscene, posicione o boss na linha dos invaders para o gameplay
        boss.position.y = 120;
        boss.shootTimer = Date.now(); // Faz o boss esperar o delay do tiro!
        
        // Limpa os tiros dos inimigos e do player para evitar projéteis bugados
        invadersProjectiles.length = 0;
        playerProjectiles.length = 0;
        currentState = GameState.PLAYING;
    } else {
        requestAnimationFrame(gameLoop);
        return;
    }
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

        // Boss destrói barreiras ao relar e mata jogador ao relar
        checkBossCollidedObstacles();
        checkBossCollidedPlayer();

        // Boss atira em loop (igual invader)
        if (!boss.shootTimer || Date.now() - boss.shootTimer > 1100) {
            boss.shoot(invadersProjectiles);
            boss.shootTimer = Date.now();
        }

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
            if (!bossActive && !shootLoopTimeout) startShootLoop();
        }
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
    gameData.enemiesDefeated = 0; // zera abates
    obstacles.length = 0;
    boss = null;
    bossActive = false;
    initObstacles();

    // Aqui atualizamos o grid para a dificuldade escolhida:
    grid.rows = currentDifficulty.gridRows;
    grid.cols = currentDifficulty.gridCols;
    grid.restart();
    grid.invaders.forEach(invader => {
        invader.velocity = currentDifficulty.invaderVelocity;
    });

    if (!bossActive && !shootLoopTimeout) startShootLoop();
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
    gameData.enemiesDefeated = 0; // zera abates
    obstacles.length = 0;
    boss = null;
    bossActive = false;
    initObstacles();
    if (shootLoopTimeout) {
        clearTimeout(shootLoopTimeout);
        shootLoopTimeout = null;
    }
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

    grid.rows = currentDifficulty.gridRows;
    grid.cols = currentDifficulty.gridCols;
    grid.restart();
    grid.invaders.forEach(invader => {
    invader.velocity = currentDifficulty.invaderVelocity;
    }); 

    if (shootLoopTimeout) {
        clearTimeout(shootLoopTimeout);
        shootLoopTimeout = null;
    }
    startShootLoop();
});

// Botões para reiniciar ou voltar ao menu
buttonRestart.addEventListener("click", restartGame);
buttonMainMenu.addEventListener("click", goToMainMenu);

// Gera estrelas de fundo e inicia o loop do jogo
generateStars();
gameLoop();