const Card = require('./card');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT, X_CARD_DIST, Y_CARD_DIST} = Constants;

const suits = [{suit: "hearts", color: "red"}, {suit: "diamonds", color: "red"}, {suit: "clubs", color: "black"}, {suit: "spades", color: "black"}];
const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king", "ace"];

// min and max are both inclusive
function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min+1)) + min;
}

module.exports = class Deck {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.hand = [];
        this.stacks = [];
        this.resetDeck();
        this.shuffleHand();
        this.dealCards();
        /* moving_cards stores information about the current moving card such as:
            - cursor position relative to card coords
            - type of pile it belongs to (stacks or hand)
            - stack that the cards belong to
            - and card indexes in the stack
        */
       this.moving_cards = {};
       this.moving_cards.cards = [];
       this.placed_cards = {};
       this.flipped_cards = {};
    }
    toJSON() {
        var hand = [];
        for (var i = 0; i < this.hand.length; i++) {
            hand[i] = {};
            hand[i].x = this.hand[i].x;
            hand[i].y = this.hand[i].y;
        }
        hand[0].length = this.hand[0].length('down');
        hand[1].length = this.hand[1].length('up')
        hand[1].cards = this.hand[1].cards.up;
        // send the stacks with only the cards that are face up
        var stacks = [];
        for (var i = 0; i < this.stacks.length; i++) {
            stacks[i] = {};
            stacks[i].x = this.stacks[i].x;
            stacks[i].y = this.stacks[i].y;
            stacks[i].length = this.stacks[i].length('up')+this.stacks[i].length('down');
            stacks[i].cards = [];
            for (var j = 0; j < this.stacks[i].length('up'); j++) {
                stacks[i].cards[j] = this.stacks[i].cards.up[j];
            }
        }
        return {
            hand: hand,
            stacks: stacks
        }
    }
    resetDeck() {
        // reset the hand to a brand new unshuffled deck
        this.hand.push(new Stack(-3*(WIDTH+X_CARD_DIST), HEIGHT+Y_CARD_DIST));
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 13; j++) {
                this.hand[0].addCard('down', new Card(suits[i].suit, ranks[j], i, j, suits[i].color));
            }
        }
        this.hand.push(new Stack(-2*(WIDTH+X_CARD_DIST), HEIGHT+Y_CARD_DIST));
        // empty the stacks
        for (var i = 0; i < 7; i++) {
            this.stacks[i] = new Stack(i*(WIDTH + X_CARD_DIST)+(X_CARD_DIST+WIDTH)/2, HEIGHT+Y_CARD_DIST);
        }
        this.moving_cards = {};
        this.moving_cards.cards = [];
        this.placed_cards = {};
        this.flipped_cards = {};
    }

    // based on the Fisher-Yates shuffle algorithm
    // a random card in the hand will swap with the 
    // last card that has not yet been chosen
    shuffleHand() {
        for (var i = this.hand[0].top('down'); i > 0; i--) {
            var random = generateRandomInt(0, i);
            var temp = this.hand[0].cards.down[random];
            this.hand[0].cards.down[random] = this.hand[0].cards.down[i];
            this.hand[0].cards.down[i] = temp;
        }
    }

    dealCards() {
        // fill each stack with an increasing number of cards
        // pop cards from hand as it goes into a stack
        for (var i = 0; i < 7; i++) {
            for (var j = i; j < 7; j++) {
                this.stacks[j].addCard('down', this.hand[0].cards.down.pop());
                this.stacks[j].cards.down[i].x = this.stacks[j].x;
                this.stacks[j].cards.down[i].y = this.stacks[j].y;
            }
        }
        // flip the top card of each stack
        for (var i = 0; i < 7; i++) {
            this.stacks[i].flipCard();
        }
    }
    dealThree() {
        for (var i = 0; i < 3; i++) {
            if (this.hand[0].length('down') > 0) {
                this.hand[1].addCard('up', this.hand[0].cards.down.pop());
            } else {
                break;
            }
        }
        this.hand[1].dealt = 3;
        this.hand[1].alignCards('hand');
    }
    returnToHand() {
        let length = this.hand[1].length('up');
        for (var i = 0; i < length; i++) {
            this.hand[0].addCard('down', this.hand[1].cards.up.pop());
            this.hand[0].cards.down[i].x = this.hand[0].x;
            this.hand[0].cards.down[i].y = this.hand[0].y;
        }
    }

    setMovingCards(type, stack, cards, x, y) {
        this.moving_cards.type = type;
        this.moving_cards.stack = stack;
        this.moving_cards.cards = cards;
        this.moving_cards.x = x;
        this.moving_cards.y = y;
    }
    setPlacedCards(type, stack) {
        this.placed_cards.dest = {type: type, stack: stack};
        this.placed_cards.src = {type: this.moving_cards.type, stack: this.moving_cards.stack};
    }
    setFlippedCards(type, stack) {
        this.flipped_cards.type = type;
        this.flipped_cards.stack = stack;
    }

    decideAction(x, y) {
        let hand = this.hand;
        let stacks = this.stacks;
        let index = this.checkStackCollision(x, y);
        // check mouse/hand collision
        if (this.checkCardCollision(hand[0], x, y)) {
            if (hand[0].length('down') == 0) {
                this.returnToHand();
                this.setFlippedCards('hand', 0);
                return false;
            } else {
                this.dealThree();
                this.setFlippedCards('hand', 1);
                return false;
            }
        } else if (index != undefined) {
            // if there are no up cards, flip the top down card
            if (stacks[index].length('up') == 0) {
                if (stacks[index].length('down') != 0) {
                    this.stacks[index].flipCard();
                    this.setFlippedCards('stacks', index);
                }
            } else if (stacks[index].length('up') > 0) {
                for (let j = stacks[index].top('up'); j >= 0; j--) {
                    let card = stacks[index].cards.up[j];
                    if (this.checkCardCollision(card, x, y)) {
                        let temp_j = [];
                        while (j < stacks[index].length('up')) {
                            temp_j.push(j);
                            j++;
                        }
                        this.setMovingCards('stacks', index, temp_j, x-card.x, y-card.y);
                        return true;
                    }
                }
            }
        } else if (hand[1].length('up') != 0 && this.checkCardCollision(hand[1].cards.up[hand[1].top('up')], x, y)) {
            let card = hand[1].cards.up[hand[1].top('up')];
            this.setMovingCards('hand', 1, [hand[1].top('up')], x-card.x, y-card.y);
            return true;
        }
        return false;
    }

    // returns the card at the index while removing it from its src stack
    moveCardStack(index = 0) {
        let moving = this.moving_cards;
        if (moving.type == 'hand') {
            this[moving.type][moving.stack].dealt--;
        }
        let temp = this[moving.type][moving.stack].cards.up.splice(moving.cards[index], 1);
        return temp[0];
    }

    placeCard(x, y, aces) {
        let moving = this.moving_cards;
        let top_cards = this.getTopCards();
        let collision = false;
        let index = this.checkStackCollision(x, y);
        let ace_index = this.checkStackCollision(x, y, aces);
        if (index != undefined) {
            if (top_cards.stacks[index] != undefined && (index != moving.stack || moving.type == 'hand')) {
                if (this.checkPlacement(this[moving.type][moving.stack].cards.up[moving.cards[0]], this.stacks[index], true)) {
                    this.setPlacedCards('stacks', index);
                    for (let j = 0; j < moving.cards.length; j++) {
                        this.stacks[index].addCard('up', this.moveCardStack());
                    }
                    this.stacks[index].alignCards('stacks');
                    collision = true;
                }
            }
        } else if (ace_index != undefined && moving.cards.length == 1) {
            if (this.checkPlacement(this[moving.type][moving.stack].cards.up[moving.cards[0]], aces[ace_index], false)) {
                this.setPlacedCards('aces', ace_index);
                for (let j = 0; j < moving.cards.length; j++) {
                    aces[ace_index].addCard('up', this.moveCardStack());
                }
                aces[ace_index].alignCards();
                collision = true;
                this.score++;
            }
        }
        if (!collision) {
            this.setPlacedCards(moving.type, moving.stack);
        }
        this[moving.type][moving.stack].alignCards(moving.type);
        this.moving_cards = {cards: []};
    }

    moveCardPos(x, y) {
        let temp = this.moving_cards;
        for (var i = 0; i < temp.cards.length; i++) {
            this[temp.type][temp.stack].cards.up[temp.cards[i]].x = x - temp.x;
            this[temp.type][temp.stack].cards.up[temp.cards[i]].y = y - temp.y + i*0.33*HEIGHT;
        }
    }

    // returns selected stack index
    checkStackCollision(x, y, stacks = this.stacks) {
        let index = undefined;
        for (let i = 0; i < stacks.length; i++) {
            if (x > stacks[i].x && x < stacks[i].x+WIDTH && y > stacks[i].y && y < stacks[i].y+HEIGHT*5) {
                index = i;
                break;
            }
        }
        return index;
    }
    checkCardCollision(card, x, y) {
        return x > card.x && x < card.x+WIDTH && y > card.y && y < card.y+HEIGHT;
    }
    getTopCards() {
        let top_cards = {stacks: [], aces: []};
        for (let i = 0; i < 7; i++) {
            if (this.stacks[i].cards.up.length == 0) {
                top_cards.stacks[i] = this.stacks[i];
            } else {
                top_cards.stacks[i] = this.stacks[i].cards.up[this.stacks[i].top('up')];
            }
        }
        return top_cards;
    }
    
    checkPlacement(card, dest, stack) {
        if (dest.cards.up.length == 0 || dest.cards.up == undefined) {
            if (stack) {
                return card.rank == 'king';
            } else {
                return card.rank == 'ace';
            }
        } else {
            if (stack) {
                return dest.cards.up[dest.top('up')].rank_val == card.rank_val+1 && dest.cards.up[dest.top('up')].color != card.color;
            } else {
                let card_rank = card.rank_val;
                if (card.rank_val-1 < 0) {
                    card_rank = 13;
                }
                return dest.cards.up[dest.top('up')].rank_val == card_rank-1 && dest.cards.up[dest.top('up')].suit == card.suit;
            }
        }
    }

    movingCardsUpdate(id) {
        let moving = this.moving_cards;
        let json = {};
        json.player = id;
        json.type = moving.type;
        json.stack = moving.stack;
        json.indexes = [];
        json.cards = [];
        for (let i = 0; i < moving.cards.length; i++) {
            json.indexes[i] = moving.cards[i];
            json.cards[i] = {};
            json.cards[i].x = this[moving.type][moving.stack].cards.up[moving.cards[i]].x;
            json.cards[i].y = this[moving.type][moving.stack].cards.up[moving.cards[i]].y;
        }
        return json;
    }
    placedCardsUpdate(id, aces) {
        let placed = this.placed_cards;
        let json = {};
        json.player = id;
        json.dest = placed.dest;
        if (placed.dest.type == 'aces') {
            json.dest.cards = aces[placed.dest.stack].cards.up[aces[placed.dest.stack].top('up')];
            json.aces = true;
        } else {
            json.dest.cards = this[placed.dest.type][placed.dest.stack];
        }
        json.src = placed.src;
        json.src.cards = this[placed.src.type][placed.src.stack];
        this.placed_cards[id] = {};
        return json;
    }
    flippedCardsUpdate(id) {
        let json = {};
        if (Object.keys(this.flipped_cards).length != 0) {
            let flipped = this.flipped_cards;
            json.player = id;
            json.type = flipped.type;
            json.stack = flipped.stack;
            if (flipped.type == 'hand') {
                json.cards = this[flipped.type];
            } else {
                json.cards = this[flipped.type][flipped.stack].cards.up;
            }
            this.flipped_cards = {};
        }
        return json;
    }
}