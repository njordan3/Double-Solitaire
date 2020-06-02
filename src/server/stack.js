const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

module.exports = class Stack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cards = [];
    }
    addCard(card) {
        this.cards.push(card);
    }
    getFaceAmount() {
        var count = 0;
        for (var i = 0; i < this.length(); i++) {
            if (this.cards[i].face) {
                count++;
            }
        }
        return count;
    }
    top() {
        return this.cards.length-1;
    }
    length() {
        return this.cards.length;
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