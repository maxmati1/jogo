import Projectile from "./Projectile.js";
import { PATH_BOSS_IMAGE } from "../utils/constants.js";

// Classe Boss representa o chefe do jogo
class Boss {
    constructor(canvasWidth, canvasHeight) {
        this.width = 160;   // Largura do boss
        this.height = 100;  // Altura do boss
        // Posição inicial: centralizado no topo
        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: 60
        };
        this.canvasWidth = canvasWidth;   // Largura do canvas (para limites)
        this.canvasHeight = canvasHeight; // Altura do canvas (não usado aqui, mas disponível)
        this.velocityX = 3;   // Velocidade horizontal do boss
        this.velocityY = 0;   // Não usada, mas disponível para movimentos verticais futuros
        // Carrega a imagem do boss
        this.image = this.getImage(PATH_BOSS_IMAGE);
        this.imageLoaded = false;
        // Quando a imagem carregar, seta o flag para true
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.hp = 65;         // Vida do boss
        this.alive = true;    // Se o boss está vivo
        this.shootDelay = 700; // Delay entre tiros
        this.firstShootDelay = 4000; // Delay inicial antes do primeiro tiro (ms)
        this.nextShootTime = Date.now() + this.firstShootDelay; // só vai poder atirar depois desse tempo
    }

    // Cria e retorna um objeto Image a partir do caminho informado
    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    // Move o boss para a direita
    moveRight() {
        this.position.x += this.velocityX;
    }

    // Move o boss para a esquerda
    moveLeft() {
        this.position.x -= this.velocityX;
    }

    // Faz o boss descer uma linha (igual aos invaders)
    moveDown() {
        this.position.y += this.height;
    }

    // Aumenta a velocidade horizontal do boss
    incrementVelocity(boost) {
        this.velocityX += boost;
    }

    // Atualiza a posição do boss na tela
    update() {
        if (!this.alive) return;

        // Move horizontalmente
        this.position.x += this.velocityX;

        // Se bater em uma das laterais, inverte direção e desce uma linha
        if (this.position.x <= 0 || this.position.x + this.width >= this.canvasWidth) {
            this.velocityX *= -1;
            this.moveDown();
        }
    }

    // Desenha o boss no canvas
    draw(ctx) {
        if (!this.alive) return;
        // Se a imagem carregou, desenha a imagem
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            // Caso contrário, desenha um retângulo vermelho com o texto "BOSS"
            ctx.fillStyle = "red";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "bold 20px Arial";
            ctx.fillText("BOSS", this.position.x + 40, this.position.y + 55);
        }
    }

    // Faz o boss atirar projeteis
    shoot(projectiles) {
        if (!this.alive) return;

        const now = Date.now();
        if (now < this.nextShootTime) return; // Só atira depois do tempo permitido

        // Atira
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2,
                y: this.position.y + this.height
            },
            10 // mesma velocidade dos invaders
        );
        projectiles.push(p);

        // Define o próximo tempo de tiro normalmente
        this.nextShootTime = now + this.shootDelay;
    }

    // Verifica se o boss foi atingido por um projétil
    hit(projectile) {
        return (
            projectile.position.x + projectile.width >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y + projectile.height >= this.position.y &&
            projectile.position.y <= this.position.y + this.height
        );
    }

    // Detecta colisão com um obstáculo (barreira) ou o player
    collided(entity) {
        return (
            entity.position.x + (entity.width || 0) >= this.position.x &&
            entity.position.x <= this.position.x + this.width &&
            entity.position.y + (entity.height || 0) >= this.position.y &&
            entity.position.y <= this.position.y + this.height
        );
    }

    // Diminui a vida do boss ao ser atingido
    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.alive = false;
        }
    }
}

export default Boss;