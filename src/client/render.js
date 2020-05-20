import {getAsset} from './assets';

const canvas = document.getElementById('game-canvas');
const context = canvas.getContext('2d');

var Deck;
var Card_ratio = {};

export function startRendering() {
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
    renderBackground();
    renderCards();
}

function renderBackground() {
    context.save();
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
}

function renderCards() {
    for (var i=0; i < 4; i++) {
        for (var j=0; j < 13; j++) {
            context.save();
            context.translate(0, canvas.height/2);
            // round the corners of the card
            roundImage(j*Card_ratio.width, i*Card_ratio.height, Card_ratio.width, Card_ratio.height, 5);
            context.clip();
            context.drawImage(
                Deck,
                j*Card_ratio.width,
                i*Card_ratio.height,
                Card_ratio.width,
                Card_ratio.height,
                j*Card_ratio.width,
                i*Card_ratio.height,
                Card_ratio.width,
                Card_ratio.height
            );
            context.restore();
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