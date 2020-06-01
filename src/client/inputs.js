import {translation, boxes, canvas} from './render';
import {sendInput, me} from './networking';
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

var prevX, prevY;
var interval;

export function startEventListeners() {
    var dragging = false;
    document.addEventListener("mousemove", function(e) {
        console.log("here");
        if (dragging) {
            console.log("drag");
            sendInput('mousemove', -translation.x + e.clientX, -translation.y + e.clientY);
        }
    });
    document.addEventListener("mousedown", function(e) {
        console.log("down");
        sendInput('mousedown', -translation.x + e.clientX, -translation.y + e.clientY);
        dragging = true;
    });
    document.addEventListener("mouseup", function(e) {
        console.log('up');
        sendInput('mouseup', -translation.x + e.clientX, -translation.y + e.clientY)
        dragging = false;
    });
}
// https://stackoverflow.com/questions/24926028/drag-and-drop-multiple-objects-in-html5-canvas