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
const answers = [answer1, answer2, answer3, answer4];
const timer = document.getElementById('timer');

finJuego.style.display = 'none';
answer2.style.display = 'none';
answer3.style.display = 'none';
answer4.style.display = 'none';
answer1.style.display = 'none';
playButton.disabled = true;

answers[0].addEventListener("click", buena);
answers[1].addEventListener("click", mala);
answers[2].addEventListener("click", mala);
answers[3].addEventListener("click", mala);

function group(info) {
  grid = [];
  for (i = 1; i <= 4; i++) {
    //usersGrid.push(document.getElementsByClassName('user'.concat(i))[0].children[0].children[0]);
    grid.push(document.getElementsByClassName('user'.concat(i))[0].children[info].children[0]);
  }
  return grid;
}

usersGr = group(0);
pointsgr = group(1);


//htmlusuarios[2][0].children[0].children[0].textContent = "MAMOR3"
//puntos = document.getElementsByClassName('user1')[0].children[1].children[0].textContent = 45

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

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
  let max=-7;
  let ganador='';
  console.log(users)

  users.forEach(element => {
    if(element.puntaje>max){
      max= element.puntaje;
      ganador=element.username;
    }
  });
  console.log('gano'+ ganador)
  ganador1.innerHTML=`El ganador es: ${ganador}`
});

//Nueva pregunta con las opciones desordenadas
socket.on('newQuestion', data => {
    answers.sort(function () { return 0.5 - Math.random() })
    answers[0].removeEventListener("click", mala);
    answers[0].addEventListener("click", buena);
    answers[1].removeEventListener("click", buena);
    answers[1].addEventListener("click", mala);
    answers[2].removeEventListener("click", buena);
    answers[2].addEventListener("click", mala);
    answers[3].removeEventListener("click", buena);
    answers[3].addEventListener("click", mala);
    document.querySelector("#difficulty").innerHTML = `Difficulty: ${data.difficulty}`
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
  i=0;
  while(i<=3) {
    usersGr[i].textContent = '';
    pointsgr[i].textContent = '';
    i++;
  }
  for (i = 0; i < users.length; i++) {
    const li = document.createElement('li');
    li.innerText = users[i].username;
    usersGr[i].textContent = users[i].username;
    pointsgr[i].textContent = users[i].puntaje;
    userList.appendChild(li);
  }
}


function play() {
  // setInterval(next, 5000);
  socket.emit('playQuiz');
  
}

// function time(){
//   now = timer.textContent
//   if (now == 0) {next()}
//   timer.textContent = now -1
// }

//Next question
function next() {
  socket.emit('nextQuestion');
}

//Answer wrong
function mala() {
  answer1.disabled = true;
  answer2.disabled = true;
  answer3.disabled = true;
  answer4.disabled = true;
  socket.emit('respuestaMala');
}

//Answer Right
function buena() {
  answer1.disabled = true;
  answer2.disabled = true;
  answer3.disabled = true;
  answer4.disabled = true;
  socket.emit('respuestaBuena');
}

