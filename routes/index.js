var express = require('express');
var router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const User = require('../models/user');
const { Wit } = require('node-wit');
const { WIT_TOKEN } = require('../config');

const witClient = new Wit({
    accessToken: WIT_TOKEN,
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Reminder.ai' });
});

router.get('/login', function(req, res){
  res.render('login.ejs', { errorMessage: req.flash('error') });
})

router.post('/login',  passport.authenticate('local-login', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

router.post('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

router.get('/register', function(req, res){
  res.render('register.ejs', { errorMessage: req.flash('error') });
})

router.post('/register',
  passport.authenticate(
  'local-register',
  {
    successRedirect: '/dashboard',
    failureRedirect: '/register',
    failureFlash: true
  })
)

router.get('/dashboard', ensureLoggedIn(), function(req, res){
  res.render('dashboard.ejs');
})

router.put('/socketId', ensureLoggedIn(), (req, res) => {
  User.findByIdAndUpdate(req.user.id, { socketId: req.body.socketId })
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      res.status(500).json({ message: 'Internal server error' });
    })
})

router.post('/reminder-ai', ensureLoggedIn(), function(req, res){
  witClient.message(req.body.transcript, {})
    .then((data) => {
      const reminder = {};

      if (!data.entities.task ||
          !data.entities.task.length ||
          !(data.entities.task[0].confidence > 0.8)) {
          reminder.title = 'To do';
          reminder.memo = data._text;
      }
      else {
        reminder.title = data.entities.task[0].value;
      }

      

      if (data.entities.datetime &&
          data.entities.datetime.length &&
          data.entities.datetime[0].confidence > 0.8) {
          reminder.dueDate = data.entities.datetime[0].value;
      }
      else {
        const date = new Date();
        reminder.dueDate = date.setDate(date.getDate() + 1);
      }

      res.status(200).json(reminder);
    })
    .catch(console.error);
})

module.exports = router;
