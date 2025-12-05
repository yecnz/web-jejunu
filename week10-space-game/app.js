const Messages = {
    KEY_EVENT_UP: "KEY_EVENT_UP",
    KEY_EVENT_DOWN: "KEY_EVENT_DOWN",
    KEY_EVENT_LEFT: "KEY_EVENT_LEFT",
    KEY_EVENT_RIGHT: "KEY_EVENT_RIGHT",
    KEY_EVENT_SPACE: "KEY_EVENT_SPACE",
    COLLISION_ENEMY_LASER: "COLLISION_ENEMY_LASER",
    COLLISION_ENEMY_HERO: "COLLISION_ENEMY_HERO",
    GAME_END_LOSS: "GAME_END_LOSS",
    GAME_END_WIN: "GAME_END_WIN",
    KEY_EVENT_ENTER: "KEY_EVENT_ENTER",
    NEXT_STAGE: "NEXT_STAGE"
};

let heroImg, playerLeftImg, playerRightImg;
let enemyImg;
let laserRedImg, laserGreenImg;
let laserRedShotImg, laserGreenShotImg;
let backgroundImg;
let lifeImg;
let bossImg;

let canvas, ctx;
let gameObjects = [];
let hero;
let eventEmitter;
let gameLoopId;
let stage = 1;

class EventEmitter {
    constructor() { this.listeners = {}; }
    on(message, listener) {
        if (!this.listeners[message]) this.listeners[message] = [];
        this.listeners[message].push(listener);
    }
    emit(message, payload = null) {
        if (this.listeners[message]) this.listeners[message].forEach((l) => l(message, payload));
    }
    clear() {
        this.listeners = {};
    }
}

class GameObject {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dead = false;
        this.type = "";
        this.width = 0;
        this.height = 0;
        this.img = undefined;
        this.color = "white";
    }

    rectFromGameObject() {
        return {
            top: this.y,
            left: this.x,
            bottom: this.y + this.height,
            right: this.x + this.width,
        };
    }

    draw(ctx) {
        if (this.img && this.img.complete && this.img.naturalWidth !== 0) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Hero extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 99;
        this.height = 75;
        this.type = 'Hero';
        this.color = "#00FF00";
        this.cooldown = 0;
        this.life = 3;
        this.points = 0;

        if(this.sidekickInterval) clearInterval(this.sidekickInterval);
        this.sidekickInterval = setInterval(() => {
            if (!this.dead) this.fireSidekicks();
        }, 600);
    }

    fire() {
        if (this.canFire()) {
            const l = new Laser(this.x + 45, this.y - 10, laserRedImg, laserRedShotImg);
            gameObjects.push(l);
            this.cooldown = 500;
            let id = setInterval(() => {
                if (this.cooldown > 0) this.cooldown -= 100;
                else clearInterval(id);
            }, 100);
        }
    }

    fireSidekicks() {
        const l1 = new Laser(this.x, this.y + 20, laserGreenImg, laserGreenShotImg);
        l1.width = 5; l1.height = 15;
        const l2 = new Laser(this.x + this.width - 5, this.y + 20, laserGreenImg, laserGreenShotImg);
        l2.width = 5; l2.height = 15;
        gameObjects.push(l1, l2);
    }

    canFire() { return this.cooldown === 0; }

    decrementLife() {
        this.life--;
        if (this.life === 0) {
            this.dead = true;
            clearInterval(this.sidekickInterval);
        }
    }

    incrementPoints(amount = 100) {
        this.points += amount;
    }

    draw(ctx) {
        super.draw(ctx);
        const sideWidth = 40;
        const sideHeight = 40;
        if (playerLeftImg && playerLeftImg.complete && playerLeftImg.naturalWidth !== 0) 
            ctx.drawImage(playerLeftImg, this.x - 40, this.y + 20, sideWidth, sideHeight);
        
        if (playerRightImg && playerRightImg.complete && playerRightImg.naturalWidth !== 0)
            ctx.drawImage(playerRightImg, this.x + this.width + 5, this.y + 20, sideWidth, sideHeight);
    }
}

class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        this.width = 98;
        this.height = 50;
        this.type = "Enemy";
        this.color = "red";
        this.hp = 1;

        let speed = stage === 2 ? 8 : 5; 

        this.moveInterval = setInterval(() => {
            if (!this.dead && this.y < canvas.height - this.height) {
                this.y += speed;
            } else {
                clearInterval(this.moveInterval);
            }
        }, 300);
    }

    takeDamage() {
        this.hp--;
        if (this.hp <= 0) this.dead = true;
    }
}

class Boss extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.width = 200;
        this.height = 120;
        this.type = "Enemy";
        this.img = bossImg;
        this.color = "purple";
        this.hp = 50;
        this.maxHp = 50;
        this.direction = 1;

        clearInterval(this.moveInterval);
        
        this.moveInterval = setInterval(() => {
            if (!this.dead) {
                this.x += 5 * this.direction;
                this.y += 0.5;
                
                if (this.x + this.width > canvas.width || this.x < 0) {
                    this.direction *= -1;
                    this.y += 20;
                }

                if (this.y + this.height >= canvas.height) {
                    eventEmitter.emit(Messages.GAME_END_LOSS);
                    this.dead = true;
                }
            } else {
                clearInterval(this.moveInterval);
            }
        }, 30);
    }
    
    draw(ctx) {
        super.draw(ctx);
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y - 20, this.width, 10);
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(this.x, this.y - 20, this.width * (this.hp / this.maxHp), 10);
    }
}

class Laser extends GameObject {
    constructor(x, y, img, explosionImg) {
        super(x, y);
        this.width = 9;
        this.height = 33;
        this.type = 'Laser';
        this.color = "yellow";
        this.img = img;
        this.explosionImg = explosionImg;

        let id = setInterval(() => {
            if (this.y > 0) {
                this.y -= 15;
            } else {
                this.dead = true;
                clearInterval(id);
            }
        }, 100);
    }
}

class Explosion extends GameObject {
    constructor(x, y, img) {
        super(x, y);
        this.width = 56;
        this.height = 56;
        this.type = "Explosion";
        this.img = img;
        this.color = "orange";
        setTimeout(() => {
            this.dead = true;
        }, 200);
    }
}

function loadTexture(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => {
            resolve(img);
        };
    });
}

function intersectRect(r1, r2) {
    return !(r2.left > r1.right || r2.right < r1.left || r2.top > r1.bottom || r2.bottom < r1.top);
}

function createEnemies() {
    if (stage === 1) {
        const MONSTER_TOTAL = 5;
        const MONSTER_WIDTH = MONSTER_TOTAL * 98;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        for (let x = START_X; x < START_X + MONSTER_WIDTH; x += 98) {
            for (let y = 0; y < 50 * 5; y += 50) {
                const enemy = new Enemy(x, y);
                enemy.img = enemyImg;
                gameObjects.push(enemy);
            }
        }
    } else if (stage === 2) {
        const MONSTER_TOTAL = 8;
        const MONSTER_WIDTH = MONSTER_TOTAL * 80;
        const START_X = (canvas.width - MONSTER_WIDTH) / 2;
        for (let x = START_X; x < START_X + MONSTER_WIDTH; x += 80) {
            for (let y = 0; y < 50 * 6; y += 50) {
                const enemy = new Enemy(x, y);
                enemy.width = 70;
                enemy.img = enemyImg;
                gameObjects.push(enemy);
            }
        }
    } else if (stage === 3) {
        const boss = new Boss(canvas.width / 2 - 100, 50);
        gameObjects.push(boss);
    }
}

function createHero() {
    hero = new Hero(canvas.width / 2 - 45, canvas.height - canvas.height / 4);
    hero.img = heroImg;
    gameObjects.push(hero);
}

function updateGameObjects() {
    const enemies = gameObjects.filter(go => go.type === 'Enemy');
    const lasers = gameObjects.filter(go => go.type === 'Laser');

    lasers.forEach((l) => {
        enemies.forEach((m) => {
            if (intersectRect(l.rectFromGameObject(), m.rectFromGameObject())) {
                eventEmitter.emit(Messages.COLLISION_ENEMY_LASER, { first: l, second: m });
            }
        });
    });

    enemies.forEach(enemy => {
        const heroRect = hero.rectFromGameObject();
        if (intersectRect(heroRect, enemy.rectFromGameObject())) {
            eventEmitter.emit(Messages.COLLISION_ENEMY_HERO, { enemy });
        }
    });

    gameObjects = gameObjects.filter(go => !go.dead);
}

function drawGameObjects(ctx) {
    gameObjects.forEach((go) => go.draw(ctx));
}

function drawLife() {
    const START_POS = canvas.width - 180;
    for (let i = 0; i < hero.life; i++) {
        if (lifeImg && lifeImg.complete && lifeImg.naturalWidth !== 0) {
            ctx.drawImage(lifeImg, START_POS + (45 * (i + 1)), canvas.height - 37);
        } else {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(START_POS + (45 * (i + 1)) + 15, canvas.height - 25, 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function drawPointsAndStage() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("Points: " + hero.points, 10, canvas.height - 20);
    
    ctx.textAlign = "center";
    ctx.fillText("Stage: " + stage, canvas.width / 2, 40);
}

function displayMessage(message, color = "red", subMessage = "") {
    ctx.font = "50px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    if(subMessage) {
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(subMessage, canvas.width / 2, canvas.height / 2 + 50);
    }
}

function endGame(win) {
    clearInterval(gameLoopId);
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (win) {
            displayMessage("Victory!!! Pew Pew...", "green", " - Press [Enter] to start a new game Captain Pew Pew","green");
        } else {
            displayMessage("You died!!!", "red", "Press [Enter] to start a new game Captin Pew Pew");
        }
    }, 200);
}

function nextStage() {
    clearInterval(gameLoopId);
    stage++;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    displayMessage("STAGE " + (stage-1) + " CLEARED!", "yellow", "Starting Stage " + stage + "...");

    setTimeout(() => {
        gameObjects = gameObjects.filter(go => go.type === 'Hero' || go.type === 'Laser');
        
        hero.x = canvas.width / 2 - 45;
        hero.y = canvas.height - canvas.height / 4;

        createEnemies();
        
        startGameLoop();
    }, 2000);
}

function startGameLoop() {
    if (gameLoopId) clearInterval(gameLoopId);
    gameLoopId = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (backgroundImg && backgroundImg.complete && backgroundImg.naturalWidth !== 0) {
            const pattern = ctx.createPattern(backgroundImg, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        drawPointsAndStage();
        drawLife();
        drawGameObjects(ctx);
        updateGameObjects();
    }, 50);
}

function resetGame() {
    if (gameLoopId) {
        clearInterval(gameLoopId);
    }
    stage = 1;
    eventEmitter.clear();
    initGame();
    startGameLoop();
}

function isHeroDead() {
    return hero.life <= 0;
}

function isEnemiesDead() {
    const enemies = gameObjects.filter((go) => go.type === "Enemy" && !go.dead);
    return enemies.length === 0;
}

function initGame() {
    gameObjects = [];
    createEnemies();
    createHero();

    eventEmitter = new EventEmitter();

    eventEmitter.on(Messages.KEY_EVENT_UP, () => { hero.y -= 20; });
    eventEmitter.on(Messages.KEY_EVENT_DOWN, () => { hero.y += 20; });
    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => { hero.x -= 20; });
    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => { hero.x += 20; });
    eventEmitter.on(Messages.KEY_EVENT_SPACE, () => { if (hero.canFire()) hero.fire(); });
    eventEmitter.on(Messages.KEY_EVENT_ENTER, () => { resetGame(); });

    eventEmitter.on(Messages.COLLISION_ENEMY_LASER, (_, { first, second }) => {
        first.dead = true;
        
        second.takeDamage();
        
        if (second.dead) {
            hero.incrementPoints(second instanceof Boss ? 1000 : 100);
            
            const explosion = new Explosion(second.x, second.y, first.explosionImg);
            gameObjects.push(explosion);

            if (isEnemiesDead()) {
                if (stage < 3) {
                    nextStage();
                } else {
                    eventEmitter.emit(Messages.GAME_END_WIN);
                }
            }
        }
    });

    eventEmitter.on(Messages.COLLISION_ENEMY_HERO, (_, { enemy }) => {
        enemy.takeDamage();
        hero.decrementLife();
        
        if (isHeroDead()) {
            eventEmitter.emit(Messages.GAME_END_LOSS);
        } else if (isEnemiesDead()) {
             if (stage < 3) {
                nextStage();
            } else {
                eventEmitter.emit(Messages.GAME_END_WIN);
            }
        }
    });

    eventEmitter.on(Messages.GAME_END_WIN, () => { endGame(true); });
    eventEmitter.on(Messages.GAME_END_LOSS, () => { endGame(false); });
}

window.addEventListener('keydown', (e) => {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
});

window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowUp") eventEmitter.emit(Messages.KEY_EVENT_UP);
    else if (evt.key === "ArrowDown") eventEmitter.emit(Messages.KEY_EVENT_DOWN);
    else if (evt.key === "ArrowLeft") eventEmitter.emit(Messages.KEY_EVENT_LEFT);
    else if (evt.key === "ArrowRight") eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
    else if (evt.keyCode === 32) eventEmitter.emit(Messages.KEY_EVENT_SPACE);
    else if (evt.key === "Enter") eventEmitter.emit(Messages.KEY_EVENT_ENTER);
});

window.onload = async () => {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");

    heroImg = await loadTexture('assets/player.png');
    enemyImg = await loadTexture('assets/enemyShip.png');
    laserRedImg = await loadTexture('assets/laserRed.png');
    
    playerLeftImg = await loadTexture('assets/png/playerLeft.png');
    playerRightImg = await loadTexture('assets/png/playerRight.png');
    laserGreenImg = await loadTexture('assets/png/laserGreen.png');
    laserRedShotImg = await loadTexture('assets/png/laserRedShot.png');
    laserGreenShotImg = await loadTexture('assets/png/laserGreenShot.png');
    
    backgroundImg = await loadTexture('assets/png/Background/starBackground.png');
    lifeImg = await loadTexture('assets/png/life.png');
    bossImg = await loadTexture('assets/png/enemyUFO.png');

    initGame();
    startGameLoop();
};