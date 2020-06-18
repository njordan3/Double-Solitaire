// docs on window scale:
// https://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
// https://www.kirupa.com/html5/resizing_html_canvas_element.htm

import {getAsset} from './assets';
import {me, enemy, aces} from './networking';
const Constants = require('./../shared/constants');

const {ENEMY_SCALE, WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

var canvas1 = document.getElementById('background');
var background = canvas1.getContext('2d');
var canvas2 = document.getElementById('foreground');
var foreground = canvas2.getContext('2d');

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
    canvas1.width = canvas2.width = window.innerWidth;
    canvas1.height = canvas2.height = window.innerHeight;
    translation = {
        x: canvas2.width/2 - WIDTH*4 - 3.5*X_CARD_DIST,
        y: canvas2.height/2 - HEIGHT/2,
        enemyX: canvas2.width - ENEMY_SCALE*7*WIDTH - ENEMY_SCALE*10*X_CARD_DIST,
        enemyY: Y_CARD_DIST*ENEMY_SCALE
    };
    boxes.enemy = {
        x: -translation.x + translation.enemyX - ENEMY_SCALE*2*X_CARD_DIST,
        y: -translation.y + translation.enemyY - ENEMY_SCALE*Y_CARD_DIST/2,
        width: ENEMY_SCALE*(7*WIDTH + 8*X_CARD_DIST),
        height: ENEMY_SCALE*(HEIGHT + Y_CARD_DIST)
    };
    renderBoxes();
}

export function startRendering() {
    document.getElementById("login").style.display = "none";
    canvas1.style.display = "block";
    canvas2.style.display = "block";
    Deck = getAsset('Deck_Sprite.gif');
    Card_back = {x: 0, y: Deck.height*4/5};
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
    /*
    for (var i = 0; i < 8; i++) {
        foreground.save();
        foreground.translate(translation.x, translation.y);
        foreground.fillStyle = "black";
        foreground.fillRect(
            aces[i].x, aces[i].y,
            WIDTH, HEIGHT
        );
        foreground.restore();
    }
    // enemy render stacks
    for (var i = 0; i < 7; i++) {
        var sx = Card_back.x;
        var sy = Card_back.y;
        // if enemy doesnt exist or if the stack is empty, then render the back of the card
        if (enemy != undefined && enemy.stacks[i].length !== 0) {
            var last_in_stack = enemy.stacks[i].cards[enemy.stacks[i].length-1];
            if (last_in_stack.face) {
                sx = last_in_stack.rank_val * WIDTH;
                sy = last_in_stack.suit_val * HEIGHT;
            }
        }
        foreground.save();
        foreground.translate(translation.enemyX, translation.enemyY);
        //roundImage(enemy_stack_pos[i].dx, enemy_stack_pos[i].dy, enemy_stack_pos.dWidth, enemy_stack_pos.dHeight, 5);
        //foreground.clip();
        foreground.drawImage(
            Deck, 
            sx, sy, 
            WIDTH, HEIGHT, 
            i*ENEMY_SCALE*(WIDTH+X_CARD_DIST), 0, 
            WIDTH*ENEMY_SCALE, HEIGHT*ENEMY_SCALE);
        foreground.restore();
    
    }
    */
}

function renderBoxes() {
    background.save();
    background.translate(translation.x, translation.y);
    //background.globalAlpha = 0.5;
    background.strokeStyle = "gold";
    //background.lineJoin = "round";
    // this line destroys performance for some reason
    //background.lineWidth = 5;
    background.rect(boxes.aces.x, boxes.aces.y, boxes.aces.width, boxes.aces.height);
    background.rect(boxes.hand.x, boxes.hand.y, boxes.hand.width, boxes.hand.height);
    background.rect(boxes.stacks.x, boxes.stacks.y, boxes.stacks.width, boxes.stacks.height);
    background.rect(boxes.enemy.x, boxes.enemy.y, boxes.enemy.width, boxes.enemy.height);
    background.stroke();
    background.restore();
}

function drawCard(x, y, sx, sy) {
    foreground.save();
    foreground.translate(translation.x, translation.y);
    foreground.drawImage(
        Deck, 
        sx, sy, 
        WIDTH, HEIGHT, 
        x, y, 
        WIDTH, HEIGHT);
    foreground.restore();
}