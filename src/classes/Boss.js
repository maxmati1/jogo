import { PATH_BOSS_IMAGE } from "../utils/constants.js";

class Boss {
    constructor(canvasWidth, canvasHeight) {
        this.width = 160;
        this.height = 100;
        this.position = {
            x: canvasWidth / 2 - this.width / 2,
            y: 60
        };
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.velocityX = 1;
        this.velocityY = 0;
        this.image = this.getImage(PATH_BOSS_IMAGE);
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
        this.hp = 40;
        this.alive = true;
    }

    getImage(path) {
        const image = new Image();
        image.src = path;
        return image;
    }

    moveRight() {
        this.position.x += this.velocityX;
    }

    moveLeft() {
        this.position.x -= this.velocityX;
    }

    moveDown() {
        this.position.y += this.height;
    }

    incrementVelocity(boost) {
        this.velocityX += boost;
    }

    update() {
        if (!this.alive) return;

        this.position.x += this.velocityX;

        // Faz o boss "quicar" nas laterais e descer igual aos invaders
        if (this.position.x <= 0 || this.position.x + this.width >= this.canvasWidth) {
            this.velocityX *= -1;
            this.moveDown();
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        if (this.image.complete && this.image.naturalWidth !== 0) {
            ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.fillStyle = "white";
            ctx.font = "bold 20px Arial";
            ctx.fillText("BOSS", this.position.x + 40, this.position.y + 55);
        }
    }

    hit(projectile) {
        return (
            projectile.position.x + projectile.width >= this.position.x &&
            projectile.position.x <= this.position.x + this.width &&
            projectile.position.y <= this.position.y + this.height &&
            projectile.position.y + projectile.height >= this.position.y
        );
    }

    takeDamage() {
        this.hp--;
        if (this.hp <= 0) {
            this.alive = false;
        }
    }
}

export default Boss;