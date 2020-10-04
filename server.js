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
const questions = {}

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
    number_category=0
    console.log('Se ha iniciado una partida en la categoria '+room);
    switch (room){
    case "Geography":
      number_category=22;
      break;
    case "Sports":
      number_category=21;
      break;
    case "History":
      number_category=23;
      break;
    case "Politics":
      number_category=24;
      break;
    case "Art":
      number_category=25;
      break;
    case "Animals":
      number_category=27;
      break;
  }
  axios.get(`https://opentdb.com/api.php?amount=7&category=${number_category}&difficulty=easy&type=multiple`)
  .then(response => {
    questions[room] = response.data.results
    io.in(user.room).emit('newQuestion', questions[room].pop());
    io.in(user.room).emit('readyToPlay', true)
    console.log(questions[room]);
  });

    // if (room == "Geography") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=22&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // } else if (room == "Sports") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=21&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // } else if (room == "History") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=23&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // } else if (room == "Politics") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=24&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // } else if (room == "Art") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=25&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // } else if (room == "Animals") {
    //   axios.get('https://opentdb.com/api.php?amount=7&category=27&difficulty=easy&type=multiple')
    //     .then(response => {
    //       questions[room] = response.data.results
    //       io.in(user.room).emit('newQuestion', questions[room].pop());
    //       io.in(user.room).emit('readyToPlay', true)
    //     });
    // }

  })

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });


  socket.on('nextQuestion', () => {
    const user = getCurrentUser(socket.id);
    if(questions[user.room].length>0){
      io.in(user.room).emit('newQuestion', questions[user.room].pop());
    }
    else {
      console.log('No more questionsitas');
      const users = getRoomUsers(user.room)
      io.in(user.room).emit('ganador', users);
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
    console.log(user)

    if (user) {
      numUser = getRoomUsers(user.room)
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );
       
      if (numUser.length == 1){
        console.log(numUser.length)
        questions[user.room]=0;
        io.in(user.room).emit('ganador', numUser);
      }
      
      // io.in(user.room).emit('readyToPlay', true);

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });

});

