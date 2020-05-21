const Deck = require('./deck');

module.exports = class Game {
    constructor() {
        this.decks = {};
        this.players = {count: 0};
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
}