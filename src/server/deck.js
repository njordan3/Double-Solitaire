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
    constructor() {
        this.hand = [];
        this.stacks = [];
        this.resetDeck();
        this.shuffleHand();
        this.dealCards();
    }
    toJSON() {
        // send the hand with only the three top cards in the flip pile
        var hand = [];
        for (var i = 0; i < this.hand.length; i++) {
            hand[i] = {};
            hand[i].x = this.hand[i].x;
            hand[i].y = this.hand[i].y;
            hand[i].length = this.hand[i].length();
        }
        if (this.hand[1].length() > 0) {
            hand[1].cards = [];
            for (var i = this.hand[1].length()-3; i < this.hand[1].length(); i++) {
                if (this.hand[1].cards[i] != null) {
                    hand[1].cards.push(this.hand[1].cards[i]);
                }
            }
        }
        // send the stacks with only the cards that are face up
        var stacks = [];
        for (var i = 0; i < this.stacks.length; i++) {
            stacks[i] = {};
            stacks[i].x = this.stacks[i].x;
            stacks[i].y = this.stacks[i].y;
            stacks[i].length = this.stacks[i].length();
            stacks[i].cards = [];
            var temp = 0;
            for (var j = 0; j < this.stacks[i].length(); j++) {
                if (this.stacks[i].cards[j].face) {
                    stacks[i].cards[temp] = this.stacks[i].cards[j];
                    temp++;
                }
            }
        }
        return {
            hand: hand,
            stacks: stacks
        }
    }
    resetDeck() {
        // reset the hand to a brand new unshuffled deck
        this.hand.push(new Stack(0, -(HEIGHT+Y_CARD_DIST)));
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 13; j++) {
                this.hand[0].addCard(new Card(suits[i].suit, ranks[j], i, j, suits[i].color));
            }
        }
        this.hand.push(new Stack(WIDTH+X_CARD_DIST, -(HEIGHT+Y_CARD_DIST)));
        // empty the stacks
        for (var i = 0; i < 7; i++) {
            this.stacks[i] = new Stack(i*(WIDTH + X_CARD_DIST)+(X_CARD_DIST+WIDTH)/2, HEIGHT+Y_CARD_DIST);
        }
    }

    // gets the last element in the hand and remove it from the hand
    topCardInHand(index) {
        // return if empty
        if (this.hand[index].cards === undefined || this.hand[index].length() == 0) {
            return void 0;
        }
        return this.hand[index].cards.pop();
    }

    // based on the Fisher-Yates shuffle algorithm
    // a random card in the hand will swap with the 
    // last card that has not yet been chosen
    shuffleHand() {
        for (var i = this.hand[0].top(); i > 0; i--) {
            var random = generateRandomInt(0, i);
            var temp = this.hand[0].cards[random];
            this.hand[0].cards[random] = this.hand[0].cards[i];
            this.hand[0].cards[i] = temp;
        }
    }

    dealCards() {
        // fill each stack with an increasing number of cards
        // pop cards from hand as it goes into a stack
        for (var i = 0; i < 7; i++) {
            for (var j = i; j < 7; j++) {
                this.stacks[j].addCard(this.topCardInHand(0));
                this.stacks[j].cards[i].x = this.stacks[j].x;
                this.stacks[j].cards[i].y = this.stacks[j].y;
            }
        }
        // flip the top card of each stack
        for (var i = 0; i < 7; i++) {
            this.stacks[i].cards[this.stacks[i].top()].flipCard();
        }
    }
    dealThree() {
        for (var i = 0; i < 3; i++) {
            if (this.hand[0].length !== 0) {
                this.hand[1].addCard(this.topCardInHand(0));
                this.hand[1].cards[this.hand[1].top()].flipCard();
            }
        }
    }
    returnToHand() {
        for (var i = 0; i < this.hand[1].length; i++) {
            this.hand[0].addCard(this.hand[1].cards[i]);
            this.hand[0].cards[i].flipCard();
        }
        this.hand[1].cards = [];
        this.hand[1].length = 0;
    }
}