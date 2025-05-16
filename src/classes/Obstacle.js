class Obstacle {
    constructor(position, width, height, color) {
        this.position = position;   // posição do obstáculo (x, y)
        this.width = width;         // largura do obstáculo
        this.height = height;       // altura do obstáculo
        this.color = color;         // cor do obstáculo (preenchimento no canvas)
    }

    // Desenha o obstáculo como um retângulo preenchido na tela
    draw(ctx) {
        ctx.fillStyle = this.color;   // define a cor para desenhar
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height); // desenha o retângulo
    }

    // Verifica se um projétil atingiu o obstáculo
    hit(projectile) {
        // Ajusta a posição Y do projétil dependendo da direção dele (subindo ou descendo)
        // Se velocidade < 0, o projétil está subindo (tiro do jogador)
        // Caso contrário, está descendo (tiro inimigo)
        const projectilePositionY =
            projectile.velocity < 0
                ? projectile.position.y              // ponta superior do projétil
                : projectile.position.y + projectile.height;  // ponta inferior do projétil

        // Checa se a posição do projétil está dentro dos limites do obstáculo
        return (
            projectile.position.x >= this.position.x &&                  // tiro está dentro da largura do obstáculo
            projectile.position.x <= this.position.x + this.width &&
            projectilePositionY >= this.position.y &&                    // tiro está dentro da altura do obstáculo
            projectilePositionY <= this.position.y + this.height
        );
    }
}

export default Obstacle;
