class SoundEffects {
    constructor() {
        // Arrays com múltiplas instâncias do mesmo som de tiro para evitar delays ou travamentos ao tocar repetidamente
        this.shootSounds = [
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
            new Audio("src/assets/audios/shoot.mp3"),
        ];

        // Mesmo esquema para os sons de acerto (hit)
        this.hitSounds = [
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
            new Audio("src/assets/audios/hit.mp3"),
        ];

        // Som único para explosão
        this.explosionSound = new Audio("src/assets/audios/explosion.mp3");
        // Som para avançar de nível
        this.nextLevelSound = new Audio("src/assets/audios/next_level.mp3");

        // Índices para controlar qual som tocar em sequência para tiros e acertos
        this.currentShootSound = 0;
        this.currentHitSound = 0;

        // Ajusta volumes dos sons para níveis apropriados
        this.adjustVolumes();
    }

    // Toca o som de tiro, reinicia o áudio para evitar delay e troca para o próximo som na lista (efeito de sobreposição)
    playShootSound() {
        this.shootSounds[this.currentShootSound].currentTime = 0;
        this.shootSounds[this.currentShootSound].play();
        this.currentShootSound =
            (this.currentShootSound + 1) % this.shootSounds.length;
    }

    // Toca som de acerto (hit) com o mesmo esquema do tiro
    playHitSound() {
        this.hitSounds[this.currentHitSound].currentTime = 0;
        this.hitSounds[this.currentHitSound].play();
        this.currentHitSound = (this.currentHitSound + 1) % this.hitSounds.length;
    }

    // Toca som de explosão, não usa lista pois só precisa tocar uma vez por evento
    playExplosionSound() {
        this.explosionSound.play();
    }

    // Som para indicar avanço de fase
    playNextLevelSound() {
        this.nextLevelSound.play();
    }

    // Define volumes individuais para cada tipo de som
    adjustVolumes() {
        this.hitSounds.forEach((sound) => (sound.volume = 0.2));
        this.shootSounds.forEach((sound) => (sound.volume = 0.5));
        this.explosionSound.volume = 0.2;
        this.nextLevelSound.volume = 0.4;
    }
}

export default SoundEffects;
