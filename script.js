window.addEventListener('load', function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1600;
    canvas.height = 500;

    class InputHandler{
        constructor(game){
            this.game = game;

            window.addEventListener('keydown', e => {
                if(( (e.key === 'ArrowUp') || (e.key === 'ArrowDown') )&& this.game.keys.indexOf(e.key) === -1){
                    this.game.keys.push(e.key);
                }else if(e.key === ' '){
                    this.game.player.shootTop();
                }else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });

            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key)>-1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1);
                }
            })
        }
    }

    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 38;
            this.height = 19;
            this.speed = 3;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 4;
            this.img = document.getElementById('projectile');
            this.markedForDeletion = false;
        }

        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.8){
                this.markedForDeletion = true;
            }

            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }

        draw(context){
            context.drawImage(this.img, this.x, this.y);
        }
    }


    class Explosion{
        constructor(game,x,y){
            this.frameX = 0;
            this.spriteWidth= 200;
            this.spriteHeight = 200;
            this.fps = 15;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.maxFrame = 8;
            this.markedForDeletion = false;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width*0,5;
            this.y = y - this.height*0.5;


        }
        update(deltaTime){
                if(this.timer < this.interval){
                    this.frameX++;
                    this.timer = 0;

                }else{
                    this.timer == deltaTime
                }
                if(this.frameX > this.maxFrame){
                        this.markedForDeletion = true;
                }
        }

        draw(context){
            context.drawImage(
                this.image,
                this.frameX*this.spriteWidth, 0,
                this.spriteWidth, this.spriteHeight,
                this.x,this.y,this.width,this.height
            );
        }
    }

    class SmokeExplosion extends Explosion{
        constructor(game, x,y){
            super(game,x,y);
            this.image = document.getElementById("smokeExplosion");
        }
    }

    class FireExplosion extends Explosion{
        constructor(game, x,y){
            super(game,x,y);
            this.image = document.getElementById("fireExplosion");
        }
    }
    class SoundController{
        constructor(){
            this.powerUpSound =document.getElementById('powerup');
            this.powerDownSound =document.getElementById('powerdown');
            this.explosionSound =document.getElementById('explosion');
            this.shotSound =document.getElementById('shot');
            this.hitSound =document.getElementById('hit');
            this.shieldSound =document.getElementById('shieldSound');
            this.musicSound =document.getElementById('music');
        }
        powerUp(){this.powerUpSound.play();}
        powerDown(){this.powerDownSound.play();}
        explosion(){this.explosionSound.play();}
        shot(){this.shotSound.play();}
        hit(){this.hitSound.play();}
        shield(){this.shieldSound.play();}
        music(){this.musicSound.play();}

    }
    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 1;
            this.projectiles = [];
            this.img = document.getElementById('player');
            this.shot = document.getElementById('shot');
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.powerUp = false;
            this.powerTimer = 0;
            this.powerLimit = 10000;
        }

        update(deltaTime){
            if(this.game.keys.includes('ArrowUp')){
                this.speedY = -this.maxSpeed;
            }else if(this.game.keys.includes('ArrowDown')){
                this.speedY = this.maxSpeed;
            }else{
                this.speedY = 0;
            }
            this.y += this.speedY;

            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
            
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;

            if(this.powerUp){
                if(this.powerTimer > this.powerLimit){
                    this.game.sound.powerDown();
                    this.powerTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                }else {
                    this.powerTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.1;
                }
            }
        }

        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            })
            context.drawImage(
                this.img, this.frameX * this.width, this.frameY * this.height,
                this.width, this.height, this.x, this.y, this.width, this.height
            );
        }

        shootTop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.sound.shot();
                this.game.ammo--;
            }
            if(this.powerUp) this.shootBottom();
        }

        shootBottom(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
            }
        }

        enterPowerUp(){
            this.game.sound.powerUp();
            this.powerTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }

    class Particles {
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6.3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0.2;
            this.bounced = 0;
            this.bottomBouncedBoudary = Math.random() * 80 + 60;
        }

        update(){
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;

            if(this.y > this.game.height + this.size || this.x < 0 - this.size){
                this.markedForDeletion = true;
            }
            if(this.y > this.game.height - this.bottomBouncedBoudary && this.bounced < 2){
                this.bounced++;
                this.speedY *= -0.9;
            }
        }

        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, 
                this.frameY * this.spriteSize, this.spriteSize, this.spriteSize,
                this.size * -0.5, this.size * -0.5,
                this.size, this.size);
            context.restore();
        }
    }

    class Enemy {
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * - 1.5 - 0.5;
            this.markedForDeletion = false;
            this.lives = 3;
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update(){
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0){
                this.markedForDeletion = true;
            };
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }else {
                this.frameX = 0;
            }
        }

        draw(context){
            if(this.game.debug){
                context.strokeRect(this.x, this.y, this.width, this.height);
                context.font = '27px Bangers';
                context.fillText(this.lives, this.x, this.y);
            }
            context.drawImage(
                this.image,
                this.frameX * this.width,
                this.frameY * this.height,
                this.width, this.height,
                this.x, this.y,
                this.width, this.height
            )
        }
    }
    
    class Angler1 extends Enemy {
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 2
        }
    }

    class Angler2 extends Enemy {
        constructor(game){
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
        }
    }

    class Lucky extends Enemy {
        constructor(game){
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 5;
            this.score = 8;
            this.type = 'luck';
        }
    }
    class MoonFish extends Enemy{
        constructor(game){
            super(game);
            this.width =227;
            this.height =250;
            this.lives =7;
            this.y =Math.random()*(this.game.height*0.9-this.height);
            this.image =document.getElementById('moonfish');
            this.frameY =0;this.score =this.lives*2;
            this.speedX =Math.random()*-1.2-2;this.type ='moon';
                            }
        }
    class HiveWhale extends Enemy {
        constructor(game){
            super(game);
            this.width = 400;
            this.height = 227;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('hivewhale');
            this.frameY = 0;
            this.lives = 15;
            this.score = this.lives;
            this.type = 'hivewhale';
            this.speedX = Math.random()*-0.5;

        }
    }


    class BulbWhale extends Enemy {
        constructor(game){
            super(game);
            this.width = 270;
            this.height = 219;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('bulbwhale');
            this.frameY = 0;
            this.lives = 5;
            this.score = this.lives;
            this.type = 'bulbwhale';
            this.speedX = Math.random()*-0.5;

        }
    }

    class Drone extends Enemy {
        constructor(game,x,y){
            super(game);
            this.width = 115;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 2;
            this.x = x;
            this. y = y;
            this.score = this.lives;
            this.speedX = Math.random()*-4.2-0.5;

        }
    }

    class Layer {
        constructor(game, image, speedModify){
            this.game = game;
            this.image = image;
            this.speedModify = speedModify;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update(){
            if(this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModify;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y)
        }
    }

    class Background {
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.3);
            this.layer2 = new Layer(this.game, this.image2, 0.5);
            this.layer3 = new Layer(this.game, this.image3, 1.3);
            this.layer4 = new Layer(this.game, this.image4, 1.8);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer => layer.update());
        }

        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 60;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }

        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            
            context.font = this.fontSize; + 'px ' + this.fontFamily;
            context.fillText('Score: ' + this.game.score, 20, 40);

            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formattedTime, 550, 40);
        
            if(this.game.gameOver){
                context.textAlign = 'center';
                let msg1;
                let msg2;

                if(this.game.score > this.game.winningScore){
                    msg1 = '¡Mission Acomplished!'
                    msg2 = "Play Again?"
                }else {
                    msg1 = '¡Mission Failed!';
                    msg2 = 'Try Again?';
                }
                context.font = '60px ' + this.fontFamily;
                context.fillText(msg1, this.game.width * 0.5, this.game.height * 0.5 - 20);
                context.font = '60px ' + this.fontFamily;
                context.fillText(msg2, this.game.width * 0.5, this.game.height * 0.5 + 20);
            }

            if(this.game.player.powerUp){
                context.fillStyle = 'yellow'
            }

            for(let i=0; i<this.game.ammo; i++){
                context.fillRect(20 + i * 6 + 3, 50, 3, 20);
            }

            context.restore();
        }
    }

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.background = new Background(this);
            this.keys = [];
            this.particles = [];
            this.ammo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 600;
            this.maxAmmo = 50;
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 200;
            this.gameTime = 0;
            this.timeLimit = 40000;
            this.speed = 1;
            this.debug = true;
            this.explosions = [];
            this.sound = new SoundController();
            
        }

        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo){
                    this.ammo++;
                    this.ammoTimer = 0;
                }
            }else{
                this.ammoTimer += deltaTime;
            }

            this.particles.forEach(particle => particle.update());
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);

            this.explosions.forEach(explosion => explosion.update());
            this.explosions = this.explosions.filter(explosion => !explosion.markedForDeletion);
            
            this.enemies.forEach(enemy => {
                enemy.update();
                if(this.checkCollision(this.player, enemy)){
                    this.sound.hit();
                    enemy.markedForDeletion = true;
                    console.log(enemy.type);
                    if(enemy.type === 'luck'){
                        this.player.enterPowerUp();
                    }else {
                        this.score--;
                    }
                }

                this.player.projectiles.forEach(projectile => {
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.markedForDeletion = true;
                        if(enemy.lives <= 0){
                            enemy.markedForDeletion = true;
                            this.addExplosion(enemy);
                            this.sound.explosion();
                            if(enemy.type ==='moon') this.player.enterPowerUp();

                            if(enemy.type === "hivewhale"){
                                this.enemies.push(new Drone(this,enemy.x, enemy.y ));
                            }
                            this.particles.push(new Particles(
                                this,
                                enemy.x + enemy.width * 0.5,
                                enemy.y + enemy.height * 0.5
                            ));
                            if(!this.gameOver) this.score += enemy.score;
                            if(this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            })

            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver){
                this.addEnemy();
                this.enemyTimer = 0;
            }else {
                this.enemyTimer += deltaTime;
            }
        }

        draw(context){
            this.sound.music();
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            })
            this.ui.draw(context);
            this.particles.forEach(particle => particle.draw(context));

            this.explosions.forEach(explosion => explosion.draw(context));
            this.background.layer4.draw(context);
        }

        checkCollision(rect1, rect2){
            return (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width >
                rect2.x && rect1.y + rect2.y + rect2.height && rect1.height + rect1.y
                > rect2.y
            )
        }

        addEnemy(){
            const randomize = Math.random();
            if(randomize < 0.3) this.enemies.push(new Angler1(this));
            else if(randomize < 0.6) this.enemies.push(new Angler2(this));
            else if(randomize < 0.7) this.enemies.push(new BulbWhale(this));
            else if(randomize < 0.8) this.enemies.push(new HiveWhale(this));
            else if(randomize < 0.9) this.enemies.push(new MoonFish(this));
            else this.enemies.push(new Lucky(this));
        }

        addExplosion(enemy){
            const randomize = Math.random();
            if(randomize < 0.5) this.explosions.push(new SmokeExplosion(this,enemy.x,enemy.y));
            else  this.explosions.push(new FireExplosion(this,enemy.x,enemy.y));

        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp-lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});