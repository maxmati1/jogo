import { PATH_INVADER_IMAGE } from "../utils/constants.js";
import Projectile from "./Projectile.js";

class Invader {
    constructor(position, velocity) {
        this.position = position;       // posição atual (x, y) do invasor
        this.scale = 0.8;               // escala da imagem para deixar menor (80% do tamanho original)
        this.width = 50 * this.scale;  // largura do invasor ajustada pela escala
        this.height = 37 * this.scale; // altura do invasor ajustada pela escala
        this.velocity = velocity;       // velocidade do movimento horizontal

        this.image = this.getImage(PATH_INVADER_IMAGE); // carrega a imagem do invasor
    }

    // Move o invasor para a direita pela velocidade atual
    moveRight() {
        this.position.x += this.velocity;
    }

    // Move o invasor para a esquerda pela velocidade atual
    moveLeft() {
        this.position.x -= this.velocity;
    }

    // Move o invasor para baixo (desce uma linha)
    moveDown() {
        this.position.y += this.height; // desce exatamente o tamanho da altura
    }

    // Incrementa a velocidade para deixar o invasor mais rápido
    incrementVelocity(boost) {
        this.velocity += boost;
    }

    // Função que cria a imagem para o invasor a partir do caminho (path)
    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    // Desenha o invasor na tela usando o contexto do canvas
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    // Faz o invasor atirar: cria um novo projétil e adiciona na lista de projéteis
    shoot(projectiles) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2, // posiciona o tiro no meio do invasor (e pequeno ajuste -2)
                y: this.position.y + this.height,        // tiro sai da base do invasor
            },
            10 // velocidade do projétil (desce rápido)
        );
        projectiles.push(p); // adiciona o tiro no array de projéteis para ser atualizado e desenhado
    }

    // Detecta se o invasor foi atingido por um projétil (checa colisão de retângulos)
    hit(projectile) {
        return (
            projectile.position.x >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y >= this.position.y &&
            projectile.position.y <= this.position.y + this.height
        );
    }

    // Detecta colisão com um obstáculo (usado para colisões com jogador ou barreiras)
    collided(obstacle) {
        return (
            (obstacle.position.x >= this.position.x &&
                obstacle.position.x <= this.position.x + this.width &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height) ||
            (obstacle.position.x + obstacle.width >= this.position.x &&
                obstacle.position.x <= this.position.x &&
                obstacle.position.y >= this.position.y &&
                obstacle.position.y <= this.position.y + this.height)
        );
    }
}

export default Invader;
