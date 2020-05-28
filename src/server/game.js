const Deck = require('./deck');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

var stacks_width = WIDTH*7+X_CARD_DIST*6;
var aces_width = WIDTH*8+X_CARD_DIST*7;

var moving_cards = {cards: []};

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
    decideAction(id, x, y) {
        var deck = this.decks[id];
        var hand = deck.hand;
        var stacks = deck.stacks;
        // check mouse/hand collision
        if (x > hand[0].x && x < hand[0].x+WIDTH && y > hand[0].y && y < hand[0].y+HEIGHT) {
            if (hand.length == 0) {
                this.decks[id].returnToHand();
                return false;
            } else {
                this.decks[id].dealThree();
                return false;
            }
        } else if (x > stacks[0].x && x < stacks[0].x+stacks_width && y > stacks[0].y && y < stacks[0].y+HEIGHT) {
            console.log("here");
            for (var i = 0; i < 7; i++) {
                var init = stacks[i].length - stacks[i].getFaceAmount();
                for (var j = init; j < stacks[i].length; j++) {
                    var card = stacks[i].cards[j];
                    if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                        moving_cards.stack = i;
                        moving_cards.type = 'stacks';
                        while (j < stacks[i].length) {
                            moving_cards.cards.push(j);
                            j++;
                        }
                        return true;
                    }
                }
            }
        }
        return false;
        /*
        for (var i = 0; i < 7; i++) {

        }
        */
    }
    moveCard(id, x, y) {
        for (var i = 0; i < moving_cards.cards.length; i++) {
            this.decks[id][moving_cards.type][moving_cards.stack].cards[i].x = x;
            this.decks[id][moving_cards.type][moving_cards.stack].cards[i].y = y;
        }
    }
    placeCard(id, x, y) {
        for (var i = 0; i < moving_cards.cards.length; i++) {
            var card = this.decks[id][moving_cards.type][moving_cards.stack].cards[i];
        }
        moving_cards = {cards: []};
    }
    toJSON() {
        return {
            decks: this.decks,
            players: this.players,
            aces: this.aces
        };
    }

}