//https://www.codementor.io/@mayowa.a/how-to-build-a-simple-session-based-authentication-system-with-nodejs-from-scratch-6vn67mcy3

const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');
const { send } = require('process');

const port = 3000;
var sockets = {};
var game = new Game(sendUpdateToPlayers);

var skip_events = {};

const errorMsg = {
    server_full: "Game is full",
    mid_game: "Someone tried to join mid game"
}

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('dist'));

http.listen(port, () => {
    console.log(`http://localhost:${port}/`);
    console.log('listening on port: '+port);
});

io.on('connection', function(socket) {
    //socket emit init here?
    socket.on('login', function(input) {
        try {
            game.addPlayer(socket.id, input);
            sockets[socket.id] = socket;
            skip_events[socket.id] = false;
            socket.emit('init', JSON.stringify(game));
            sendUpdateToPlayers('update', game);
        } catch (error) {
            console.error(errorMsg[error]);
            socket.emit(error);
        }
    });
    socket.on('disconnect', function() {
        if (sockets[socket.id] != undefined) {
            game.removePlayer(socket.id);
            delete sockets[socket.id];
            delete skip_events[socket.id];
            sendUpdateToPlayers('update', game);
        }
    });
    socket.on('ready', function () {
        game.toggleReady(socket.id);
    });
    socket.on('done', function() {
        game.toggleDone(socket.id);
    });
    socket.on('again', function () {
        game.toggleAgain(socket.id);
    });
    socket.on('mousedown', function(input) {
        try {
            let coords = JSON.parse(input);
            if (!game.mouseDown(socket.id, coords.x, coords.y)) {
                skip_events[socket.id] = true;
                let update = game.flippedCardsUpdate(socket.id);
                if (Object.keys(update).length != 0) {
                    sendUpdateToPlayers('flip', update);
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
    socket.on('mousemove', function(input) {
       try {
            if (!skip_events[socket.id]) {
                let coords = JSON.parse(input);
                game.mouseMove(socket.id, coords.x, coords.y);
                let update = game.movingCardsUpdate(socket.id);
                sendUpdateToPlayers('moving', update);
            }
        } catch (error) {
            console.error(error);
        }
    });
    socket.on('mouseup', function(input) {
        try {
            if (!skip_events[socket.id]) {
                let coords = JSON.parse(input);
                game.mouseUp(socket.id, coords.x, coords.y);
                let update = game.placedCardsUpdate(socket.id);
                sendUpdateToPlayers('placed', update);
            }
            skip_events[socket.id] = false;
        } catch (error) {
            console.error(error);
        }
    });
});

function sendUpdateToPlayers(type, update, message = undefined) {
    // silly way to add message
    update = JSON.parse(JSON.stringify(update));
    update.message = message;
    for (var id in sockets) {
        sockets[id].emit(type, JSON.stringify(update));
    }
}