const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('category-name');
const userList = document.getElementById('users');
const userName = document.getElementById('userName');
const playButton = document.getElementById('play');
const nextButton = document.getElementById('next');
const answer1 = document.getElementById('answer1');
const answer2 = document.getElementById('answer2');
const answer3 = document.getElementById('answer3');
const answer4 = document.getElementById('answer4');

answer2.style.display = 'none';
answer3.style.display = 'none';
answer4.style.display = 'none';
answer1.style.display = 'none';
playButton.disabled = true;

function group(info){
  grid = [];
  for(i = 1; i <= 4; i++){
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

socket.on('newQuestion', data => {
    document.querySelector("#difficulty").innerHTML = `Difficulty: ${data.difficulty}`
    document.querySelector("#question").innerHTML = `Question: ${data.question}`
    answer1.innerHTML = `${data.correct_answer}`
    answer2.innerHTML = `${data.incorrect_answers[0]}`
    answer3.innerHTML = `${data.incorrect_answers[1]}`
    answer4.innerHTML = `${data.incorrect_answers[2]}`
    answer1.style.display = 'inline';
    answer2.style.display = 'inline';
    answer3.style.display = 'inline';
    answer4.style.display = 'inline';
    
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

// // Add users to DOM
// function outputUsers(users) {
//   userList.innerHTML = '';
//   users.forEach(user=>{
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
//   });
//  }

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  for(i = 0; i < users.length; i++){
    const li = document.createElement('li');
    li.innerText = users[i].username;
    usersGr[i].textContent = users[i].username;
    userList.appendChild(li);
  }
 }

function play(){
 socket.emit('playQuiz'); 
}

function next(){
  socket.emit('nextQuestion');
}

