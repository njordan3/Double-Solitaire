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
        if (x > hand[0].x && x < hand[0].x+WIDTH && y > hand[0].y && y < hand[0].y+HEIGHT) {
            if (hand.length() == 0) {
                this.decks[id].returnToHand();
                return false;
            } else {
                this.decks[id].dealThree();
                return false;
            }
        } else if (x > stacks[0].x && x < stacks[0].x+stacks_width && y > stacks[0].y && y < stacks[0].y+HEIGHT) {
            for (var i = 0; i < 7; i++) {
                let init = stacks[i].length() - stacks[i].getFaceAmount();
                // if face amount is 0, check if player wants to flip the card
                if (init >= stacks[i].length()) {
                    let card = stacks[i].cards[stacks[i].top()];
                    if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                        this.decks[id].stacks[i].cards[stacks[i].top()].flipCard();
                    }
                } else {
                    for (var j = init; j < stacks[i].length(); j++) {
                        let card = stacks[i].cards[j];
                        if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                            let temp_j = [];
                            while (j < stacks[i].length()) {
                                temp_j.push(j);
                                j++;
                            }
                            this.setMovingCards(id, 'stacks', i, temp_j, x-card.x, y-card.y, x, y);
                            return true;
                        }
                    }
                }
            }
        } else if (hand[1].length() != 0 && x > hand[1].cards[hand[1].top()].x && x < hand[1].cards[hand[1].top()].x+WIDTH &&
                   y > hand[1].cards[hand[1].top()].y && y < hand[1].cards[hand[1].top()].y+HEIGHT) {
            this.setMovingCards(id, 'hand', 1, [hand[1].top()], x-card.x, y-card.y, x, y);
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
            this.decks[id][temp.type][temp.stack].cards[temp.cards[i]].y = y - temp.y + i*0.33;
        }
    }
    placeCard(id, x, y) {
        let temp = this.moving_cards[id];
        for (var i = 0; i < 7; i++) {
            let card = this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()];
            if (x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT) {
                for (var j = 0; j < temp.cards.length; j++) {
                    console.log(this.decks[id].stacks[i].top());
                    this.decks[id].stacks[i].addCard(this.decks[id].stacks[temp.stack].cards[temp.cards[j]]);
                    console.log(this.decks[id].stacks[i].top());
                    this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()].x = this.decks[id].stacks[i].x;
                    this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()].y = card.y + (j+1)*0.33;
                }
                for (var j = 0; j < temp.cards.length; j++) {
                    this.decks[id].stacks[temp.stack].cards.pop();
                }
                break;
            }
        }
        this.moving_cards[id] = {cards: []};
    }
    toJSON() {
        return {
            decks: this.decks,
            players: this.players,
            aces: this.aces
        };
    }
}