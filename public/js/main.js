const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('category-name');
const userList = document.getElementById('users');
const userName = document.getElementById('userName');
const playButton = document.getElementById('play');
const nextButton = document.getElementById('next');
const preguntas = document.getElementById('preguntas');
const finJuego = document.getElementById('finJuego');
const ganador1 = document.getElementById('ganador');
const answer1 = document.getElementById('answer1');
const answer2 = document.getElementById('answer2');
const answer3 = document.getElementById('answer3');
const answer4 = document.getElementById('answer4');
const winnerImg = document.getElementById('winner-img');
const equalsImg = document.getElementById('equals-img');
const answers = [answer1, answer2, answer3, answer4];
const container = document.getElementById('container');
const fullRoom = document.getElementById('fullRoom');
const good = document.getElementById('good');
const bad = document.getElementById('bad');

document.getElementById('countdown').style.display = 'inline';
document.getElementById('imgTimer').style.display = 'none';
finJuego.style.display = 'none';
answer2.style.display = 'none';
answer3.style.display = 'none';
answer4.style.display = 'none';
answer1.style.display = 'none';
playButton.disabled = true;
var tiempoTotal = 7;
contQues = 7;
var a;
var b;
regresiveCount = 0;

answers[0].addEventListener("click", buena);
answers[1].addEventListener("click", mala);
answers[2].addEventListener("click", mala);
answers[3].addEventListener("click", mala);

function group(info) {
  grid = [];
  for (i = 1; i <= 4; i++) {
    grid.push(document.getElementsByClassName('user'.concat(i))[0].children[info].children[0]);
  }
  return grid;
}
usersGr = group(0);
pointsgr = group(1);
avatarGr = group(2)

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

socket.on('salaLlena',() => {
  container.style.display='none';
  fullRoom.style.display='inline';
  fullRoom.style.visibility='visible';

});

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('readyToPlay', status => {
  playButton.disabled = status;
})

// Message from server
socket.on('message', message => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Actualizar ganador cada pregunta
socket.on('ganador', users => {
  finJuego.style.display = 'inline';
  preguntas.style.display = 'none';
  document.getElementById('countdown').style.display = 'none';
  document.getElementById('imgTimer').style.display = 'none';
  clearInterval(a);
  clearInterval(b)
  let max = -300000;
  let ganador = '';
  users.forEach(element => {
    if (element.puntaje > max) {
      max = element.puntaje;
    }
  });
  ganador = users.filter(user => user.puntaje == max)
  if (ganador.length > 1) {
    ganador1.innerHTML = `Tie`
    equalsImg.style.display = 'inline';
  } else {
    ganador1.innerHTML = `The winner is: ${ganador[0].username}`
    winnerImg.style.display = 'inline';
  }

});

//Nueva pregunta con las opciones desordenadas
socket.on('newQuestion', data => {
  answers[0].style.backgroundColor = 'white';
  answers[1].style.backgroundColor = 'white';
  answers[2].style.backgroundColor = 'white';
  answers[3].style.backgroundColor = 'white';
  preguntas.style.display = 'inline';
  document.getElementById('countdown').style.display = 'inline';
  document.getElementById('imgTimer').style.display = 'inline';
  answers.sort(function () { return 0.5 - Math.random() })
  answers[0].removeEventListener("click", mala);
  answers[0].addEventListener("click", buena);
  answers[1].removeEventListener("click", buena);
  answers[1].addEventListener("click", mala);
  answers[2].removeEventListener("click", buena);
  answers[2].addEventListener("click", mala);
  answers[3].removeEventListener("click", buena);
  answers[3].addEventListener("click", mala);
  document.querySelector("#question").innerHTML = `Question: ${data.question}`
  answers[0].innerHTML = `${data.correct_answer}`
  answers[1].innerHTML = `${data.incorrect_answers[0]}`
  answers[2].innerHTML = `${data.incorrect_answers[1]}`
  answers[3].innerHTML = `${data.incorrect_answers[2]}`
  answers[0].style.display = 'inline';
  answers[1].style.display = 'inline';
  answers[2].style.display = 'inline';
  answers[3].style.display = 'inline';
  answer1.disabled = false;
  answer2.disabled = false;
  answer3.disabled = false;
  answer4.disabled = false;
  finJuego.style.display = 'none';
  winnerImg.style.display = 'none';
  equalsImg.style.display = 'none';
  good.style.display = 'none';
  bad.style.display = 'none';
  good.style.visibility = "hidden";
  bad.style.visibility = "hidden";
  tiempoTotal = 7;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  i = 0;
  while (i <= 3) {
    usersGr[i].textContent = '';
    pointsgr[i].textContent = '';
    avatarGr[i].style.visibility = "hidden";
    i++;
  }
  for (i = 0; i < users.length; i++) {
    const li = document.createElement('li');
    li.innerText = users[i].username;
    usersGr[i].textContent = users[i].username;
    pointsgr[i].textContent = users[i].puntaje;
    avatarGr[i].style.visibility = "visible";
    userList.appendChild(li);
  }
}

//Answer wrong
function mala() {
  answer1.disabled = true;
  answer2.disabled = true;
  answer3.disabled = true;
  answer4.disabled = true;
  bad.style.visibility = "visible";
  bad.style.display = 'inline';
  socket.emit('respuestaMala', regresiveCount)
}

//Answer Right
function buena() {
  answer1.disabled = true;
  answer2.disabled = true;
  answer3.disabled = true;
  answer4.disabled = true;
  socket.emit('respuestaBuena', regresiveCount);
  answers[0].style.backgroundColor = "green";
  good.style.visibility = "visible";
  good.style.display = 'inline';
  console.log("verde");
}

function play() {
  contQues = 7
  a = setInterval(next, 7000);
  b = setInterval(reloj, 1000);
  socket.emit('playQuiz');
}

//Next question
function next() {
  tiempoTotal = 7;
  contQues = contQues - 1;
  if (contQues >= 0) {
    socket.emit('nextQuestion');
  } else {
    clearInterval(a);
    clearInterval(b)
  }
}

socket.on('regresiva', tiempo => {
  regresiveCount = tiempo;
  document.getElementById('countdown').innerHTML = tiempo;
})

function reloj() {
  tiempoTotal -= 1;
  socket.emit('enviarTiempo', tiempoTotal);
}


