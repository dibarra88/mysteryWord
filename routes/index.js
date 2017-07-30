const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const router = express.Router();
const fs = require('fs');
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))


router.get('/', function (req, res, next) {
    res.render("index")
})

router.post('/', function(req, res, next){
    if(req.body.mode === undefined || req.body.mode === ""){
        res.render('index',{error:"Please select mode"});
    }
    else{
        req.session.word = generateRandomWord(req.body.mode);
        req.session.mode = req.body.mode;
        req.session.guessesLeft = 8;
      req.session.wordArray = [];
      for(let i=0; i < req.session.word.length; i++){
        var temp = {letter:null, guessed:true};
        req.session.wordArray.push(temp);
      }
        req.session.guessArray = [];
        req.session.status ={
          playing:true,
          lost:false,
          win:false
        }
        res.redirect('/game')
    }
   console.log("MYSTERY WORD ===============" ,req.session.word)
})

//Generate Random Word
function generateRandomWord(mode) {
  var randomIndex = 0;
  var randomWord = "";
  var wordsArray = [];
  if (mode === 'easy') {
    wordsArray = words.filter(function (e) {
      return e.length >= 4 && e.length <= 6;
    });
  }
  else if (mode === 'normal') {
    wordsArray = words.filter(function (e) {
      return e.length >= 6 && e.length <= 8;
    });
  }
  else if (mode === 'hard') {
    wordsArray = words.filter(function (e) {
      return e.length > 8;
    });
  }
  var randomIndex = Math.floor(Math.random() * wordsArray.length);
  randomWord = wordsArray[randomIndex];
  return randomWord;
}


module.exports = router;