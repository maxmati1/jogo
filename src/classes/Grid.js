import Invader from "./Invader.js";

class Grid {
    constructor(rows, cols) {
        this.rows = rows;            // número de linhas de invasores
        this.cols = cols;            // número de colunas de invasores
        this.direction = "right";    // direção atual do movimento dos invasores
        this.moveDown = false;       // flag para fazer os invasores descerem
        this.boost = 0.1;            // aceleração que aumenta a velocidade ao descer
        this.invadersVelocity = 1;   // velocidade inicial dos invasores

        this.invaders = this.init(); // cria o array de invasores na posição inicial
    }

    // Cria os invasores em forma de grid, distribuindo posição com base em linhas e colunas
    init() {
        const array = [];

        for (let row = 0; row < this.rows; row += 1) {
            for (let col = 0; col < this.cols; col += 1) {
                const invader = new Invader(
                    {
                        x: col * 50 + 20,   // espaçamento horizontal entre invasores (50 px) + offset 20
                        y: row * 37 + 120,  // espaçamento vertical entre invasores (37 px) + offset 120
                    },
                    this.invadersVelocity    // passa a velocidade atual para o invasor
                );

                array.push(invader);
            }
        }

        return array;
    }

    // Desenha todos os invasores no canvas, chamando o método draw de cada um
    draw(ctx) {
        this.invaders.forEach((invader) => invader.draw(ctx));
    }

    // Atualiza posição e estado dos invasores a cada frame
    update(playerStatus) {
        // Se algum invasor alcançou a borda direita, muda direção para esquerda e sinaliza para descer
        if (this.reachedRightBoundary()) {
            this.direction = "left";
            this.moveDown = true;
        } 
        // Se alcançou borda esquerda, muda direção para direita e sinaliza para descer
        else if (this.reachedLeftBoundary()) {
            this.direction = "right";
            this.moveDown = true;
        }

        // Se o jogador está morto, não descer mais (opcional para comportamento do jogo)
        if (!playerStatus) this.moveDown = false;

        // Atualiza cada invasor: move para baixo se necessário, aumenta velocidade e anda para direita/esquerda
        this.invaders.forEach((invader) => {
            if (this.moveDown) {
                invader.moveDown();
                invader.incrementVelocity(this.boost); // acelera invasores ao descer
                this.invadersVelocity = invader.velocity; // atualiza velocidade do grid para sincronizar
            }

            if (this.direction === "right") invader.moveRight();
            if (this.direction === "left") invader.moveLeft();
        });

        this.moveDown = false; // reseta o movimento descendente até próxima troca de direção
    }

    // Verifica se algum invasor chegou à borda direita da tela
    reachedRightBoundary() {
        return this.invaders.some(
            (invader) => invader.position.x + invader.width >= innerWidth
        );
    }

    // Verifica se algum invasor chegou à borda esquerda da tela
    reachedLeftBoundary() {
        return this.invaders.some((invader) => invader.position.x <= 0);
    }

    // Retorna um invasor aleatório (usado para fazer tiros ou ações de inimigos aleatórios)
    getRandomInvader() {
        const index = Math.floor(Math.random() * this.invaders.length);
        return this.invaders[index];
    }

    // Reinicia o grid criando novos invasores e resetando a direção para a direita
    restart() {
        this.invaders = this.init();
        this.direction = "right";
    }
}

export default Grid;
