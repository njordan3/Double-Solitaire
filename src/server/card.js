module.exports = class Card {
    constructor(suit, rank, value, color) {
        this.suit = suit;
        this.rank = rank;
        this.value = value;
        this.color = color;
        this.face = false;
        this.board_pos = undefined;
        this.x_pos = undefined;
        this.y_pos = undefined;
    }

    flipCard() {
        this.face = !this.face;
    }
}