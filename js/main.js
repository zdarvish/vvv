'use strict';

/***************
    SOUNDS
*/

let sound = false;
/*
const soundImg = document.getElementById('soundImg');
if (localStorage.getItem('sound') !== null && localStorage.getItem('sound') === 'false') {
    soundImg.src = './images/sound-off.svg';
    sound = false;
}
*/
const musicBG = new Audio();
const se1 = new Audio();
const se2 = new Audio();
/*
function changeSoundPlay() {
    if (sound) {
        soundImg.src = './images/sound-off.svg';
        sound = false;
        musicBG.pause();
    } else {
        soundImg.src = './images/sound-on.svg';
        sound = true;
        musicBG.play();
    }
    localStorage.setItem('sound', sound);
}
*/
function playSound1(sound) {
    se1.src = './src/snd/se-'+ sound +'.mp3';
    se1.play();
}

function playSound2(sound) {
    se2.src = './src/snd/se-'+ sound +'.mp3';
    se2.play();
}

const musicArr = ['bg-music', 'bg-music'];
let nowPlayMusic = 0;

function playMusic() {
    musicBG.src = './src/snd/' + musicArr[nowPlayMusic] + '.mp3';
    nowPlayMusic++;
    if (nowPlayMusic === musicArr.length) nowPlayMusic = 0;
    musicBG.addEventListener('ended', playMusic);
}

playMusic();

//////////////////////////////////////////////////////////////////

/***************
    CANVAS
*/

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const C_WIDTH = canvas.width = 1200;
const C_HEIGHT = canvas.height = 600;

/***************
    SCORES
*/

let scores = 0;
let scoresStep = 100;
let scoresCheckpoint = scores + scoresStep;

ctx.font = "bold 30px sans-serif";
ctx.textAlign = 'right';
const textX = C_WIDTH - 60;
const textY = 60;

/***************
    BIRDS
*/
const bird = new Image();
bird.src = './src/img/bird.png';
bird.w = 110; // frame width
bird.h = 90; // frame height
bird.f = 9; // frame numbers [0...9]
/* tu fly from right frame height = 90
   tu fly from left frame height = 0 */

class Bird {
    // fromLeft: true/false; speed: Number; size: Number;
    constructor (fromLeft, speed, frS, size, scores) {
        this.frH = (fromLeft) ? 0 : bird.h;
        this.frS = frS; // Math.ceil(30 / speed); // more speed -> more frame change
        this.fr = 0; // current frame
        this.x = (fromLeft) ? 0 - bird.w : C_WIDTH + bird.w;
        this.y = bird.h + Math.floor(Math.random() * (C_HEIGHT - bird.h * 3));
        this.cw = Math.ceil(bird.w * size);
        this.ch = Math.ceil(bird.h * size);
        this.speed = Math.ceil(speed / 4);
        this.scores = scores;// Math.ceil(speed / size);
        this.fromLeft = fromLeft;
        this.size = size;
        // shut points area
        this.spx = Math.ceil(34 * size);
        this.spy = Math.ceil(38 * size);
        this.spw = Math.ceil((34 + 42) * size);
        this.sph = Math.ceil((38 + 18) * size);
    }

    fly(frame) {

        ctx.drawImage(
            bird,
            this.fr * bird.w, this.frH, bird.w, bird.h,
            this.x, this.y, this.cw, this.ch
        );

        if (this.fromLeft) this.x += this.speed;
        else this.x -= this.speed;

        if (frame % this.frS === 0) {
            if (this.fr < bird.f) this.fr++;
            else this.fr = 0;

            if (this.x > canvas.width && this.fromLeft) this.speed = 0;
            if (this.x < (0 - this.cw) && !this.fromLeft) this.speed = 0;
        }
    }

    shut() {
        // this.spx this.spy this.spw this.sph mouseX  mouseY
        if (mouseX > (this.spx + this.x) && mouseX < (this.spw + this.x)) {
            if (mouseY > (this.spy + this.y) && mouseY < (this.sph + this.y)) {

                createFeathers(this.size, this.x, this.y);

                this.speed = 0;
                if (this.fromLeft) this.x = canvas.width + this.cw;
                else this.x = 0 - this.cw;
                playSound2('riven');
                scores += this.scores;
            }
        }

    }
}

let birds = [];
let MAX_BIRDS = 10;

const birdGeneratorArr = [
    { size: 1,   speed: 30, frS: 2, scores: 10 }, // 30
    { size: 1,   speed: 24, frS: 3, scores: 8 },  // 24
    { size: 1,   speed: 18, frS: 4, scores: 6 },  // 18
    { size: 1,   speed: 15, frS: 5, scores: 5 },  // 15
    { size: 1,   speed: 12, frS: 6, scores: 4 },  // 12

    { size: 0.6, speed: 18, frS: 2, scores: 17 }, // 50
    { size: 0.6, speed: 15, frS: 3, scores: 14 }, // 42
    { size: 0.6, speed: 12, frS: 4, scores: 11 },  // 33.3
    { size: 0.6, speed:  9, frS: 5, scores: 8 },  // 25
    { size: 0.6, speed:  7, frS: 6, scores: 6 },  // 19.4

    { size: 0.3, speed: 12, frS: 2, scores: 44 }, // 133.3
    { size: 0.3, speed:  9, frS: 3, scores: 33 }, // 100
    { size: 0.3, speed:  7, frS: 4, scores: 26 }, // 77.7
    { size: 0.3, speed:  5, frS: 5, scores: 19 }, // 55.5
    { size: 0.3, speed:  4, frS: 6, scores: 15 }  // 44.4
];
birdGeneratorArr.sort(() => Math.random() - 0.5);

let birdGeneratorIndex = 0;

const newBirdTimeout = 1500;
setTimeout(initBirds, newBirdTimeout);

function initBirds () {
    // clear birds arr from unused birds
    birds = birds.filter(bird => bird.speed > 0);

    if (birds.length < MAX_BIRDS) {
        let fromLeft = (Math.random() > 0.5) ? true : false;
        let newBird = birdGeneratorArr[birdGeneratorIndex];
        birdGeneratorIndex++;
        if(birdGeneratorIndex === birdGeneratorArr.length) {
            birdGeneratorIndex = 0;
            birdGeneratorArr.sort(() => Math.random() - 0.5);
        }

        let bird = new Bird(fromLeft, newBird.speed, newBird.frS, newBird.size, newBird.scores);
        birds.push(bird);
    }

    setTimeout(initBirds, newBirdTimeout);
}

/***************
    GUN
*/

const sight = new Image();
sight.src = './src/img/sightRifle.png';
sight.w = 100; // frame width
sight.h = 100; // frame height
sight.f = 36; // frame numbers [0]
sight.fr = 0;

const gun = new Image();
gun.src = './src/img/rifle.png';
gun.w = 330;
gun.h = 250;

gun.stepY = gun.h / C_HEIGHT;
gun.reloadY = C_HEIGHT;
gun.reloadSteps = Math.ceil(sight.f / 4);
gun.reloadStepSize;

gun.ready = false;

function gunReloaded() {

    if (bullets.fr < 1) sight.fr = sight.f;
    else if (sight.fr > 0) sight.fr--;
    else gun.ready = true;
}

/***************
    BULLETS
*/

const bullets = new Image();
bullets.src = './src/img/shuts24.png';
bullets.w = 500; // frame width
bullets.h = 50; // frame height
bullets.f = 24; // frame numbers [0]
bullets.fr = 24; // shuts

/***************
    PARACHUTE
*/

let parachutes = [];

const parachute = new Image();
parachute.src = './src/img/parachute.png';
parachute.w = 120; // frame width
parachute.h = 150; // frame height

class Parachute {
    // fromLeft: true/false; speed: Number; size: Number;
    constructor (size, getBonus) {
        this.x = parachute.w + Math.floor(Math.random() * (C_WIDTH - parachute.w * 2));
        this.y = 0 - parachute.h;
        this.cw = Math.ceil(parachute.w * size);
        this.ch = Math.ceil(parachute.h * size);
        this.speed = Math.ceil(1 * size);
        // shut points area
        this.spx = Math.ceil(40 * size);
        this.spy = Math.ceil(108 * size);
        this.spw = Math.ceil((40 + 42) * size);
        this.sph = Math.ceil((108 + 38) * size);
        //bonuses
        this.bonus = getBonus;
    }

    drop(frame) {

        ctx.drawImage(
            parachute,
            0, 0, parachute.w, parachute.h,
            this.x, this.y, this.cw, this.ch
        );

        this.y += this.speed;

        if (this.y > C_HEIGHT + parachute.h) {
            this.speed = 0;
        }
    }

    shut() {
        if (mouseX > (this.spx + this.x) && mouseX < (this.spw + this.x)) {
            if (mouseY > (this.spy + this.y) && mouseY < (this.sph + this.y)) {
                if (this.bonus === bullets) addBullets();
                this.speed = 0;
                this.y = 0 - this.ch;
                playSound2('reload');
                parachutes.filter(item => item.speed > 0);
            }
        }
    }
}

function addBullets() {
    bullets.fr = bullets.f;
    parachutes = parachutes.filter(item => item.speed > 0);
}
 
function addParachute() {
    parachutes = parachutes.filter(item => item.speed > 0);
    let parachute = new Parachute(0.5, bullets);
    parachutes.push(parachute); console.log(parachutes);
}

/***************
    FEATHERS
*/

const feathers = new Image();
feathers.src = './src/img/feathers.png';
feathers.w = 50; // frame width
feathers.h = 50; // frame height
feathers.f = 3; // frame numbers [0]
feathers.fr = 0;

class Feather {
    constructor (x, y, size, direction, speed) {
        this.fr = Math.floor(Math.random() * (feathers.f + 1)) * feathers.w;
        this.x = x;
        this.y = y;
        this.cw = Math.ceil(feathers.w * size);
        this.ch = Math.ceil(feathers.h * size);
        this.direction = direction;
        this.speed = (speed  + Math.floor(Math.random() * 21)) * size;
        this.onDrop = false;
        this.toLeft = false;
        this.maxLeft = 0; // this.x - this.cw * 2
        this.maxRight = 0; // this.x + this.cw * 2
    }

    startThrow (frame) {

        ctx.drawImage(
            feathers,
            this.fr, 0, feathers.w, feathers.h,
            this.x, this.y, this.cw, this.ch
        );

        switch (this.direction) {
            case 'NN' :
                this.y -= this.speed;
                break;
            case 'NE' :
                this.y -= this.speed * 0.7;
                this.x += this.speed * 0.7;
                break;
            case 'EE' :
                this.x += this.speed;
                break;
            case 'ES' :
                this.y += this.speed * 0.7;
                this.x += this.speed * 0.7;
                break;
            case 'SS' :
                this.y += this.speed;
                break;
            case 'SW' :
                this.y += this.speed * 0.7;
                this.x -= this.speed * 0.7;
                break;
            case 'WW' :
                this.x -= this.speed;
                break;
            case 'WN' :
                this.y -= this.speed * 0.7;
                this.x -= this.speed * 0.7;
                break; 
        }

        this.speed = this.speed * 0.7;

        if (this.speed < 1) {
            this.speed = 1;
            this.onDrop = true;
            this.toLeft = (Math.random() > 0.5) ? true : false;
            this.maxLeft = this.x - this.cw;
            this.maxRight = this.x + this.cw;
        }
    }

    drop(frame) {

        ctx.drawImage(
            feathers,
            this.fr, 0, feathers.w, feathers.h,
            this.x, this.y, this.cw, this.ch
        );

        this.y += this.speed;

        if (this.toLeft) {
            this.x--;
            if (this.x < this.maxLeft) this.toLeft = false;
        } else {
            this.x++;
            if (this.x > this.maxRight) this.toLeft = true;
        }

        if (this.y > C_HEIGHT + feathers.h) {
            this.speed = 0;
            clearDrops();
        }
    }
}

function createFeathers(size, x, y) {
    const speed = 30;
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'NN', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'NE', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'EE', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'ES', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'SS', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'SW', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'WW', speed));
    if (Math.random() > 0.3) drops.push(new Feather(x, y, size, 'WN', speed));
}

/***************
    DROPS array
*/

let drops = [];

showCLDrops();
function showCLDrops() {
    console.log(drops);
    setTimeout(showCLDrops, 2000);
}

function addInDrops (toDrop) {
    drops.push(toDrop);
}

function clearDrops() {
    drops = drops.filter(item => item.speed > 0);
}

/***************
    MOUSE LISTENER
*/

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', function(evt) {
    let mouse = getMousePos(canvas, evt);
    mouseX = mouse.x;
    mouseY = mouse.y;
}, false);

canvas.addEventListener('click', function() {
    if (!sound) {
        sound = true;
        setTimeout(() => musicBG.play(), 1000);
    }

    if (gun.ready && bullets.fr > 0) {
        bullets.fr--;
        gun.ready = false;
        sight.fr = sight.f;
        let shutSound = function () {
            switch (Math.floor(Math.random() * 5)) {
                case 0 : return 'shut-0';
                case 1 : return 'shut-1';
                case 2 : return 'shut-2';
                case 3 : return 'shut-3';
                default : return 'shut-0';
            }
        }();

        playSound1(shutSound);
        birds.forEach(bird => bird.shut());

        if (parachutes.length) parachutes.forEach(pr => pr.shut());

        if (scores >= scoresCheckpoint) {
            scoresCheckpoint = scores + scoresStep;
            addParachute();
        }
    }
}, false);

/***************
    BG img
*/

const background = new Image();
background.src = './src/img/bg.jpg';

/***************
    ANIMATION
*/

let frame = 0;

function animate() {
    ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

    ctx.drawImage(background,0,0);

    drops.forEach(item => {if (item.onDrop) item.drop(frame); else item.startThrow (frame);});

    birds.forEach(bird => bird.fly(frame));

    parachutes.forEach(item => item.drop(frame));

    ctx.fillStyle = "#FFF";
    ctx.fillText(`SCORES: ${scores}`, textX, textY);

    ctx.fillStyle = "#000";
    ctx.strokeText(`SCORES: ${scores}`, textX, textY);

    ctx.drawImage(bullets, 0, bullets.fr * bullets.h, bullets.w, bullets.h, 20, 20, bullets.w, bullets.h);

    ctx.drawImage(gun, 0, 0, gun.w, gun.h, ((C_WIDTH + mouseX) / 2 - gun.w), ((C_HEIGHT - gun.h) + (gun.stepY * mouseY)), gun.w, gun.h); 
    if (gun.ready)ctx.drawImage(sight, 0, 0, sight.w, sight.h, mouseX - 50, mouseY - 50, sight.w, sight.h);
    else {
        ctx.drawImage(sight, sight.fr * sight.w, 0, sight.w, sight.h, mouseX - 50, mouseY - 50, sight.w, sight.h);
        if (frame % 3 === 2) gunReloaded();
    }

    frame++;
    window.requestAnimationFrame(animate);
}

animate();