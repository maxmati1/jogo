import {
    INITIAL_FRAMES,
    PATH_ENGINE_IMAGE,
    PATH_ENGINE_SPRITES,
} from "../utils/constants.js";

import Projectile from "./Projectile.js";

class Player {
    // Adiciona shipType como parâmetro para selecionar a nave
    constructor(canvasWidth, canvasHeight, shipType = 0) {
        this.alive = true;  // flag pra saber se o jogador está vivo
        this.width = 48 * 2;  // tamanho da nave na largura
        this.height = 48 * 2; // tamanho da nave na altura
        this.velocity = 6;    // velocidade do movimento horizontal

        // posição inicial do jogador (centralizado horizontalmente, embaixo da tela)
        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: canvasHeight - this.height - 30,
        };

        // Array com os caminhos das naves (agora 6 naves)
        this.sprites = [
            "src/assets/images/spaceship.png",
            "src/assets/images/spaceship1.png",
            "src/assets/images/spaceship2.png",
            "src/assets/images/spaceship3.png",
            "src/assets/images/spaceship4.png",
            "src/assets/images/spaceship5.png"
        ];

        // Usa o parâmetro shipType para selecionar a nave
        this.image = this.getImage(this.sprites[shipType] || this.sprites[0]);
        this.engineImage = this.getImage(PATH_ENGINE_IMAGE);
        this.engineSprites = this.getImage(PATH_ENGINE_SPRITES);

        this.sx = 0;                // frame atual da animação do motor (posição no sprite sheet)
        this.framesCounter = INITIAL_FRAMES;  // contador para controlar a troca de frames (velocidade da animação)
    }

    // mexe o jogador para esquerda
    moveLeft() {
        this.position.x -= this.velocity;
    }

    // mexe o jogador para direita
    moveRight() {
        this.position.x += this.velocity;
    }

    // função auxiliar para criar a imagem a partir do caminho do arquivo
    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    // desenha a nave e os efeitos na tela
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );

        // desenha a animação do motor (spritesheet animado)
        ctx.drawImage(
            this.engineSprites,
            this.sx, // frame atual na spritesheet
            0,
            48,
            48,
            this.position.x,
            this.position.y + 10,
            this.width,
            this.height
        );

        // desenha a imagem estática do motor em cima da animação
        ctx.drawImage(
            this.engineImage,
            this.position.x,
            this.position.y + 8,
            this.width,
            this.height
        );

        this.update(); // atualiza animação e estado
    }

    // atualiza a animação do motor (troca frames do spritesheet)
    update() {
        if (this.framesCounter === 0) {
            this.sx = this.sx === 96 ? 0 : this.sx + 48; // vai para o próximo frame ou reseta
            this.framesCounter = INITIAL_FRAMES;
        }

        this.framesCounter--;
    }

    // cria e adiciona um tiro na lista de projéteis
    shoot(projectiles) {
        const p = new Projectile(
            {
                x: this.position.x + this.width / 2 - 2, // centraliza o tiro na nave
                y: this.position.y + 2,
            },
            -10 // velocidade vertical do tiro (para cima)
        );

        projectiles.push(p);
    }

    // verifica se o jogador foi atingido por um projétil inimigo (colisão)
    hit(projectile) {
        return (
            projectile.position.x >= this.position.x + 20 &&
            projectile.position.x <= this.position.x + 20 + this.width - 38 &&
            projectile.position.y + projectile.height >= this.position.y + 22 &&
            projectile.position.y + projectile.height <=
                this.position.y + 22 + this.height - 34
        );
    }
}

export default Player;