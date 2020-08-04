const Stack = require('./stack');
const States = require('./states');
const PreGamePhase = new States.PreGamePhase();
const GamePhase = new States.GamePhase();
const EndPhase = new States.EndPhase();

var states = {0: PreGamePhase, 1: GamePhase, 2: EndPhase};

const readyTime = 3000;
var readyTimer;
const doneTime = 3000;
var doneTimer;
const againTime = 3000;
var againTimer;

const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST, STACK_HITBOX} = Constants;

//var stacks_width = WIDTH*7+X_CARD_DIST*6;
//var aces_width = WIDTH*8+X_CARD_DIST*7;

module.exports = class Game {
    constructor() {
        this.aces = [];
        this.resetAces();
        this.state = 0;
    }
    addPlayer(id, name) {
        states[this.state].addPlayer(id, name);
    }
    removePlayer(id) {
        if (states[this.state].removePlayer(id) == 0) {
            console.log("No players remaining. Resetting Aces");
            this.resetAces();
            this.state = 0;
        }
    }
    toggleReady(id, sendUpdateToPlayers) {
        if (typeof states[this.state].toggleReady == 'function' && states[this.state].toggleReady(id)) {
            console.log(`Both players are ready to start the game. Starting game in ${readyTime/1000} seconds...`);
            let that = this;
            readyTimer = setTimeout(function() {
                that.copyDeck(that.state, 1);
                sendUpdateToPlayers('start_game', "Go!");
                console.log("Game started");
            }, readyTime);
        } else {
            clearTimeout(readyTimer);
        }
    }
    toggleDone(id, sendUpdateToPlayers) {
        if (typeof states[this.state].toggleDone == 'function' && states[this.state].toggleDone(id)) {
            console.log(`Both players are ready to end the game. Ending game in ${doneTime/1000} seconds...`);
            let that = this;
            doneTimer = setTimeout(function() {
                that.copyDeck(that.state, 2);
                sendUpdateToPlayers('end_game', "Stop!");
                console.log("Game ended");
            }, doneTime);
        } else {
            clearTimeout(doneTimer);
        }
    }
    toggleAgain(id, sendUpdateToPlayers) {
        if (typeof states[this.state].toggleAgain == 'function' && states[this.state].toggleAgain(id)) {
            console.log(`Both players are ready to restart the game. Restarting game in ${againTime/1000} seconds...`);
            let that = this;
            againTimer = setTimeout(function() {
                that.state = 0;
                that.resetAces();
                states[that.state].resetDecks();
                sendUpdateToPlayers('restart_game', that, "Game Reset!");
                console.log("Game restarted");
            }, againTime);
        } else {
            clearTimeout(againTimer);
        }
    }
    resetAces() {
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
        console.log("Aces reset");
    }
    mouseDown(id, x, y) {
        if (typeof states[this.state].mouseDown != 'function') throw `Gamestate ${this.state} does not have mouseDown function`;
        return states[this.state].mouseDown(id, x, y);
    }
    mouseMove(id, x, y) {
        if (typeof states[this.state].mouseMove != 'function') throw `Gamestate ${this.state} does not have mouseMove function`;
        states[this.state].mouseMove(id, x, y);
    }
    mouseUp(id, x, y) {
        if (typeof states[this.state].mouseUp != 'function') throw `Gamestate ${this.state} does not have mouseUp function`;
        states[this.state].mouseUp(id, x, y, this.aces);
    }
    flippedCardsUpdate(id) {
        return states[this.state].flippedCardsUpdate(id);
    }
    movingCardsUpdate(id) {
        return states[this.state].movingCardsUpdate(id);
    }
    placedCardsUpdate(id) {
        return states[this.state].placedCardsUpdate(id, this.aces);
    }
    copyDeck(src, dest) {
        this.state = dest;
        states[dest].decks = states[src].decks;
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
        json.decks = states[this.state].decks;
        return json;
    }
}