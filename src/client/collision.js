import {me} from './networking';
const Constants = require('./../shared/constants');

const {WIDTH, HEIGHT} = Constants;

export function checkCollision(x, y) {
    let i, j;
    for (i = 0; i < 7; i++) {
        let stack = me.stacks[i];
        if (x > stack.x && x < stack.x+WIDTH && y > stack.y && y < stack.y+HEIGHT) return true;
        for (j = 1; j < stack.cards.length; j++) {
            let card = stack.cards[j];
            if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) return true;
        }
    }
    if ((me.hand[0].length != 0 || me.hand[1].length != 0) && x > me.hand[0].x && x < me.hand[0].x+WIDTH && y > me.hand[0].y && y < me.hand[0].y+HEIGHT) return true;
    if (me.hand[1].cards.length != 0) {
        for (j = me.hand[1].cards.length-3; j < me.hand[1].cards.length; j++) {
            let card = me.hand[1].cards[j];
            if (card != undefined) {
                if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) return true;
            }
        }
    }
    return false;
}

export function checkWindowXCollision(coords, translation) {
    const {x, width} = coords;
    let w = {x: translation.x - window.innerWidth/2, width: window.innerWidth};
    return (w.x > x+width || w.x+w.width < x);
}
export function checkWindowYCollision(coords, translation) {
    const {y, height} = coords;
    let w = {y: translation.y - window.innerHeight/2, height: window.innerHeight};
    return (w.y > y+height || w.y+w.height < y);
}