import io from 'socket.io-client';
import {setBoxes} from './render';
import {startEventListeners} from './inputs';

export var enemy = {};
export var me = {};
export var aces = {};
export var cancel_events = false;

var socket;

export function Login(name, timeout = 10000) {
    socket = io();
    console.log(name+" found!");
    setupCallBacks();
    return new Promise((resolve, reject) => {
        let timer
        socket.emit('login', name);
        socket.once('init', (msg) => {
            readUpdate(msg);
            setBoxes();
            startEventListeners();
            resolve('init received');
            clearTimeout(timer);
        });
        timer = setTimeout(() => {
            reject(new Error("timeout waiting to login"));
        }, timeout);
    });
}

function setupCallBacks() {
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
    console.log(aces);
}

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}