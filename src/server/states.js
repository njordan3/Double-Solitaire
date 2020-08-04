const Deck = require('./deck');

class State {
    constructor() {
        this.decks = {};
    }
}

class PreGamePhase extends State {
    addPlayer(id, name) {
        // player limit of 2
        if (Object.keys(this.decks).length >= 2) throw "Game is full";
        this.decks[id] = new Deck(name);
        console.log(name + " connected");
    }
    removePlayer(id) {
        let name = this.decks[id].name;
        delete this.decks[id];
        console.log(`${name} disconnected`);
        return Object.keys(this.decks).length;
    }
    toggleReady(id) {
        this.decks[id].toggleReady();
        let status = this.decks[id].ready ? "is" : "is not";
        console.log(`${this.decks[id].name} ${status} ready`);
        return this.isReady();
    }
    isReady() {
        let count = 0;
        for (let i in this.decks) {
            count += this.decks[i].ready ? 1 : 0;
        }
        return count == 2;
    }
    resetDecks() {
        for (let i in this.decks) {
            this.decks[i] = new Deck(this.decks[i].name);
        }
        console.log("Decks reset")
    }
}

class GamePhase extends State {
    removePlayer(id) {
        let name = this.decks[id].name;
        delete this.decks[id];
        console.log(`${name} disconnected`);
        return Object.keys(this.decks).length;
    }
    mouseDown(id, x, y) {
        return this.decks[id].decideAction(x, y);
    }
    mouseMove(id, x, y) {
        this.decks[id].moveCardPos(x, y);
    }
    mouseUp(id, x, y, aces) {
        this.decks[id].placeCard(x, y, aces);
    }
    flippedCardsUpdate(id) {
        return this.decks[id].flippedCardsUpdate(id);
    }
    movingCardsUpdate(id) {
        return this.decks[id].movingCardsUpdate(id);
    }
    placedCardsUpdate(id, aces) {
        return this.decks[id].placedCardsUpdate(id, aces);
    }
    toggleDone(id) {
        this.decks[id].toggleDone();
        let status = this.decks[id].done ? "is" : "is not";
        console.log(`${this.decks[id].name} ${status} done`);
        return this.isDone();
    }
    isDone() {
        let count = 0;
        for (let i in this.decks) {
            count += this.decks[i].done ? 1 : 0;
        }
        return count == 2;
    }
}

class EndPhase extends State {
    removePlayer(id) {
        delete this.decks[id];
    }
    toggleAgain(id) {
        this.decks[id].toggleAgain();
        let status = this.decks[id].again ? "does" : "does not";
        console.log(`${this.decks[id].name} ${status} want to play again`);
        return this.isAgain();
    }
    isAgain() {
        let count = 0;
        for (let i in this.decks) {
            count += this.decks[i].again ? 1 : 0;
        }
        return count == Object.keys(this.decks).length;
    }
}

module.exports= {
    PreGamePhase: PreGamePhase,
    GamePhase: GamePhase,
    EndPhase: EndPhase
}