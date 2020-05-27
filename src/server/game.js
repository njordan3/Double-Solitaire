const Deck = require('./deck');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

module.exports = class Game {
    constructor() {
        this.decks = {};
        this.players = {count: 0};
        this.aces = [];
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
    }
    addPlayer(id, name) {
        this.decks[id] = new Deck();
        this.players[id] = name;
        this.players.count++;
    }
    removePlayer(id) {
        delete this.decks[id];
        delete this.players[id];
        this.players.count--;
    }
    toJSON() {
        return {
            decks: this.decks,
            players: this.players,
            aces: this.aces
        };
    }

}