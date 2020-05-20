const Card = require('./card');


const suits = [{suit: "clubs", color: "black"}, {suit: "diamonds", color: "red"}, {suit: "hearts", color: "red"}, {suit: "spades", color: "black"}];
const ranks = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];

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

    resetDeck() {
        // reset the hand to a brand new unshuffled deck
        var count = 0;
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 13; j++) {
                this.hand[count] = new Card(suits[i].suit, ranks[j], j, suits[i].color);
                count += 1;
            }
        }
        // empty the stacks
        for (var i = 0; i < 7; i++) {
            this.stacks[i] = [];
        }
    }

    // gets the last element in the hand and remove it from the hand
    topCardInHand() {
        // return if empty
        if (this.hand === undefined || this.hand.length == 0) {
            return void 0;
        }
        return this.hand.pop();
    }

    // based on the Fisher-Yates shuffle algorithm
    // a random card in the hand will swap with the 
    // last card that has not yet been chosen
    shuffleHand() {
        for (var i = this.hand.length-1; i > 0; i--) {
            var random = generateRandomInt(0, i);
            var temp = this.hand[random];
            this.hand[random] = this.hand[i];
            this.hand[i] = temp;
        }
    }

    dealCards() {
        // fill each stack with an increasing number of cards
        // pop cards from hand as it goes into a stack
        for (var i = 0; i < 7; i++) {
            for (var j = i; j < 7; j++) {
                this.stacks[j][i] = this.topCardInHand();
            }
        }
        // flip the top card of each stack
        for (var i = 0; i < 7; i++) {
            this.stacks[i][this.stacks[i].length-1].flipCard();
        }
    }
}