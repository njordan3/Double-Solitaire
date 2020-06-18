// docs on window scale:
// https://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
// https://www.kirupa.com/html5/resizing_html_canvas_element.htm

import {getAsset} from './assets';
import {me, enemy, aces, game_started} from './networking';
const Constants = require('./../shared/constants');

const {ENEMY_SCALE, WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

export var canvas = document.getElementById('game-canvas');
var context = canvas.getContext('2d');

window.addEventListener("resize", resizeCanvas, false);

// deck image
var Deck;
// sprite coords for back of the card
var Card_back = {};
// translation coords
export var translation = {}
// stack outline coords
export var boxes = {};
export function setBoxes() {
    boxes.hand = {
        x: me.hand[0].x - 2*X_CARD_DIST,
        y: me.hand[0].y - Y_CARD_DIST/2,
        width: 2*WIDTH + 5*X_CARD_DIST,
        height: HEIGHT + Y_CARD_DIST
    };
    boxes.aces = {
        x: aces[0].x - 2*X_CARD_DIST,
        y: aces[0].y - Y_CARD_DIST/2,
        width: 8*WIDTH + 11*X_CARD_DIST,
        height: HEIGHT + Y_CARD_DIST
    };
    boxes.stacks = {
        x: me.stacks[0].x - 2*X_CARD_DIST,
        y: me.stacks[0].y - Y_CARD_DIST/2,
        width: 7*WIDTH + 10*X_CARD_DIST,
        height: HEIGHT + Y_CARD_DIST
    };
    boxes.enemy = {
        x: -translation.x + translation.enemyX - ENEMY_SCALE*2*X_CARD_DIST,
        y: -translation.y + translation.enemyY - ENEMY_SCALE*Y_CARD_DIST/2,
        width: ENEMY_SCALE*(7*WIDTH + 10*X_CARD_DIST),
        height: ENEMY_SCALE*(HEIGHT + Y_CARD_DIST)
    };
}

function resizeCanvas() {
    // scale canvas and card positions according to the size of the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    translation = {
        x: canvas.width/2 - WIDTH*4 - 3.5*X_CARD_DIST,
        y: canvas.height/2 - HEIGHT/2,
        enemyX: canvas.width - ENEMY_SCALE*8*WIDTH - ENEMY_SCALE*8*X_CARD_DIST,
        enemyY: (Y_CARD_DIST-HEIGHT)*ENEMY_SCALE
    };
    boxes.enemy = {
        x: -translation.x + translation.enemyX - ENEMY_SCALE*2*X_CARD_DIST,
        y: -translation.y + translation.enemyY - ENEMY_SCALE*Y_CARD_DIST/2,
        width: ENEMY_SCALE*(7*WIDTH + 8*X_CARD_DIST),
        height: ENEMY_SCALE*(HEIGHT + Y_CARD_DIST)
    };
}

export function startRendering() {
    document.getElementById("login").style.display = "none";
    canvas.style.display = "block";
    Deck = getAsset('Deck_Sprite.gif');
    Card_back = {x: 0, y: Deck.height*4/5};
    resizeCanvas();
    window.requestAnimationFrame(renderGame);
}

function renderGame() {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (game_started) {
        renderBoxes();
        renderCards();
    }
    window.requestAnimationFrame(renderGame);
}

function renderCards() {
    // my render stacks
    if (me != undefined) {
        for (var i = 0; i < 7; i++) {
            if (me.stacks[i].length > me.stacks[i].cards.length) {
                drawCard(me.stacks[i].x, me.stacks[i].y, Card_back.x, Card_back.y);
            }
            for (var j = 0; j < me.stacks[i].cards.length; j++) {
                var card = me.stacks[i].cards[j];
                drawCard(card.x, card.y, card.rank_val * WIDTH, card.suit_val * HEIGHT);
            }
        }
        if (me.hand[0].length > 0) {
            drawCard(me.hand[0].x, me.hand[0].y, Card_back.x, Card_back.y);
        }
        if (me.hand[1].length > 0) {
            for (var i = 0; i < me.hand[1].cards.length; i++) {
                var card = me.hand[1].cards[i];
                drawCard(card.x, card.y, card.rank_val * WIDTH, card.suit_val * HEIGHT);
            }
        }
    }
    
    // ace render stacks
    for (let i = 0; i < 8; i++) {
        if (aces[i].cards != undefined && aces[i].cards.length != 0) {
            let card = aces[i].cards;
            drawCard(card.x, card.y, card.rank_val * WIDTH, card.suit_val * HEIGHT);
        }
    }
    // enemy render stacks
    if (Object.keys(enemy).length != 0) {
        for (let i = 0; i < 7; i++) {
            if (enemy.stacks[i].length > enemy.stacks[i].cards.length) {
                drawCard(enemy.stacks[i].x, -enemy.stacks[i].y, Card_back.x, Card_back.y, Math.PI);
            }
            for (let j = 0; j < enemy.stacks[i].cards.length; j++) {
                let card = enemy.stacks[i].cards[j];
                drawCard(card.x, -card.y, card.rank_val * WIDTH, card.suit_val * HEIGHT, Math.PI);
            }
        }
        if (enemy.hand[0].length > 0) {
            drawCard(-enemy.hand[0].x+7*WIDTH+6*X_CARD_DIST, -enemy.hand[0].y, Card_back.x, Card_back.y, Math.PI);
        }
        if (enemy.hand[1].length > 0) {
            for (var i = 0; i < enemy.hand[1].cards.length; i++) {
                var card = enemy.hand[1].cards[i];
                drawCard(-card.x+7*WIDTH+6*X_CARD_DIST, -card.y, card.rank_val * WIDTH, card.suit_val * HEIGHT, Math.PI);
            }
        }
    }
}

function renderBoxes() {
    /*
    context.save();
    context.translate(translation.x, translation.y);
    //context.globalAlpha = 0.5;
    context.strokeStyle = "gold";
    //context.lineJoin = "round";
    // this line destroys performance for some reason
    //context.lineWidth = 5;
    context.rect(boxes.aces.x, boxes.aces.y, boxes.aces.width, boxes.aces.height);
    context.rect(boxes.hand.x, boxes.hand.y, boxes.hand.width, boxes.hand.height);
    context.rect(boxes.stacks.x, boxes.stacks.y, boxes.stacks.width, boxes.stacks.height);
    context.rect(boxes.enemy.x, boxes.enemy.y, boxes.enemy.width, boxes.enemy.height);
    context.stroke();
    context.restore();
    */
}

/* snippet taken from https://stackoverflow.com/questions/19585999/canvas-drawimage-with-round-corners */
function roundImage(x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
}

function drawCard(x, y, sx, sy, rotate = 0) {
    context.save();
    context.translate(translation.x, translation.y);
    if (rotate) {
        context.rotate(rotate);
        x = -x - WIDTH - X_CARD_DIST;
        y = -y - HEIGHT;
    }
    context.drawImage(
        Deck, 
        sx, sy, 
        WIDTH, HEIGHT, 
        x, y, 
        WIDTH, HEIGHT);
    context.restore();
}