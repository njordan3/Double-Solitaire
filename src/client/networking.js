import io from 'socket.io-client';

export var enemy = {};
export var me = {};
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
        var players = Object.keys(init);
        for (var i = 0; i < players.length; i++) {
            if (players[i] == socket.id) {
                me = init[players[i]];
            } else {
                enemy = init[players[i]];
            }
            console.log(me, enemy);
        }
        game_started = true;
    });
    socket.on('server_full', function() {
        console.log("server full");
    });
}