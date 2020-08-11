// docs on window scale:
// https://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
// https://www.kirupa.com/html5/resizing_html_canvas_element.htm

import {getAsset} from './assets';
import {me, enemy, aces, sendStatus} from './networking';
const Constants = require('./../shared/constants');

const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

var canvas1 = document.getElementById('background');
var background = canvas1.getContext('2d');
var canvas2 = document.getElementById('foreground');
var foreground = canvas2.getContext('2d');
const statusButton = document.getElementById("statusButton");
//const messageQueue = document.getElementById("messageQueue");
const statusMessage = document.getElementById("statusMessage");

// middle of all card stacks
var middle = {x: WIDTH*4-3.5*X_CARD_DIST, y: HEIGHT/2};
// deck image
var Deck;
// sprite coords for back of the card
var Card_back = {};
// tabletop image
var Felt;
// tabletop pattern
var Tabletop;
// background position coords
export var bg_coords = {};

export var translation = {}
// stack outline coords
export var boxes = {};
export function setBoxes() {
    boxes.hand = {
        x: me.hand[0].x - 2*X_CARD_DIST,
        y: me.hand[0].y - Y_CARD_DIST/2,
        enemyX: -3*(me.hand[0].x + X_CARD_DIST),
        enemyY: -me.hand[0].y - Y_CARD_DIST/2,
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
}

export function resizeCanvas() {
    // scale canvas and card positions according to the size of the window
    canvas1.width = canvas2.width = Felt.width = window.innerWidth;
    canvas1.height = canvas2.height = Felt.height = window.innerHeight;
    translation.x = translation.x || canvas2.width/2 - middle.x;
    translation.y = translation.y || canvas2.height/2 - middle.y;
    background.clearRect(0, 0, canvas1.width, canvas1.height);
    
    renderBackground();
    renderBoxes();
}

function alterHTML() {
    document.getElementById("login").style.display = "none";
    document.body.style.background = "radial-gradient(circle at bottom, navy 0, black 100%)";
    document.body.style.height = "100vh";
    document.getElementById("stars").style.display = "block";
    canvas1.style.display = "block";
    canvas2.style.display = "block";
}

export function showStatusButton(status) {
    statusButton.style.display = "block";
    let toggle = true;
    statusButton.innerHTML = toggle ? status : `Not ${status}`;
    statusButton.onclick = () => {
        toggle = !toggle;
        statusButton.innerHTML = toggle ? status : `Not ${status}`;
        sendStatus(status.toLowerCase());
    }
}

function setAssets() {
    Deck = getAsset('Deck_Sprite.gif');
    Felt = getAsset('tabletop.jpg');
    Tabletop = background.createPattern(Felt, "repeat");
    bg_coords = {
        x: middle.x-Felt.width*2.5,
        y: middle.y-Felt.height*1.5,
        width: 5*Felt.width,
        height: 3*Felt.height
    }
    Card_back = {x: 0, y: Deck.height*4/5};
}

export function startRendering() {
    alterHTML();
    setAssets();
    resizeCanvas();
    window.requestAnimationFrame(renderGame);
}

function renderGame() {
    // clear canvas
    foreground.clearRect(0, 0, canvas2.width, canvas2.height);
    renderCards();
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

export function renderBoxes() {
    background.save();
    background.translate(translation.x, translation.y);
    background.globalAlpha = 0.5;
    background.strokeStyle = "gold";
    background.lineWidth = 5;
    background.rect(boxes.aces.x, boxes.aces.y, boxes.aces.width, boxes.aces.height);
    background.rect(boxes.hand.x, boxes.hand.y, boxes.hand.width, boxes.hand.height);
    background.rect(boxes.stacks.x, boxes.stacks.y, boxes.stacks.width, boxes.stacks.height);
    // enemy stacks
    background.rect(boxes.stacks.x, -boxes.stacks.y-Y_CARD_DIST, boxes.stacks.width, boxes.stacks.height);
    background.rect(boxes.hand.enemyX, boxes.hand.enemyY, boxes.hand.width, boxes.hand.height);
    background.stroke();
    background.restore();
}

function renderBackground() {
    background.save();
    background.translate(translation.x, translation.y);
    //background.drawImage(Felt, 0, 0, canvas1.width, canvas1.height);
    background.rect(bg_coords.x, bg_coords.y, bg_coords.width, bg_coords.height);
    background.fillStyle = Tabletop;
    background.fill();
    background.restore();
}

function drawCard(x, y, sx, sy, rotate = 0) {
    foreground.save();
    foreground.translate(translation.x, translation.y);
    if (rotate) {
        foreground.rotate(rotate);
        x = -x - WIDTH;
        y = -y - HEIGHT;
    }
    foreground.drawImage(
        Deck, 
        sx, sy, 
        WIDTH, HEIGHT, 
        x, y, 
        WIDTH, HEIGHT);
    foreground.restore();
}