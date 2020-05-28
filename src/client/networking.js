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
    socket.on('update', (msg) => {
        var update = JSON.parse(msg);
        console.log(update);
        me = update.me;
        enemy = update.enemy;
        aces = update.aces
        setBoxes();
        startEventListeners();
        game_started = true;
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}