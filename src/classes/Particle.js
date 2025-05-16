class Particle {
    constructor(position, velocity, radius, color) {
        this.position = position;   // posição inicial da partícula (x, y)
        this.velocity = velocity;   // velocidade da partícula (x, y)
        this.radius = radius;       // tamanho da partícula (raio do círculo)
        this.color = color;         // cor da partícula
        this.opacity = 1;           // opacidade inicial (1 = totalmente visível)
    }

    // Desenha a partícula como um círculo com opacidade variável
    draw(ctx) {
        ctx.save();                // salva o estado atual do contexto (para restaurar depois)
        ctx.beginPath();           // inicia um novo caminho
        ctx.globalAlpha = this.opacity; // aplica a opacidade para criar efeito de transparência
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2); // círculo completo
        ctx.fillStyle = this.color;    // define a cor para preenchimento
        ctx.fill();                    // preenche o círculo
        ctx.closePath();               // fecha o caminho
        ctx.restore();                 // restaura o contexto para o estado anterior (remove a opacidade aplicada)
    }

    // Atualiza a posição e opacidade da partícula a cada frame
    update() {
        this.position.x += this.velocity.x;   // move a partícula na horizontal
        this.position.y += this.velocity.y;   // move a partícula na vertical

        // Diminui a opacidade aos poucos até chegar a zero, para criar efeito de sumir
        this.opacity = this.opacity - 0.008 <= 0 ? 0 : this.opacity - 0.008;
    }
}

export default Particle;
