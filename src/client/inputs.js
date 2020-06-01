import {translation, canvas} from './render';
import {sendInput} from './networking';
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

export function startEventListeners() {
    var dragging = false;
    canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = function(e) {
        switch(e.type) {
            case "mouseup":
                console.log('up');
                sendInput('mouseup', -translation.x + e.pageX, -translation.y + e.pageY)
                dragging = false;
                break;
            case "mousedown":
                console.log("down");
                sendInput('mousedown', -translation.x + e.pageX, -translation.y + e.pageY);
                dragging = true;
                break;
            case "mousemove":
                if (dragging) {
                    console.log("drag");
                    sendInput('mousemove', -translation.x + e.pageX, -translation.y + e.pageY);
                }
                break;
            default:
                console.log("default");
                break;
        }
    }
}
// https://stackoverflow.com/questions/24926028/drag-and-drop-multiple-objects-in-html5-canvas