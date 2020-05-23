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
var card_size_coef = 2.65;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function startRendering() {
    document.getElementById("login").style.display = "none";
    resizeCanvas();
    canvas.style.display = "block";
    Deck = getAsset('Deck_Sprite.png');
    Card_ratio = {width: Deck.width/13, height: Deck.height/4};
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
    // render stacks
    var translation = {x: (canvas.width - Card_ratio.width)/2 - me.stacks.length/2*Card_ratio.width*card_size_coef-canvas.width*0.01*Math.floor(me.stacks.length/2), y: canvas.height/2 - Card_ratio.height/2}
    for (var i = 0; i < me.stacks.length; i++) {
        var last_in_stack = me.stacks[i][me.stacks[i].length-1];
        var sx = last_in_stack.rank_val * Card_ratio.width;
        var sy = last_in_stack.suit_val * Card_ratio.height;
        var sWidth = Card_ratio.width;
        var sHeight = Card_ratio.height;
        var dx = i * Card_ratio.width * card_size_coef + canvas.width*0.01*i;
        var dy = 0;
        var dWidth = Card_ratio.width * card_size_coef;
        var dHeight = Card_ratio.height * card_size_coef;
        context.save();
        context.translate(translation.x, translation.y);
        roundImage(dx, dy, dWidth, dHeight, 5);
        context.clip();
        context.drawImage(Deck, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        context.restore();
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