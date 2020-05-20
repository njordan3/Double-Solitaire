const Deck = require('./deck');

module.exports = class Game {
    constructor() {
        this.decks = [];
        this.players = {};
    }
    addPlayer(id, name) {
        this.decks[id] = new Deck();
        this.players[id] = name;
    }
    removePlayer(id) {
        delete this.decks[id];
        delete this.players[id];
    }
}