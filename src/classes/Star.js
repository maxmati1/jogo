class Star {
    constructor(canvasWidth, canvasHeight) {
        // Posição inicial aleatória dentro da tela
        this.position = {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
        };

        // Raio (tamanho) aleatório entre 0.3 e 1.3 para variar o tamanho das estrelas
        this.radius = Math.random() * 1 + 0.3;

        // Velocidade vertical proporcional ao tamanho da estrela para efeito de profundidade
        this.velocity = (Math.random() * 0.4 + 0.1) * this.radius;

        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.color = "white"; // cor padrão da estrela
    }

    // Desenha a estrela como um círculo branco
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }

    // Atualiza a posição da estrela
    update() {
        // Se a estrela saiu da parte de baixo da tela (com margem do próprio raio),
        // reposiciona ela no topo com uma nova posição X aleatória e velocidade nova
        if (this.position.y > this.canvasHeight + this.radius) {
            this.position.y = -this.radius;
            this.position.x = Math.random() * this.canvasWidth;
            this.velocity = (Math.random() * 0.4 + 0.1) * this.radius;
        }

        // Move a estrela pra baixo de acordo com sua velocidade
        this.position.y += this.velocity;
    }
}

export default Star;
