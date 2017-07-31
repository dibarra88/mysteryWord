const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const router = express.Router();
const os = require('os')
const fs = require('fs')
const path = require('path')
//const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const jsonfile = require('jsonfile')
const file = './temp/data.json'
const multer = require('multer')

const winners = [];
const user = {};

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(express.static(path.join(__dirname, 'static')))
router.use(expressValidator())

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./static/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
            req.fileValidationError = "Invalid file format. File formats accepted are .png, .jpeg, and .jpg";
            return cb(null, false, new Error('wrong mimetype'));
        }
        else {
            req.session.fileName = '/uploads/' + file.originalname;
        }
        cb(null, true);
    }
})

router.get('/game', function (req, res, next) {
    if (!req.session.word) {          //if no active session then send to root
        res.redirect('/')
    }
    else {
        res.render("game", req.session)
    }
})
router.post('/game', function (req, res, next) {
    req.session.error = "";

    if (req.body.guess.length !== 1) {
        req.session.error = "Enter one letter a time.";
        res.render("game", req.session)
    }
    else if (/[a-zA-Z]/.test(req.body.guess)) {
        if (req.session.guessArray.indexOf(req.body.guess.toLowerCase()) !== -1) { //check if letter was already guessed
            req.session.error = "You already guessed " + req.body.guess;
            res.render("game", req.session)
        }
        else {
            checkGuessIsInWord(req.session, req.body.guess);
            res.render('game', req.session)
        }
    }
    else{
        req.session.error = "Only Letters";
        res.render("game", req.session)
    }
})
router.post('/startAgain', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
})

router.post('/record', upload.single('profileImage'), function (req, res, next) {
    req.checkBody("userName", "You must enter a name with maximum lenght of 15 characters.").notEmpty().len({ max: 15 });
    req.getValidationResult().then(function (result) {
        var errors = result.useFirstErrorOnly().array();
        if (errors.length > 0) {
            req.session.error = errors[0].msg;
            res.redirect('/game')
        }
        else if (req.fileValidationError) {
            req.session.error = req.fileValidationError;
            req.session.userName = req.body.userName;
            res.redirect('/game')
        }
        else {
            req.session.error = '';
            req.session.userName = req.body.userName;
            if (req.session.fileName === undefined) {
                req.session.fileName = '/img/placeholder.png' //use image placeholder
            }
            jsonfile.readFile(file, function (err, winners) {
                winners.push({
                    name: req.body.userName,
                    word: req.session.word,
                    guessesLeft: req.session.guessesLeft,
                    mode: req.session.mode,
                    image: req.session.fileName
                });
                jsonfile.writeFileSync(file, winners)
            })
            res.redirect('/winners')
        }
    })
})

function checkGuessIsInWord(session, userGuess) {
    var containsLetter = false;
    var stillEmptySpaces = false;
    var guess = userGuess.toLowerCase();
    for (var i = 0; i < session.word.length; i++) {
        if (session.word[i] === guess) {
            var temp = { letter: guess, guessed: true };
            session.wordArray[i].letter = guess;
            containsLetter = true;
        }
        if (session.wordArray[i].letter === null) {
            stillEmptySpaces = true;
        }
    }
    if (!containsLetter) {        //Letter was not found
        session.guessArray.push(guess);
        session.guessesLeft -= 1;     //take away 1 guess
        if (session.guessesLeft === 0) {
            userLost(session);
        }
    }
    if (stillEmptySpaces === false) {
        userWon(session);
    }
    if (session.guessArray.indexOf(guess) === -1) {
        session.guessArray.push(guess.toLowerCase());
    }
    return;
}
function userLost(session) {
    for (let i = 0; i < session.word.length; i++) {
        if (session.wordArray[i].letter === null) {
            session.wordArray[i].letter = session.word[i];
            session.wordArray[i].guessed = false;
        }
    }
    session.status.playing = false;
    session.status.lost = true;
}
function userWon(session) {
    session.status.playing = false;
    session.status.win = true;
}

module.exports = router;