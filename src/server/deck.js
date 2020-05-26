const Card = require('./card');
const Stack = require('./stack');
const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

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
        this.hand;
        this.stacks = [];
        this.resetDeck();
        this.shuffleHand();
        this.dealCards();
    }

    resetDeck() {
        // reset the hand to a brand new unshuffled deck
        this.hand = new Stack(0, HEIGHT*2);
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 13; j++) {
                this.hand.addCard(new Card(suits[i].suit, ranks[j], i, j, suits[i].color));
            }
        }
        // empty the stacks
        for (var i = 0; i < 7; i++) {
            this.stacks[i] = new Stack(i*WIDTH, 0);
        }
    }

    // gets the last element in the hand and remove it from the hand
    topCardInHand() {
        // return if empty
        if (this.hand.cards === undefined || this.hand.cards.length == 0) {
            return void 0;
        }
        return this.hand.cards.pop();
    }

    // based on the Fisher-Yates shuffle algorithm
    // a random card in the hand will swap with the 
    // last card that has not yet been chosen
    shuffleHand() {
        for (var i = this.hand.cards.length-1; i > 0; i--) {
            var random = generateRandomInt(0, i);
            var temp = this.hand.cards[random];
            this.hand.cards[random] = this.hand.cards[i];
            this.hand.cards[i] = temp;
        }
    }

    dealCards() {
        // fill each stack with an increasing number of cards
        // pop cards from hand as it goes into a stack
        for (var i = 0; i < 7; i++) {
            for (var j = i; j < 7; j++) {
                this.stacks[j].addCard(this.topCardInHand());
            }
        }
        // flip the top card of each stack
        for (var i = 0; i < 7; i++) {
            this.stacks[i].cards[this.length-1].flipCard();
        }
    }
}