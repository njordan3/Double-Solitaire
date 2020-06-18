import {translation, canvas} from './render';
import {sendInput} from './networking';
import {checkCollision} from './collision';
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

export function startEventListeners() {
    var dragging = false;
    var moving = false;
    document.addEventListener("mousemove", function(e) {
        if (dragging) {
            sendInput('mousemove', -translation.x + e.clientX, -translation.y + e.clientY);
        } else if (moving) {
        }
    });
    document.addEventListener("mousedown", function(e) {
        let x = -translation.x + e.clientX;
        let y = -translation.y + e.clientY;
        if (checkCollision(x, y)) {
            dragging = true;
            sendInput('mousedown', x, y);
        } else {
            moving = true;
        }
    });
    document.addEventListener("mouseup", function(e) {
        if (dragging) {
            sendInput('mouseup', -translation.x + e.clientX, -translation.y + e.clientY)
        } else {
        }
        dragging = false;
        moving = false;
    });
}
// https://stackoverflow.com/questions/24926028/drag-and-drop-multiple-objects-in-html5-canvas