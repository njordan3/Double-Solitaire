const Deck = require('./deck');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST, STACK_HITBOX} = Constants;

//var stacks_width = WIDTH*7+X_CARD_DIST*6;
//var aces_width = WIDTH*8+X_CARD_DIST*7;

module.exports = class Game {
    constructor() {
        this.decks = {};
        this.aces = [];
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
    }
    addPlayer(id, name) {
        this.decks[id] = new Deck(name);
    }
    removePlayer(id) {
        delete this.decks[id];
    }
    toJSON() {
        let json = {};
        // send only the last card of each ace stack
        json.aces = [];
        for (let i = 0; i < this.aces.length; i++) {
            json.aces[i] = {};
            json.aces[i].x = this.aces[i].x;
            json.aces[i].y = this.aces[i].y;
            json.aces[i].length = this.aces[i].length('up');
            if (this.aces[i].length('up') > 0) {
                json.aces[i].cards = this.aces[i].cards.up[this.aces[i].top('up')];
            }
        }
        json.decks = this.decks;
        //json.players = this.players;
        return json;
    }
}