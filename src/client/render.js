// docs on window scale:
// https://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
// https://www.kirupa.com/html5/resizing_html_canvas_element.htm

import {getAsset} from './assets';
import {me, enemy, aces, game_started} from './networking';
const Constants = require('./../shared/constants');

const {MY_SIZE, ENEMY_SIZE, WIDTH, HEIGHT} = Constants;

var canvas = document.getElementById('game-canvas');
var context = canvas.getContext('2d');

window.addEventListener("resize", resizeCanvas, false);

var Deck;
var Card_ratio = {};
var Card_back = {};

var ace_pos = {};
var my_stack_pos = {};
var my_hand_pos = {};
var enemy_stack_pos = {};
for (var i = 0; i < 8; i++) {
    ace_pos[i] = {};
    my_stack_pos[i%7] = {};
    my_hand_pos[i%4] = {};
    enemy_stack_pos[i%7] = {};
}
var ace_translation = {};
var stack_translation = {};
var hand_translation = {};
var enemy_translation = {};

function resizeCanvas() {
    // scale canvas and card positions according to the size of the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var card_space = {x: canvas.width*0.01, y: canvas.height*0.01};
    var my_space_between_cards = {x: card_space.x + Card_ratio.my_width, y: card_space.y + Card_ratio.my_height};
    var enemy_space_between_cards = card_space.x + Card_ratio.enemy_width;

    var ace_length = Card_ratio.my_width * 8 + card_space.x * 7;
    var stack_length = Card_ratio.my_width * 7 + card_space.x * 6;
    var hand_length = Card_ratio.my_width*2.66 + card_space.x;
    var enemy_length = Card_ratio.enemy_width * 7 + card_space.x * 6;

    // ace cards
    ace_translation = {x: (canvas.width - ace_length)/2, y: (canvas.height - Card_ratio.my_height)/2}
    ace_pos.dWidth = Card_ratio.my_width;
    ace_pos.dHeight = Card_ratio.my_height;
    for (var i = 0; i < 8; i++) {
        ace_pos[i].dx = my_space_between_cards.x * i;
        ace_pos[i].dy = 0;
    }
    // my stack cards
    stack_translation = {x: (canvas.width - stack_length)/2, y: ace_translation.y + my_space_between_cards.y};
    my_stack_pos.dWidth = ace_pos.dWidth;
    my_stack_pos.dHeight = ace_pos.dHeight;
    for (var i = 0; i < 7; i++) {
        my_stack_pos[i].dx = my_space_between_cards.x * i;
        my_stack_pos[i].dy = 0;
    }
    // my hand cards
    hand_translation = {x: ace_translation.x, y: ace_translation.y - my_space_between_cards.y};
    my_hand_pos.dWidth = Card_ratio.my_width;
    my_hand_pos.dHeight = Card_ratio.my_height;
    for (var i = 0; i < 2; i++) {
        my_hand_pos[i].dx = my_space_between_cards*i;
        my_hand_pos[i].dy = 0;
    }
    for (var i = 2; i < 4; i++) {
        my_hand_pos[i].dx = my_hand_pos[i-1].dx + Card_ratio.my_width*0.33;
        my_hand_pos[i].dy = 0;
    }
    // enemy stack cards
    enemy_translation = {x: (canvas.width - enemy_length)/2, y: ace_translation.y - Card_ratio.my_height/2 - Card_ratio.enemy_height/2 - card_space.y};
    enemy_stack_pos.dWidth = Card_ratio.enemy_width;
    enemy_stack_pos.dHeight = Card_ratio.enemy_height;
    for (var i = 0; i < 7; i++) {
        enemy_stack_pos[i].dx = enemy_space_between_cards*i;
        enemy_stack_pos[i].dy = 0;
    }
}

export function startRendering() {
    document.getElementById("login").style.display = "none";
    canvas.style.display = "block";
    Deck = getAsset('Deck_Sprite.gif');
    Card_ratio = {width: Deck.width/13, height: Deck.height/5};
    Card_ratio.my_width = Card_ratio.width*MY_SIZE;
    Card_ratio.my_height = Card_ratio.height*MY_SIZE;
    Card_ratio.enemy_width = Card_ratio.width*ENEMY_SIZE;
    Card_ratio.enemy_height = Card_ratio.height*ENEMY_SIZE;
    Card_back = {sx: 0, sy: Card_ratio.height*4};
    resizeCanvas();
    window.requestAnimationFrame(renderGame);
}

function renderGame() {
    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (game_started) {
        renderCards();
    }
    window.requestAnimationFrame(renderGame);
}

function renderCards() {
    // my render stacks
    if (Object.keys(me).length !== 0) {
        for (var i = 0; i < 7; i++) {
            if (me.stacks[i].length !== 0) {
                var last_in_stack = me.stacks[i].cards[me.stacks[i].length-1];
                var sx = last_in_stack.rank_val * WIDTH;
                var sy = last_in_stack.suit_val * HEIGHT;
                if (!last_in_stack.face) {
                    sx = Card_back.sx;
                    sy = Card_back.sy;
                }
                context.save();
                context.translate(stack_translation.x, stack_translation.y);
                //roundImage(my_stack_pos[i].dx, my_stack_pos[i].dy, my_stack_pos.dWidth, my_stack_pos.dHeight, 5);
                //context.clip();
                context.drawImage(
                    Deck, 
                    sx, sy, 
                    WIDTH, HEIGHT, 
                    me.stacks[i].x, me.stacks[i].y, 
                    WIDTH, HEIGHT);
                context.restore();
            }
        }
        if (me.hand.length !== 0) {
            context.save();
            context.translate(stack_translation.x, stack_translation.y);
            //roundImage(my_hand_pos[0].dx, my_hand_pos[0].dy, my_stack_pos.dWidth, my_stack_pos.dHeight, 5);
            //context.clip();
            context.drawImage(
                Deck, 
                Card_back.sx, Card_back.sy, 
                WIDTH, HEIGHT, 
                my_hand_pos[0].dx, my_hand_pos[0].dy, 
                my_hand_pos.dWidth, my_hand_pos.dHeight);
            context.restore();
        }
    }
    // ace render stacks
    for (var i = 0; i < 8; i++) {
        context.save();
        context.translate(ace_translation.x, ace_translation.y);
        context.fillStyle = "black";
        context.fillRect(
            ace_pos[i].dx, ace_pos[i].dy,
            ace_pos.dWidth, ace_pos.dHeight
        );
        context.restore();
    }
    // enemy render stacks
    if (Object.keys(enemy).length !== 0) {
        for (var i = 0; i < 7; i++) {
            if (enemy.stacks[i].length !== 0) {
                var last_in_stack = enemy.stacks[i][enemy.stacks[i].length-1];
                var sx = last_in_stack.rank_val * Card_ratio.width;
                var sy = last_in_stack.suit_val * Card_ratio.height;
                var sWidth = Card_ratio.width;
                var sHeight = Card_ratio.height;
                context.save();
                context.translate(enemy_translation.x, enemy_translation.y);
                //roundImage(enemy_stack_pos[i].dx, enemy_stack_pos[i].dy, enemy_stack_pos.dWidth, enemy_stack_pos.dHeight, 5);
                //context.clip();
                context.drawImage(
                    Deck, 
                    sx, sy, 
                    sWidth, sHeight, 
                    enemy_stack_pos[i].dx, enemy_stack_pos[i].dy, 
                    enemy_stack_pos.dWidth, enemy_stack_pos.dHeight);
                context.restore();
            }
        }
    }
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