import {translation, resizeCanvas, bg_coords} from './render';
import {sendInput} from './networking';
import {checkCollision, checkWindowXCollision, checkWindowYCollision} from './collision';

export function startEventListeners() {
    // dragging cards
    var dragging = false;
    // moving camera
    var moving = false;
    var moveStart;
    
    window.addEventListener("resize", resizeCanvas, false);

    document.addEventListener("mousemove", function(e) {
        let x = -translation.x + e.clientX;
        let y = -translation.y + e.clientY;
        if (dragging) {
            sendInput('mousemove', x, y);
        } else if (moving) {
            if (moveStart) {
                translation.x -= moveStart.x - x;
                translation.y -= moveStart.y - y;
                // check x and y seperately so the window doesnt get stuck
                if (checkWindowXCollision(bg_coords, translation)) {
                    translation.x += moveStart.x - x;
                }
                if (checkWindowYCollision(bg_coords, translation)) {
                    translation.y += moveStart.y - y;
                }
                resizeCanvas();
            }
        }
    }, false);
    document.addEventListener("mousedown", function(e) {
        let x = -translation.x + e.clientX;
        let y = -translation.y + e.clientY;
        if (checkCollision(x, y)) {
            dragging = true;
            sendInput('mousedown', x, y);
        } else {
            moveStart = {x: x, y: y};
            moving = true;
        }
    }, false);
    document.addEventListener("mouseup", function(e) {
        if (dragging) {
            sendInput('mouseup', -translation.x + e.clientX, -translation.y + e.clientY)
        } else {
            moveStart = null;
        }
        dragging = false;
        moving = false;
    }, false);
}