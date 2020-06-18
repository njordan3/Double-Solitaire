import {me, aces} from './networking';
const Constants = require('./../shared/constants');

const {WIDTH, HEIGHT, X_CARD_DIST} = Constants;

export function checkCollision(x, y) {
    return (x > me.stacks[0].x && x < me.stacks[6].x+WIDTH && y > me.stacks[0].y && y < me.stacks[0].y+HEIGHT) ||
           (x > me.hand[0].x && x < me.hand[0].x+2.66*WIDTH+X_CARD_DIST && y > me.hand[0].y && y < me.hand[0].y+HEIGHT) ||
           (x > aces[0].x && x < aces[7].x+WIDTH && y > aces[0].y && y < aces[0].y+HEIGHT);
}