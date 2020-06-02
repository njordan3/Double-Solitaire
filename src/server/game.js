const Deck = require('./deck');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST, STACK_HITBOX} = Constants;

var stacks_width = WIDTH*7+X_CARD_DIST*6;
var aces_width = WIDTH*8+X_CARD_DIST*7;

module.exports = class Game {
    constructor() {
        this.decks = {};
        this.players = {count: 0};
        this.aces = [];
        /* moving_cards stores information about the current moving card such as:
            - cursor position relative to card coords
            - type of pile it belongs to (stacks or hand)
            - stack that the cards belong to
            - and card indexes in the stack
        */
        this.moving_cards = {};
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
    }
    addPlayer(id, name) {
        this.decks[id] = new Deck();
        this.players[id] = name;
        this.players.count++;
        this.moving_cards[id] = {};
        this.moving_cards[id].cards = [];
    }
    removePlayer(id) {
        delete this.decks[id];
        delete this.players[id];
        this.players.count--;
        delete this.moving_cards[id];
    }
    decideAction(id, x, y) {
        let deck = this.decks[id];
        let hand = deck.hand;
        let stacks = deck.stacks;
        // check mouse/hand collision
        if (this.checkCardCollision(hand[0], x, y)) {
            if (hand.length == 0) {
                this.decks[id].returnToHand();
                return false;
            } else {
                this.decks[id].dealThree();
                return false;
            }
        } else if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                let init = stacks[i].length() - stacks[i].getFaceAmount();
                // if face amount is 0, check if player wants to flip the card
                if (init >= stacks[i].length()) {
                    if (this.checkCardCollision(stacks[i].cards[stacks[i].top()], x, y)) {
                        this.decks[id].stacks[i].cards[stacks[i].top()].flipCard();
                    }
                } else {
                    for (let j = init; j < stacks[i].length(); j++) {
                        let card = stacks[i].cards[j];
                        if (this.checkCardCollision(card, x, y)) {
                            let temp_j = [];
                            while (j < stacks[i].length()) {
                                temp_j.push(j);
                                j++;
                            }
                            this.setMovingCards(id, 'stacks', i, temp_j, x-card.x, y-card.y, card.x, card.y);
                            return true;
                        }
                    }
                }
            }
        } else if (hand[1].length() != 0 && this.checkCardCollision(hand[1].cards[hand[1].top()], x, y)) {
            let card = hand[1].cards[hand[1].top()];
            this.setMovingCards(id, 'hand', 1, [hand[1].top()], x-card.x, y-card.y, card.x, card.y);
            return true;
        }
        return false;
    }
    setMovingCards(id, type, i, j, x, y, initX, initY) {
        this.moving_cards[id].type = type;
        this.moving_cards[id].stack = i;
        this.moving_cards[id].cards = j;
        this.moving_cards[id].x = x;
        this.moving_cards[id].y = y;
        this.moving_cards[id].initX = initX;
        this.moving_cards[id].initY = initY;
    }
    moveCard(id, x, y) {
        let temp = this.moving_cards[id];
        for (var i = 0; i < temp.cards.length; i++) {
            this.decks[id][temp.type][temp.stack].cards[temp.cards[i]].x = x - temp.x;
            this.decks[id][temp.type][temp.stack].cards[temp.cards[i]].y = y - temp.y;
        }
    }
    placeCard(id, x, y) {
        //let stack = this.decks[id][this.moving_cards.type][this.moving_cards.stack];
        let moving = this.moving_cards[id];
        if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                let card = this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()];
                if (this.checkCardCollision(card, x, y)) {
                    for (let j = 0; j < moving.cards.length; j++) {
                        this.decks[id].stacks[i].addCard(this.decks[id][moving.type][moving.stack].cards[moving.cards[j]]);
                        this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()].x = this.decks[id].stacks[i].x;
                    }
                    break;
                }
            }
        }
        this.moving_cards[id] = {cards: []};
    }
    checkStackRowCollision(id, x, y) {
        return x > this.decks[id].stacks[0].x && x < this.decks[id].stacks[0].x+stacks_width && y > this.decks[id].stacks[0].y && y < this.decks[id].stacks[0].y+HEIGHT;
    }
    checkAceRowCollision(x, y) {
        return x > this.aces[0].x && x < this.aces[0].x+WIDTH && y > this.aces[0].y && y < this.aces[0].y+HEIGHT;
    }
    checkCardCollision(card, x, y) {
        return x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT;
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