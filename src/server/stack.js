const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

module.exports = class Stack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hitbox = {
            topR: {x: x+WIDTH/2, y: y+HEIGHT/2},
            topL: {x: x-WIDTH/2, y: y+HEIGHT/2},
            botR: {x: x+WIDTH/2, y: y-HEIGHT/2},
            botL: {x: x-WIDTH/2, y: y-HEIGHT/2}
        };
        this.cards = [];
        this.length = 0;
    }

    addCard(card) {
        this.cards.push(card);
        this.length++;
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            cards: this.cards,
            length: this.length
        };
    }
}