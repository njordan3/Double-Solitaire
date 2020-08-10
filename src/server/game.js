const Stack = require('./stack');
const States = require('./states');
const PreGamePhase = new States.PreGamePhase();
const GamePhase = new States.GamePhase();
const EndPhase = new States.EndPhase();

var states = {0: PreGamePhase, 1: GamePhase, 2: EndPhase};

const readyTime = 3;
var readyTimer;
const doneTime = 3;
var doneTimer;
const againTime = 3;
var againTimer;

const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST, STACK_HITBOX} = Constants;

//var stacks_width = WIDTH*7+X_CARD_DIST*6;
//var aces_width = WIDTH*8+X_CARD_DIST*7;

module.exports = class Game {
    constructor(sendUpdateToPlayers) {
        this.aces = [];
        this.resetAces();
        this.state = 0;
        this.sendUpdateToPlayers = sendUpdateToPlayers;
    }
    addPlayer(id, name) {
        states[this.state].addPlayer(id, name);
    }
    removePlayer(id) {
        // stop any timer that is currently running
        clearInterval(readyTimer);
        clearInterval(doneTimer);
        clearInterval(againTimer);

        let remainingPlayers = states[this.state].removePlayer(id);
        if (remainingPlayers == 0) {
            console.log("No players remaining. Resetting game");
            this.copyDeck(this.state, 0);
            this.resetAces();
        } else if (remainingPlayers == 1 && this.state == 1) {
            this.copyDeck(this.state, 2);
            console.log("Remaining player wins by default");
            this.sendUpdateToPlayers('end_game', "Victory by Default!");
        }
    }
    toggleReady(id) {
        if (typeof states[this.state].toggleReady == 'function' && states[this.state].toggleReady(id)) {
            console.log(`Both players are ready to start the game. Starting game in ${readyTime} seconds...`);
            let that = this;
            readyTimer = this.countDown(readyTimer, readyTime, function () {
                that.copyDeck(that.state, 1);
                that.sendUpdateToPlayers('start_game', "Go!");
                console.log("Game started");
            });
        } else {
            clearInterval(readyTimer);
        }
    }
    toggleDone(id) {
        if (typeof states[this.state].toggleDone == 'function' && states[this.state].toggleDone(id)) {
            console.log(`Both players are ready to end the game. Ending game in ${doneTime/1000} seconds...`);
            let that = this;
            doneTimer = this.countDown(doneTimer, doneTime, function() {
                that.copyDeck(that.state, 2);
                // find out who wins and prepare message
                let id = Object.keys(states[that.state].decks);
                let message = "";
                if (states[that.state].decks[id[0]].score > states[that.state].decks[id[1]].score)
                    message = `${states[that.state].decks[id[0]].score}-${states[that.state].decks[id[1]].score} ${states[that.state].decks[id[0]].name} wins!`;
                else if (states[that.state].decks[id[1]].score > states[that.state].decks[id[0]].score) {
                    message = `${states[that.state].decks[id[1]].score}-${states[that.state].decks[id[0]].score} ${states[that.state].decks[id[1]].name} wins!`;
                } else {
                    message = `${states[that.state].decks[id[0]].score}-${states[that.state].decks[id[1]].score} Tie!`
                }
                that.sendUpdateToPlayers('end_game', message);
                console.log("Game ended");
            }, doneTime);
        } else {
            clearInterval(doneTimer);
        }
    }
    toggleAgain(id) {
        if (typeof states[this.state].toggleAgain == 'function' && states[this.state].toggleAgain(id)) {
            console.log(`All players are ready to restart the game. Restarting game in ${againTime/1000} seconds...`);
            let that = this;
            againTimer = this.countDown(againTimer, againTime, function() {
                that.copyDeck(that.state, 0);
                that.resetAces();
                states[that.state].resetDecks();
                that.sendUpdateToPlayers('restart_game', that, "Game Reset!");
                console.log("Game restarted");
            });
        } else {
            clearInterval(againTimer);
        }
    }
    countDown(timer, runTime, callback) {
        let that = this;
        timer = setInterval(function () {
            if (runTime <= 0) {
                clearInterval(timer);
                callback();
            } else {
                that.sendUpdateToPlayers('message', runTime);
                runTime--;
            }
        }, 1000);
        return timer;
    }
    resetAces() {
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
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
        // reset status flags
        for (let i in states[src].decks) {
            states[src].decks[i].ready = states[src].decks[i].done = states[src].decks[i].again = false;
        }
        this.state = dest;
        console.log(`===============[${states[this.state].desc}]===============`);
        states[dest].decks = states[src].decks;
        states[src].decks = {};
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