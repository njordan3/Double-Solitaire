module.exports = class Card {
    constructor(suit, rank, suit_val, rank_val, color) {
        this.suit = suit;
        this.rank = rank;
        this.suit_val = suit_val;
        this.rank_val = rank_val;
        this.color = color;
        this.face = false;
        this.x = undefined;
        this.y = undefined;
    }

    flipCard() {
        this.face = !this.face;
    }

    toJSON() {
        return {
            suit: this.suit,
            rank: this.rank,
            suit_val: this.suit_val,
            rank_val: this.rank_val,
            face: this.face,
            x: this.x,
            y: this.y
        }
    }
}