var express = require('express');
var router = express.Router();
const passport = require('passport');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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

module.exports = router;
