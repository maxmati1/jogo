class Projectile {
    constructor(position, velocity) {
        this.position = position;  // posição atual do projétil (x, y)
        this.width = 2;            // largura do projétil (tiro)
        this.height = 20;          // altura do projétil
        this.velocity = velocity;  // velocidade vertical (positivo desce, negativo sobe)
    }

    // desenha o projétil na tela, como um retângulo branco
    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    // atualiza a posição do projétil de acordo com a velocidade
    update() {
        this.position.y += this.velocity; // move pra cima ou pra baixo no eixo Y
    }
}

export default Projectile;
