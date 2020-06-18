import io from 'socket.io-client';
import {setBoxes} from './render';
import {startEventListeners} from './inputs';

export var enemy = {};
export var me = {};
export var aces = {};
export var game_started = false;
export var cancel_events = false;

var socket;

export function Login(name) {
    socket = io();
    console.log(name+" found!");
    socket.emit('login', name);
    setupCallBacks();
}

function setupCallBacks() {
    socket.on('init', (msg) => {
        readUpdate(msg);
        console.log(enemy);
        setBoxes();
        if (!game_started) {
            startEventListeners();
            game_started = true;
        }
    });
    socket.on('update', (msg) => {
        readUpdate(msg);
    });
    socket.on('moving', (msg) => {
        let update = JSON.parse(msg);
        processMovingCards(update, socket.id);
    });
    socket.on('placed', (msg) => {
        let update = JSON.parse(msg);
        processPlacedCards(update, socket.id);
    });
    socket.on('flip', (msg) => {
        let update = JSON.parse(msg);
        processFlippedCards(update, socket.id);
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}

function readUpdate(msg) {
    let update = JSON.parse(msg);
    let players = Object.keys(update.decks);
    for (let id in players) {
        if (players[id] == socket.id) {
            me = update.decks[players[id]];
            me.name = update.players[id];
        } else {
            enemy = update.decks[players[id]];
            enemy.name = update.players[id];
        }
    }
    aces = update.aces;
}
function processMovingCards(msg, id) {
    if (msg.player == id) {
        for (let i = 0; i < msg.cards.length; i++) {
            me[msg.type][msg.stack].cards[msg.indexes[i]].x = msg.cards[i].x;
            me[msg.type][msg.stack].cards[msg.indexes[i]].y = msg.cards[i].y;
        }
    } else {
        for (let i = 0; i < msg.cards.length; i++) {
            enemy[msg.type][msg.stack].cards[msg.indexes[i]].x = msg.cards[i].x;
            enemy[msg.type][msg.stack].cards[msg.indexes[i]].y = msg.cards[i].y;
        }
    }
}
function processPlacedCards(msg, id) {
    if (msg.player == id) {
        if (msg.aces) {
            aces[msg.dest.stack].cards = msg.dest.cards;
        } else {
            me[msg.dest.type][msg.dest.stack] = msg.dest.cards;
        }
        me[msg.src.type][msg.src.stack] = msg.src.cards;
    } else {
        if (msg.aces) {
            aces[msg.dest.stack].cards = msg.dest.cards;
        } else {
            enemy[msg.dest.type][msg.dest.stack] = msg.dest.cards;
        }
        enemy[msg.src.type][msg.src.stack] = msg.src.cards;
    }
}
function processFlippedCards(msg, id) {
    if (msg.player == id) {
        if (msg.type == 'hand') {
            me[msg.type] = msg.cards;
        } else {
            me[msg.type][msg.stack].cards = msg.cards;
        }
    } else {
        if (msg.type == 'hand') {
            enemy[msg.type] = msg.cards;
        } else {
            enemy[msg.type][msg.stack].cards = msg.cards;
        }
    }
}

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}