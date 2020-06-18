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
    flipCard() {
        this.cards.up.push(this.cards.down.pop());
    }
    alignCards(style) {
        switch(style) {
            case 'stacks':
                for (let i = 0; i < this.length('up'); i++) {
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y + i*0.33*HEIGHT;
                }
                break;
            case 'hand':
                let length = this.length('up');
                let j = 0;
                for (let i = length-this.dealt; i < length; i++) {
                    if (i < 0) {
                        i = 0;
                    }
                    this.cards.up[i].x = this.x + j*0.33*WIDTH;
                    this.cards.up[i].y = this.y;
                    j++;
                }
                let count = 3;
                for (let i = this.top('up'); i >= 0; i--) {
                    this.cards.up[i].x = this.x + count*0.33*WIDTH;
                    this.cards.up[i].y = this.y;
                    count--;
                }
                break;
            default:
                for (let i = 0; i < this.length('up'); i++) {
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y;
                }
                break;
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