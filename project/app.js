const PORT = process.env.port || 3400
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const app = express()
const io = require('socket.io')(app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
}))

const Twit = require('twit')

const T = new Twit({
  consumer_key:         '8fLUpQLvymdpXwSdU8E0ICALf',
  consumer_secret:      'Y6HM1hqn2hGgHI8O7wiePpgN9SEuRBC4iinaoset6P8huF6l4M',
  access_token:         '1215291257880268801-n8tRxAYoZLPSQrqpMjp3mu4ywp6W71',
  access_token_secret:  'IXdtiNrz79lMaIlG6d39VstjOLcAfe2vgoyTj8NXHgKr0'
})

const rooms = { }
const users = []

app.get('/', (req, res) =>  {
  res.render("index", { rooms: rooms})
})

app.use(express.urlencoded({ extended: true }))

app.post('/room', (req, res) => {
  if (rooms[req.body.room] != null) {
    return res.redirect('/')
  }
  rooms[req.body.room] = { users: [], round: 0 }
  res.redirect(req.body.room)
  io.emit('room-created', req.body.room)
})

app.get('/:room', (req, res) =>  {
  if (rooms[req.params.room] == null) {
    return res.redirect('/')
  }
  res.render("room", { roomName: req.params.room})

})

const fetch = require("node-fetch")

const {checkWhoScored} = require("./helperFunctions")

app.set('view engine', 'ejs');
app.use(express.static('public'))

app.get("/", (req, res) => {
  res.render("index")
})

app.get('/', (req, res) => {
  res.sendFile('/index.html');
});

io.on('connection', socket => {
});

var game = {
  currentQuote: ""
}

io.on('connection', (socket) => {
  socket.on('new-user', (room, name, score) => {
    socket.join(room)
    rooms[room].users.push({userName: name, score: score, id: socket.id})
    socket.to(room).emit("status", socket.id)
  })

  const updateRound = (room) => {
      rooms[room].round++
      io.to(room).emit("roundUpdate", rooms[room].round)
  }

  socket.on("initiate game", (room, username) => {
    T.get('search/tweets', { q: `${room} exclude:retweets`, count: 4,  tweet_mode: 'extended', lang: 'en'})
    .then(data => {
        game.currentQuote = data.data.statuses[0].full_text
      if (rooms[room].users.length >= 2) {
        setTimeout(() => {
          io.to(room).emit("startGame", game.currentQuote)
        }, 300)
      } else {
        console.log("niet genoeg mensen");
      }
    })
    return

    const {playersNeededToStart, players} = game;
  })


  socket.on("score", (room, score, time) => {
    rooms[room].users.filter(user => user.id === socket.id )[0].score++
    if ( rooms[room].users.filter(user => user.id === socket.id )[0].score === 2) {
      io.to(room).emit("gameOver", rooms[room].users.filter(user => user.id === socket.id )[0].userName)
    } else {
      updateRound(room)

      io.to(room).emit("roundOver", rooms[room].users.filter(user => user.id === socket.id )[0].userName)

      setTimeout(() => {
        console.log("ik wordt aangeroepen" + `${socket.id}` );
        T.get('search/tweets', { q:  `${room} exclude:retweets`, count: 4,  tweet_mode: 'extended', lang: 'en'})
        .then(data => {
            game.currentQuote = data.data.statuses[0].full_text
          if (rooms[room].users.length >= 2) {
            setTimeout(() => {
              io.to(room).emit("startGame", game.currentQuote)
            }, 300)
          } else {
            console.log("niet genoeg mensen");
          }
        })
        return
      }, 3000)
    }
  })
})
