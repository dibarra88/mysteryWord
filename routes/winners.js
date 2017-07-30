const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const path = require('path')
const router = express.Router();
const jsonfile = require('jsonfile')
const file = './temp/data.json'

const winners = [];

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(express.static(path.join(__dirname, 'static')))

router.get('/winners', function (req, res, next) {
    req.session.destroy();
    jsonfile.readFile(file, function (err, winners) {
      res.render('winners', { winners })
    })
})

router.post('/startAgain', function (req, res, next) {
    req.session.destroy();
    res.redirect('/');
})

module.exports = router;