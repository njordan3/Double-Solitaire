import io from 'socket.io-client';
import {setBoxes} from './render';
import {indexes, start, startEventListeners} from './inputs';
import {translation} from './render';

export var enemy = {};
export var me = {};
export var aces = {};
export var game_started = false;

var socket;

export function Login(name) {
    socket = io();
    console.log(name+" found!");
    socket.emit('login', name);
    setupCallBacks();
}

function setupCallBacks() {
    socket.on('update', (msg) => {
        var init = JSON.parse(msg);
        var players = Object.keys(init.decks);
        for (var i = 0; i < players.length; i++) {
            if (players[i] == socket.id) {
                me = init.decks[players[i]];
                me.name = init.players[players[i]];
            } else {
                enemy = init.decks[players[i]];
                enemy.name = init.players[players[i]];
            }
        }
        console.log(me.hand);
        aces = init.aces;
        setBoxes();
        startEventListeners();
        game_started = true;
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}

export function sendStackDrag(e) {
    var actions = {
        startX: start.x,
        startY: start.y,
        destX: -translation.x + e.clientX,
        destY: -translation.y + e.clientY,
        stack_index: indexes.i,
        cards_indexes: indexes.j
    }
    socket.emit('stack_drag', JSON.stringify(actions));
}

export function sendStackFlip() {
    var actions = {
        stack_index: indexes.i,
        cards_indexes: indexes.j
    }
    socket.emit('stack_flip', JSON.stringify(actions));
}

export function sendHandDrag(e) {
    var actions = {
        startX: start.x,
        startY: start.y,
        destX: -translation.x + e.clientX,
        destY: -translation.y + e.clientY
    };
    socket.emit('hand_drag', JSON.stringify(actions));
}

export function sendHandFlip() {
    socket.emit('hand_flip');
}