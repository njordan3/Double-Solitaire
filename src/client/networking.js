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
        updateGame(JSON.parse(msg));
        setBoxes();
        startEventListeners();
        game_started = true;
    });
    socket.on('update', (msg) => {
        updateGame(JSON.parse(msg));
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}

function updateGame(update) {
    console.log(update);
    me = update.me;
    enemy = update.enemy;
    aces = update.aces
}

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}