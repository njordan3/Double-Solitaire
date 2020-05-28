import {translation, boxes, canvas} from './render';
import {sendInput, me} from './networking';
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

var prevX, prevY;

export function startEventListeners() {
    var dragging = false;
    var last_emit = now();
    canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = function(e) {
        switch(e.type) {
            case "mouseup":
                console.log('up');
                sendInput('mouseup', -translation.x + e.pageX, -translation.y + e.pageY)
                dragging = false;
                break;
            case "mousedown":
                console.log("down");
                prevX = -translation.x + e.pageX;
                prevY = -translation.y + e.pageY;
                sendInput('mousedown', prevX, prevY);
                dragging = true;
                break;
            case "mousemove":
                if (dragging) {
                    if (now() - last_emit > 10) {
                        console.log("drag");
                        sendInput('mousemove', prevX, prevY);
                        last_emit = now();
                    }
                    prevX = -translation.x + e.pageX;
                    prevY = -translation.y + e.pageY;
                }
                break;
        }
    }
}
// https://stackoverflow.com/questions/24926028/drag-and-drop-multiple-objects-in-html5-canvas

function now() {
    return new Date().getTime();
}