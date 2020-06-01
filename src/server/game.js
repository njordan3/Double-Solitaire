const Deck = require('./deck');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

var stacks_width = WIDTH*7+X_CARD_DIST*6;
var aces_width = WIDTH*8+X_CARD_DIST*7;

var moving_cards = {cards: []};
var initX, initY;

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
            if (hand[0].length == 0) {
                this.decks[id].returnToHand();
                return false;
            } else {
                this.decks[id].dealThree();
                return false;
            }
        } else if (x > stacks[0].x && x < stacks[0].x+stacks_width && y > stacks[0].y && y < stacks[0].y+HEIGHT) {
            for (var i = 0; i < 7; i++) {
                var init = stacks[i].length - stacks[i].getFaceAmount();
                for (var j = stacks[i].length-1; j >= init; j--) {
                    var card = stacks[i].cards[j];
                    if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                        initX = card.x;
                        initY = card.y;
                        moving_cards.stack = i;
                        moving_cards.type = 'stacks';
                        while (j >= init) {
                            moving_cards.cards.push(j);
                            j--;
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }
    moveCard(id, x, y) {
        for (var i = 0; i < moving_cards.cards.length; i++) {
            this.decks[id][moving_cards.type][moving_cards.stack].cards[moving_cards.cards[i]].x = x;
            this.decks[id][moving_cards.type][moving_cards.stack].cards[moving_cards.cards[i]].y = y;
        }
    }
    placeCard(id, x, y) {
        var deck = this.decks[id];
        var hand = deck.hand;
        var stacks = deck.stacks;
        if (x > stacks[0].x && x < stacks[0].x+stacks_width && y > stacks[0].y && y < stacks[0].y+HEIGHT) {
            for (var i = 0; i < 7; i++) {
                var last_in_stack = this.decks[id][moving_cards.type][i].cards[stacks.length-1];
                if (x > last_in_stack.x && x < last_in_stack.x+WIDTH && y > last_in_stack.y && y < last_in_stack.y+HEIGHT) {
                    for (var j = 0; j < moving_cards.cards.length; j++) {
                        this.decks[id].stacks[i].addCard(this.decks[id][moving_cards.type][moving_cards.stack].cards[moving_cards.cards[j]]);
                    }
                    for (var j = 0; j < moving_cards.cards.length; j++) {
                        this.decks[id][moving_cards.type][moving_cards.stack].cards.pop();
                    }
                }
            }
        } else if (false) {

        } else {
            for (var i = 0; i < moving_cards.cards.length; i++) {
                this.decks[id][moving_cards.type][moving_cards.stack].cards[moving_cards.cards[i]].x = initX;
                this.decks[id][moving_cards.type][moving_cards.stack].cards[moving_cards.cards[i]].y = initY + i*0.33;

            }
        }
        initX = undefined;
        initY = undefined;
        moving_cards = {cards: []};
    }
    toJSON() {
        var json = {};
        // send only the last card of each ace stack
        json.aces = [];
        for (var i = 0; i < this.aces.length; i++) {
            json.aces[i] = {};
            json.aces[i].x = this.aces[i].x;
            json.aces[i].y = this.aces[i].y;
            json.aces[i].length = this.aces[i].length;
            if (this.aces[i].length > 0) {
                json.aces[i].cards = this.aces[i].cards[this.aces[i].length-1];
            }
        }
        json.decks = this.decks;
        json.players = this.players;
        return json;
    }
}