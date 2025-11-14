function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}

function createEnemies(ctx, canvas, enemyImg) {
    const MONSTER_TOTAL = 5;
    const MONSTER_WIDTH = MONSTER_TOTAL * enemyImg.width;
    const START_X = (canvas.width - MONSTER_WIDTH) / 2;
    const STOP_X = START_X + MONSTER_WIDTH;
    for (let x = START_X; x < STOP_X; x += enemyImg.width) {
        for (let y = 0; y < enemyImg.height * 5; y += enemyImg.height) {
            ctx.drawImage(enemyImg, x, y);
        }
    }
}

function createEnemies2(ctx, canvas, enemyImg) {
    const MAX_ROWS = 5;
    const TOTAL_WIDTH = 5 * enemyImg.width; 

    for (let row = 0; row < MAX_ROWS; row++) {
        const MONSTER_COUNT = MAX_ROWS - row; 
        const ROW_WIDTH = MONSTER_COUNT * enemyImg.width;
        const START_X = (canvas.width - ROW_WIDTH) / 2;
        const currentY = row * enemyImg.height;

        for (let x = 0; x < MONSTER_COUNT; x++) {
            const drawX = START_X + (x * enemyImg.width);
            ctx.drawImage(enemyImg, drawX, currentY);
        }
    }
}


window.onload = async() => {
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    const heroImg = await loadTexture('assets/player.png');
    const enemyImg = await loadTexture('assets/enemyShip.png');
    const playerLeftImg = await loadTexture('assets/png/playerLeft.png');
    const playerRightImg = await loadTexture('assets/png/playerRight.png');
    const backgroundImg = await loadTexture('assets/png/Background/starBackground.png');

    const pattern = ctx.createPattern(backgroundImg, 'repeat'); 
    ctx.fillStyle = pattern; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const playerX = canvas.width / 2 - heroImg.width / 2;
    const playerY = canvas.height - (canvas.height / 4);
    const scaledWidth = playerLeftImg.width * 0.8;
    const scaledHeight = playerLeftImg.height * 0.8;
    const shipSpacing = 10;
    const shipOffset = 20;
    ctx.drawImage(heroImg, playerX, playerY);

    ctx.drawImage(
        playerLeftImg,
        playerX - playerLeftImg.width - shipSpacing,
        playerY - shipOffset,
        scaledWidth,
        scaledHeight
    );
    ctx.drawImage(
        playerRightImg, 
        playerX + heroImg.width + shipSpacing,
        playerY - shipOffset,
        scaledWidth,
        scaledHeight
    );
    
    createEnemies2(ctx, canvas, enemyImg);    
};

