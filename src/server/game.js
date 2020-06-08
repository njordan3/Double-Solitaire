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
                            this.decks[id].stacks[i].flipCard();
                            break;
                        }
                    }
                } else {
                    for (let j = stacks[i].top('up'); j >= 0; j--) {
                        let card = stacks[i].cards.up[j];
                        if (this.checkCardCollision(card, x, y)) {
                            let temp_j = [];
                            while (j < stacks[i].length('up')) {
                                temp_j.push(j);
                                j++;
                            }
                            this.setMovingCards(id, 'stacks', i, temp_j, x-card.x, y-card.y);
                            return true;
                        }
                    }
                }
            }
        } else if (hand[1].length('up') != 0 && this.checkCardCollision(hand[1].cards.up[hand[1].top('up')], x, y)) {
            let card = hand[1].cards.up[hand[1].top('up')];
            this.setMovingCards(id, 'hand', 1, [hand[1].top('up')], x-card.x, y-card.y);
            return true;
        }
        return false;
    }
    setMovingCards(id, type, i, j, x, y) {
        this.moving_cards[id].type = type;
        this.moving_cards[id].stack = i;
        this.moving_cards[id].cards = j;
        this.moving_cards[id].x = x;
        this.moving_cards[id].y = y;
    }
    moveCardPos(id, x, y) {
        let temp = this.moving_cards[id];
        for (var i = 0; i < temp.cards.length; i++) {
            this.decks[id][temp.type][temp.stack].cards.up[temp.cards[i]].x = x - temp.x;
            this.decks[id][temp.type][temp.stack].cards.up[temp.cards[i]].y = y - temp.y;
        }
    }
    moveCardStack(id, index = 0) {
        let moving = this.moving_cards[id];
        if (moving.type == 'hand') {
            this.decks[id][moving.type][moving.stack].dealt--;
        }
        let temp = this.decks[id][moving.type][moving.stack].cards.up.splice(moving.cards[index], 1);
        return temp[0];
    }
    placeCard(id, x, y) {
        let moving = this.moving_cards[id];
        let top_cards = this.getTopCards(id);
        console.log(top_cards);
        if (this.checkStackRowCollision(id, x, y)) {
            let collision = false;
            for (let i = 0; i < 7; i++) {
                if (top_cards.stacks[i] != undefined && (i != moving.stack || moving.type == 'hand')) {
                    if (this.checkCardCollision(top_cards.stacks[i], x, y) && this.checkPlacement(this.decks[id][moving.type][moving.stack].cards.up[moving.cards[0]], this.decks[id].stacks[i], true)) {
                        for (let j = 0; j < moving.cards.length; j++) {
                            this.decks[id].stacks[i].addCard('up', this.moveCardStack(id));
                        }
                        this.decks[id].stacks[i].alignCards('stacks');
                        collision = true;
                        break;
                    }
                }
            }
            if (!collision) {
                this.decks[id][moving.type][moving.stack].alignCards(moving.type);
            }
        } else if (this.checkAceRowCollision(x, y) && moving.cards.length == 1) {
            let collision = false;
            for (let i = 0; i < 8; i++) {
                if (this.checkCardCollision(this.aces[i], x, y) && this.checkPlacement(this.decks[id][moving.type][moving.stack].cards.up[moving.cards[0]], this.aces[i], false)) {
                    for (let j = 0; j < moving.cards.length; j++) {
                        this.aces[i].addCard('up', this.moveCardStack(id));
                    }
                    this.aces[i].alignCards();
                    collision = true;
                    break;
                }
            }
            if (!collision) {
                this.decks[id][moving.type][moving.stack].alignCards(moving.type);

            }
        } else {
            this.decks[id][moving.type][moving.stack].alignCards(moving.type);
        }
        this.moving_cards[id] = {cards: []};
    }
    checkPlacement(card, dest, stack) {
        if (dest.cards.up.length == 0 || dest.cards.up == undefined) {
            if (stack) {
                if (card.rank == 'king') {
                    return true;
                }
            } else {
                if (card.rank == 'ace') {
                    return true;
                }
            }
        } else {
            if (stack) {
                if (dest.cards.up[dest.top('up')].rank_val == card.rank_val+1 && dest.cards.up[dest.top('up')].color != card.color) {
                    return true;
                }
            } else {
                let card_rank = card.rank_val;
                if (card.rank_val-1 < 0) {
                    card_rank = 13;
                }
                if (dest.cards.up[dest.top('up')].rank_val == card_rank-1 && dest.cards.up[dest.top('up')].suit == card.suit) {
                    return true;
                }
            }
        }
        return false;
    }
    checkStackRowCollision(id, x, y) {
        return x > this.decks[id].stacks[0].x && x < this.decks[id].stacks[0].x+stacks_width && y > this.decks[id].stacks[0].y && y < this.decks[id].stacks[0].y+HEIGHT*4;
    }
    checkAceRowCollision(x, y) {
        return x > this.aces[0].x && x < this.aces[0].x+aces_width && y > this.aces[0].y && y < this.aces[0].y+HEIGHT;
    }
    checkCardCollision(card, x, y) {
        console.log("here");
        return x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT;
    }
    getTopCards(id) {
        let top_cards = {stacks: [], aces: []};
        for (let i = 0; i < 7; i++) {
            if (this.decks[id].stacks[i].cards.up.length == 0) {
                top_cards.stacks[i] = this.decks[id].stacks[i];
            } else {
                top_cards.stacks[i] = this.decks[id].stacks[i].cards.up[this.decks[id].stacks[i].top('up')];
            }
        }
        return top_cards;
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
                json.aces[i].cards = this.aces[i].cards.up[this.aces[i].top('up')];
            }
        }
        json.decks = this.decks;
        json.players = this.players;
        return json;
    }
}