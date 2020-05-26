import io from 'socket.io-client';

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
    socket.on('init', (msg) => {
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
        aces = init.aces;
        game_started = true;
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}