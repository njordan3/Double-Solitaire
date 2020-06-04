const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

module.exports = class Stack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cards = {up: [], down: []};
    }
    addCard(index, card) {
        this.cards[index].push(card);
    }
    alignCards(style) {
        for (let i = 0; i < this.length('up'); i++) {
            switch(style) {
                case 'stacks':
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y + i*0.33*HEIGHT;
                    break;
                case 'hand':
                    this.cards.up[i].x = this.x + i*0.33*WIDTH;
                    this.cards.up[i].y = this.y;
                    break;
                default:
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y;
                    break;
            }
        }
    }
    top(index) {
        return this.length(index)-1;
    }
    length(index) {
        return this.cards[index].length;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            cards: this.cards,
            length: this.length('up')+this.length('down')
        };
    }
}