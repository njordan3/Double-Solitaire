const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

module.exports = class Stack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cards = [];
        this.length = 0;
    }

    addCard(card) {
        this.cards.push(card);
        this.length++;
    }
    getFaceAmount() {
        var count = 0;
        for (var i = 0; i < this.length; i++) {
            if (this.cards[i].face) {
                count++;
            }
        }
        return count;
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