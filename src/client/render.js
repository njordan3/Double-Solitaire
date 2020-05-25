// docs on window scale:
// https://www.html5rocks.com/en/tutorials/casestudies/gopherwoord-studios-resizing-html5-games/
// https://www.kirupa.com/html5/resizing_html_canvas_element.htm

import {getAsset} from './assets';
import {me, enemy, game_started} from './networking';

var canvas = document.getElementById('game-canvas');
var context = canvas.getContext('2d');

window.addEventListener("resize", resizeCanvas, false);

var Deck;
var Card_ratio = {};

var my_size_coef = 2.65;
var my_stack_pos = {};
for (var i = 0; i < 7; i++) {
    my_stack_pos[i] = {};
}
var my_translation = {};
var my_space_between_cards;

var ace_pos = {};
for (var i = 0; i < 8; i++) {
    ace_pos[i] = {};
}
var ace_translation = {};

var enemy_size_coef = 1;
var enemy_stack_pos = {};
for (var i = 0; i < 7; i++) {
    enemy_stack_pos[i] = {};
}
var enemy_translation = {};
var enemy_space_between_cards;

function resizeCanvas() {
    // scale canvas and card positions according to the size of the window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // my cards
    my_space_between_cards = canvas.width*0.01;
    var stacks_length = Card_ratio.width * my_size_coef * 7 + my_space_between_cards * 6;
    my_translation = {x: (canvas.width - stacks_length)/2, y: (canvas.height - Card_ratio.height*my_size_coef)/2 + Card_ratio.height*my_size_coef + my_space_between_cards};
    my_stack_pos.dWidth = Card_ratio.width * my_size_coef;
    my_stack_pos.dHeight = Card_ratio.height * my_size_coef;
    for (var i = 0; i < 7; i++) {
        my_stack_pos[i].dx = i * Card_ratio.width * my_size_coef + my_space_between_cards*i;
        my_stack_pos[i].dy = 0;
    }
    // ace cards
    var ace_length = Card_ratio.width * my_size_coef * 8 + my_space_between_cards * 7;
    ace_translation = {x: (canvas.width - ace_length)/2, y: (canvas.height - Card_ratio.height*my_size_coef)/2}
    ace_pos.dWidth = my_stack_pos.dWidth;
    ace_pos.dHeight = my_stack_pos.dHeight;
    for (var i = 0; i < 8; i++) {
        ace_pos[i].dx = i * Card_ratio.width * my_size_coef + my_space_between_cards*i;
        ace_pos[i].dy = 0;
    }
    // enemy cards
    enemy_space_between_cards = canvas.width*0.01;
    var enemy_length = Card_ratio.width * enemy_size_coef * 7 + enemy_space_between_cards * 6;
    enemy_translation = {x: (canvas.width - enemy_length)/2, y: (canvas.height - Card_ratio.height*enemy_size_coef)/2 - Card_ratio.height*enemy_size_coef - enemy_space_between_cards};
    enemy_stack_pos.dWidth = Card_ratio.width * enemy_size_coef;
    enemy_stack_pos.dHeight = Card_ratio.height * enemy_size_coef;
    for (var i = 0; i < 7; i++) {
        enemy_stack_pos[i].dx = i * Card_ratio.width * enemy_size_coef + enemy_space_between_cards*i;
        enemy_stack_pos[i].dy = 0;
    }
}

export function startRendering() {
    document.getElementById("login").style.display = "none";
    canvas.style.display = "block";
    Deck = getAsset('Deck_Sprite.png');
    Card_ratio = {width: Deck.width/13, height: Deck.height/4};
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
                var last_in_stack = me.stacks[i][me.stacks[i].length-1];
                var sx = last_in_stack.rank_val * Card_ratio.width;
                var sy = last_in_stack.suit_val * Card_ratio.height;
                var sWidth = Card_ratio.width;
                var sHeight = Card_ratio.height;
                context.save();
                context.translate(my_translation.x, my_translation.y);
                roundImage(my_stack_pos[i].dx, my_stack_pos[i].dy, my_stack_pos.dWidth, my_stack_pos.dHeight, 5);
                context.clip();
                context.drawImage(
                    Deck, 
                    sx, sy, 
                    sWidth, sHeight, 
                    my_stack_pos[i].dx, my_stack_pos[i].dy, 
                    my_stack_pos.dWidth, my_stack_pos.dHeight);
                context.restore();
            }
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
                roundImage(enemy_stack_pos[i].dx, enemy_stack_pos[i].dy, enemy_stack_pos.dWidth, enemy_stack_pos.dHeight, 5);
                context.clip();
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