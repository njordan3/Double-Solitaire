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
        this.placed_cards = {};
        this.flipped_cards = {};
        for (var i = 0; i < 8; i++) {
            this.aces[i] = new Stack(i*(WIDTH+X_CARD_DIST), 0);
        }
    }
    addPlayer(id, name) {
        this.decks[id] = new Deck();
        this.players[id] = name;
        this.players.count++;
        this.moving_cards[id] = {};
        this.placed_cards[id] = {};
        this.flipped_cards[id] = {};
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
                this.setFlippedCards(id, 'hand', 0);
                return false;
            } else {
                this.decks[id].dealThree();
                this.setFlippedCards(id, 'hand', 1);
                return false;
            }
        } else if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                // if there are no up cards, flip the top down card
                if (stacks[i].length('up') == 0) {
                    if (stacks[i].length('down') != 0) {
                        if (this.checkCardCollision(stacks[i], x, y)) {
                            this.decks[id].stacks[i].flipCard();
                            this.setFlippedCards(id, 'stacks', i);
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
    setMovingCards(id, type, stack, cards, x, y) {
        this.moving_cards[id].type = type;
        this.moving_cards[id].stack = stack;
        this.moving_cards[id].cards = cards;
        this.moving_cards[id].x = x;
        this.moving_cards[id].y = y;
    }
    setPlacedCards(id, type, stack) {
        this.placed_cards[id].dest = {type: type, stack: stack};
        this.placed_cards[id].src = {type: this.moving_cards[id].type, stack: this.moving_cards[id].stack};
    }
    setFlippedCards(id, type, stack) {
        this.flipped_cards[id].type = type;
        this.flipped_cards[id].stack = stack;
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
        let collision = false;
        if (this.checkStackRowCollision(id, x, y)) {
            for (let i = 0; i < 7; i++) {
                if (top_cards.stacks[i] != undefined && (i != moving.stack || moving.type == 'hand')) {
                    if (this.checkCardCollision(top_cards.stacks[i], x, y) && this.checkPlacement(this.decks[id][moving.type][moving.stack].cards.up[moving.cards[0]], this.decks[id].stacks[i], true)) {
                        this.setPlacedCards(id, 'stacks', i);
                        for (let j = 0; j < moving.cards.length; j++) {
                            this.decks[id].stacks[i].addCard('up', this.moveCardStack(id));
                        }
                        this.decks[id].stacks[i].alignCards('stacks');
                        collision = true;
                        break;
                    }
                }
            }
        } else if (this.checkAceRowCollision(x, y) && moving.cards.length == 1) {
            for (let i = 0; i < 8; i++) {
                if (this.checkCardCollision(this.aces[i], x, y) && this.checkPlacement(this.decks[id][moving.type][moving.stack].cards.up[moving.cards[0]], this.aces[i], false)) {
                    this.setPlacedCards(id, 'aces', i);
                    for (let j = 0; j < moving.cards.length; j++) {
                        this.aces[i].addCard('up', this.moveCardStack(id));
                    }
                    this.aces[i].alignCards();
                    collision = true;
                    break;
                }
            }
        }
        if (!collision) {
            this.setPlacedCards(id, moving.type, moving.stack);
        }
        this.decks[id][moving.type][moving.stack].alignCards(moving.type);
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
        json.decks = this.decks;
        json.players = this.players;
        return json;
    }
    movingCardsUpdate(id) {
        let moving = this.moving_cards[id];
        let json = {};
        json.player = id;
        json.type = moving.type;
        json.stack = moving.stack;
        json.indexes = [];
        json.cards = [];
        for (let i = 0; i < moving.cards.length; i++) {
            json.indexes[i] = moving.cards[i];
            json.cards[i] = {};
            json.cards[i].x = this.decks[id][moving.type][moving.stack].cards.up[moving.cards[i]].x;
            json.cards[i].y = this.decks[id][moving.type][moving.stack].cards.up[moving.cards[i]].y;
        }
        return json;
    }
    placedCardsUpdate(id) {
        let placed = this.placed_cards[id];
        let json = {};
        json.player = id;
        json.dest = placed.dest;
        if (placed.dest.type == 'aces') {
            json.dest.cards = this.aces[placed.dest.stack].cards.up[this.aces[placed.dest.stack].top('up')];
            json.aces = true;
        } else {
            json.dest.cards = this.decks[id][placed.dest.type][placed.dest.stack];
        }
        json.src = placed.src;
        json.src.cards = this.decks[id][placed.src.type][placed.src.stack];
        this.placed_cards[id] = {};
        return json;
    }
    flippedCardsUpdate(id) {
        let json = {};
        if (Object.keys(this.flipped_cards[id]).length != 0) {
            let flipped = this.flipped_cards[id];
            json.player = id;
            json.type = flipped.type;
            json.stack = flipped.stack;
            let temp = JSON.parse(JSON.stringify(this.decks[id]));
            if (flipped.type == 'hand') {
                json.cards = temp[flipped.type];
            } else {
                json.cards = temp[flipped.type][flipped.stack].cards;
            }
            this.flipped_cards[id] = {};
        }
        return json;
    }
}