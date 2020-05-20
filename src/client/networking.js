import io from 'socket.io-client';

export var decks = {};

var socket;

export function Login(name) {
    socket = io();
    console.log(name+" found!");
    socket.emit('login', name);
    setupCallBacks();
}

function setupCallBacks() {
    socket.on('init', (msg) => {
        decks = JSON.parse(msg);
        console.log(decks);
    });
}