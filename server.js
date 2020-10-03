const axios = require('axios');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const users = [];

server.listen(process.env.PORT || 3000);
console.log('Servidor en ejecucion...');
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'Asistente QuizUP';

// Join user to chat
function userJoin(id, username, room, puntaje, flag) {
  const user = { id, username, room, puntaje, flag };
  users.push(user);
  console.log('Nueva conexión: %s sockets conectados', users.length);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    console.log('Se ha cerrado una conexion: %s sockets conectados ', users.length - 1)
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room, 0, 0);
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));
    if (getRoomUsers(user.room).length >= 2) {
      io.in(user.room).emit('readyToPlay', false);
    };

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });


  });

  //Inicia el juego genera 7 preguntas y las va eliminando
  socket.on('playQuiz', () => {
    const user = getCurrentUser(socket.id);
    const room = user.room;
    console.log('Se ha iniciado una partida en la categoria '+room);
    if (room == "Geography") {
      axios.get('https://opentdb.com/api.php?amount=7&category=22&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    } else if (room == "Sports") {
      axios.get('https://opentdb.com/api.php?amount=7&category=21&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    } else if (room == "History") {
      axios.get('https://opentdb.com/api.php?amount=7&category=23&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    } else if (room == "Politics") {
      axios.get('https://opentdb.com/api.php?amount=7&category=24&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    } else if (room == "Art") {
      axios.get('https://opentdb.com/api.php?amount=7&category=25&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    } else if (room == "Animals") {
      axios.get('https://opentdb.com/api.php?amount=7&category=27&difficulty=easy&type=multiple')
        .then(response => {
          questions = response.data.results
          io.in(user.room).emit('newQuestion', questions.pop());
          io.in(user.room).emit('readyToPlay', true)
        });
    }

  })

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });


  socket.on('nextQuestion', () => {
    const user = getCurrentUser(socket.id);
    try {
      io.in(user.room).emit('newQuestion', questions.pop());
    } catch (error) {

    }
    try {
      const users = getRoomUsers(user.room)
      io.in(user.room).emit('ganador', users);
    } catch (error) {

    }


  })

  //Actualiza el puntaje cuando una respuesta es correcta
  socket.on('respuestaBuena', () => {
    const user = getCurrentUser(socket.id);
    user.puntaje += 2;
    user.flag = 1;
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  })

  //Actualiza el puntaje cuando una respuesta es incorrecta
  socket.on('respuestaMala', () => {
    const user = getCurrentUser(socket.id);
    user.puntaje -= 1;
    user.flag = 1;
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  })

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      io.in(user.room).emit('readyToPlay', true);

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });

});

