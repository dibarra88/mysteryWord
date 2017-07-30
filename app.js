const express = require('express');
const app = express();
const path = require('path');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const router = express.Router()
const indexRoute = require('./routes/index')
const gameRoute = require('./routes/game')
const winnerRoute = require('./routes/winners')

app.engine('mustache', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(express.static(path.join(__dirname, 'static')))
app.use(session({secret: 'mySecret',resave: false,saveUninitialized: true}))

app.use("/", indexRoute);
app.use("/", gameRoute);
app.use('/', winnerRoute);

app.listen(3000, function () {
  console.log("App running on port 3000")
})