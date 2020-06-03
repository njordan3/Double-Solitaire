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
        //console.log(stacks);
        // check mouse/hand collision
        if (this.checkCardCollision(hand[0], x, y)) {
            if (hand[0].length('down') == 0) {
                this.decks[id].returnToHand();
                return false;
            } else {
                this.decks[id].dealThree();
                return false;
            }
        } else if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                // if there are no up cards, flip the top down card
                if (stacks[i].length('up') == 0) {
                    if (stacks[i].length('down') != 0) {
                        if (this.checkCardCollision(stacks[i], x, y)) {
                            this.decks[id].stacks[i].cards.down[stacks[i].top('down')].flipCard();
                        }
                    }
                } else {
                    for (let j = 0; j < stacks[i].length('up'); j++) {
                        let card = stacks[i].cards.up[j];
                        if (this.checkCardCollision(card, x, y)) {
                            let temp_j = [];
                            while (j < stacks[i].length('up')) {
                                temp_j.push(j);
                                j++;
                            }
                            this.setMovingCards(id, 'stacks', i, temp_j, x-card.x, y-card.y, card.x, card.y);
                            return true;
                        }
                    }
                }
            }
        } else if (hand[1].length('up') != 0 && this.checkCardCollision(hand[1].cards.up[hand[1].top('up')], x, y)) {
            let card = hand[1].cards.up[hand[1].top('up')];
            this.setMovingCards(id, 'hand', 1, [hand[1].top('up')], x-card.x, y-card.y, card.x, card.y);
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
            this.decks[id][temp.type][temp.stack].cards.up[temp.cards[i]].x = x - temp.x;
            this.decks[id][temp.type][temp.stack].cards.up[temp.cards[i]].y = y - temp.y;
        }
    }
    placeCard(id, x, y) {
        /*
        let moving = this.moving_cards[id];
        if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                if (i != moving.stack) {
                    let card = this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()];
                    if (this.checkCardCollision(card, x, y)) {
                        //console.log(this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()]);
                        for (let j = 0; j < moving.cards.length; j++) {
                            this.decks[id].stacks[i].addCard(this.decks[id][moving.type][moving.stack].cards[moving.cards[j]]);
                            this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()].x = this.decks[id].stacks[i].x;
                            this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()].y = this.decks[id].stacks[i].cards[this.decks[id].stacks[i].top()-1].y + HEIGHT*0.33;
                        }
                        for (let j = 0; j < moving.cards.length; j++) {
                            this.decks[id][moving.type][moving.stack].cards.pop();
                        }
                        break;
                    } else {
                        for (let j = 0; j < moving.cards.length; j++) {
                            this.decks[id][moving.type][moving.stack].cards[moving.cards[j]].x = moving.initX;
                            this.decks[id][moving.type][moving.stack].cards[moving.cards[j]].y = moving.initY + j*0.33*HEIGHT;
                        }
                    }
                }
            }
        }
        */
        this.moving_cards[id] = {cards: []};
    }
    checkStackRowCollision(id, x, y) {
        return x > this.decks[id].stacks[0].x && x < this.decks[id].stacks[0].x+stacks_width && y > this.decks[id].stacks[0].y && y < this.decks[id].stacks[0].y+4;
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
            json.aces[i].length = this.aces[i].length('up');
            if (this.aces[i].length('up') > 0) {
                json.aces[i].cards = this.aces[i].cards[this.aces[i].top('up')];
            }
        }
        json.decks = this.decks;
        json.players = this.players;
        return json;
    }
}