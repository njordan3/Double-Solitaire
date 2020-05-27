import {translation, boxes} from './render';
import {sendStackDrag, sendStackFlip, sendHandDrag, sendHandFlip, me, socket} from './networking';
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

var stack_dragging = false;
var hand_dragging = false;
export var start = {};
export var indexes = {};

export function startEventListeners() {
    document.addEventListener('mousedown', e => {
        console.log("down");
        socket.emit('hand_flip');
        /*
        // tell browser we are handling this event
        e.preventDefault();
        e.stopPropagation();
        // get current mouse position
        var x = -translation.x + e.clientX;
        var y = -translation.y + e.clientY;
        stack_dragging = false;
        hand_dragging = false;

        // check if mouse is inside the stacks section
        if (x > boxes.stacks.x && x < boxes.stacks.x + boxes.stacks.width &&
            y > boxes.stacks.y && y < boxes.stacks.y + boxes.stacks.height) {
            console.log("stack");
            for (var i = 0; i < me.stacks.length; i++) {
                for (var j = 0; j < me.stacks[i].cards.length; j++) {
                    var card = me.stacks[i].cards[j];
                    if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                        console.log(card.rank+" "+card.suit);
                        stack_dragging = true;
                        indexes.i = i;
                        indexes.j = j;
                        break;
                    }
                }
            }
                /*
                if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                    if (!card.face) {
                        indexes.i = i;
                        indexes.j = j;
                        sendStackFlip();
                        break;
                    }
                    stack_dragging = true;
                    // save stack positions of the card
                    indexes.i = i;
                    indexes.j = [];
                    for (var k = j; k < me.stacks[i].cards.length; k++) {
                        indexes.j.push(k);
                    }
                    // save starting drag positions
                    start.x = x;
                    start.y = y;
                    break;
                }
            }
        }
        
        // check hand section collision
        } else if (x > boxes.hand.x && x < boxes.hand.x+boxes.hand.width &&
                   y > boxes.hand.y && y < boxes.hand.y+boxes.hand.height){
            console.log("hand");
            var hand = me.hand[0];
            if (x > hand.x && x < hand.x+WIDTH && y > hand.y && y < hand.y+HEIGHT) {
                console.log("hand stack");
                //sendHandFlip();
            }
            if (me.hand[1].cards!== undefined) {
                var card = me.hand[1].cards[me.hand[1].cards.length-1];
                if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                    //hand_dragging = true;
                    //start.x = x;
                    //start.y = y;
                    console.log(card.rank+" "+card.suit);
                }
            }
        } else {
            console.log("no collision");
        }
        */
    });

    document.addEventListener('mouseup', e => {
        console.log("up");
        // tell browser we are handling this event
        e.preventDefault();
        e.stopPropagation();

        if (stack_dragging === true) {
            stack_dragging = false;
            indexes = {};
        }
        /*
        // stop mouseMove from doing anything
        stack_dragging = false;
        hand_dragging = false;
        // clear variables
        indexes = {};
        start = {};
        */
    });

    document.addEventListener('mousemove', e => {
        if (stack_dragging === true) {
            me.stacks[indexes.i].cards[indexes.j].x = -translation.x + e.clientX;
            me.stacks[indexes.i].cards[indexes.j].y = -translation.y + e.clientY;
        }
    });
}
// https://stackoverflow.com/questions/24926028/drag-and-drop-multiple-objects-in-html5-canvas