const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('category-name');
const userList = document.getElementById('users');
const playButton = document.getElementById('play');
const nextButton = document.getElementById('next');

playButton.disabled = true;

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

socket.on('newQuestion', data => {
  console.log(data)
    document.querySelector("#category").innerHTML = `Category: ${data.category}`
    document.querySelector("#difficulty").innerHTML = `Difficulty: ${data.difficulty}`
    document.querySelector("#question").innerHTML = `Question: ${data.question}`
    document.querySelector("#answer1").innerHTML = `${data.correct_answer}`
    document.querySelector("#answer2").innerHTML = `${data.incorrect_answers[0]}`
    document.querySelector("#answer3").innerHTML = `${data.incorrect_answers[1]}`
    document.querySelector("#answer4").innerHTML = `${data.incorrect_answers[2]}`
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  
  msg = msg.trim();
  
  if (!msg){
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
  users.forEach(user=>{
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
 }

function play(){
 socket.emit('playQuiz'); 
}

function next(){
  socket.emit('nextQuestion');
}
