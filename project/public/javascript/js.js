const socket = io();

const roomContainer = document.getElementById('room-container')
const quoteDisplayElement = document.getElementById('quoteDisplay')
const quoteInputElement = document.getElementById('quoteInput')
const container = document.getElementById('container')
const userName = document.getElementById('username')
const popup = document.getElementById('popup')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')


const startButton = document.getElementById("startButton")

let score = 0
let currentQuote = ""
let clear

let roundNumber = 0;
let serverRoundNumber = 1


if (messageForm != null) {
  const name = prompt('What is your name?')
  socket.emit('new-user', roomName, name, score)
  socket.emit("initiate game", roomName)
}

socket.on("roundUpdate", (roundNum) => {
  serverRoundNumber = roundNum
})

socket.on("room-created", room => {
  const roomElement = document.createElement("div")
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on("startGame", (quote) => {
  container.classList.remove("none")
  popup.classList.add("none")
  console.log("De game is begonnen");
  roundNumber++

  game(quote)
})

socket.on("roundOver", ((winner, players) => {
  quoteInputElement.classList.add("none")
  quoteDisplay.innerHTML = `${winner} won this round, next round will be starting soon`
}))

socket.on("gameOver", ((winner) => {
  quoteInputElement.classList.add("none")
  clearInterval(clear);
  quoteDisplay.innerHTML = `${winner} wins the game!`
  roundNumber = 0;
  serverRoundNumber = 1;
  currentQuote = "";

  setTimeout(() => {
    window.location.replace("http://localhost:3400");
  }, 3000)
}))

const quoteCorrectFalse = () => {
  quoteInputElement.addEventListener('input', () => {
    const arrayQuote = quoteDisplayElement.querySelectorAll('span')
    const arrayQuoteCorrect = quoteDisplayElement.querySelectorAll('.correct')
    const arrayValue = quoteInputElement.value.split('')

    let correct = false
    arrayQuote.forEach((characterSpan, index) => {
      const character = arrayValue[index]

      if (character == null) {
        characterSpan.classList.remove('correct')
        characterSpan.classList.remove('incorrect')
      } else if (character === characterSpan.innerText) {
        characterSpan.classList.add('correct')
        characterSpan.classList.remove('incorrect')
        console.log(arrayQuote.length);
        console.log(arrayQuoteCorrect.length);
        if (arrayQuote.length === arrayQuoteCorrect.length) {
          correct = true;
        }

      } else {
        characterSpan.classList.remove('correct')
        characterSpan.classList.add('incorrect')
      }
    })

    if (correct) {
      correct = false
      socket.emit("score", roomName, score)
      return
    } else {
      return
    }
  })
}

quoteCorrectFalse()

function game(quote) {
  quoteInputElement.classList.remove("none")
    quoteDisplayElement.innerHTML = ''
    quote.split('').forEach(character => {
      const characterSpan = document.createElement('span')
      characterSpan.innerText = character
      quoteDisplayElement.appendChild(characterSpan)

    })
    quoteInputElement.value = null
}

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}
