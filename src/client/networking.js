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
        setBoxes();
        startEventListeners();
        game_started = true;
        
    });
    socket.on('update', (msg) => {
        readUpdate(msg);
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}

function readUpdate(msg) {
    var update = JSON.parse(msg);
    console.log(update);
    var players = Object.keys(update.decks);
    for (var id in players) {
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

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}