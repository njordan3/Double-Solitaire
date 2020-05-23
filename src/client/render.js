import {getAsset} from './assets';
import {me, enemy, game_started} from './networking';

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');

var Deck;
var Card_ratio = {};
var card_size_coef = 2.65;

export function startRendering() {
    document.getElementById("login").style.display = "none";
    canvas.style.display = "block";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    for (var i = 0; i < me.stacks.length; i++) {
        var last_in_stack = me.stacks[i][me.stacks[i].length-1];
        var sx = last_in_stack.rank_val * Card_ratio.width;
        var sy = last_in_stack.suit_val * Card_ratio.height;
        var sWidth = Card_ratio.width;
        var sHeight = Card_ratio.height;
        var dx = i * Card_ratio.width * card_size_coef;
        var dy = 0;
        var dWidth = Card_ratio.width * card_size_coef;
        var dHeight = Card_ratio.height * card_size_coef;
        context.save();
        context.translate(0, 0);
        roundImage(i*Card_ratio.width*card_size_coef, 0, Card_ratio.width*card_size_coef, Card_ratio.height*card_size_coef, 5);
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