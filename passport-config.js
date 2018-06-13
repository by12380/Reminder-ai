const LocalStrategy = require('passport-local');
const User = require('./models/user');

const errorMessage = 'Incorrect email or password.';

const initLocalLoginInAndRegisterStrategies = function (passport) {
    //Setup login strategy
    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'email',
        },
        function(email, password, done) {
          if (email) {
            email = email.toLowerCase();
          }
          User.findOne({ 'local.email': email }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
              return done(null, false, { message: errorMessage });
            }
            if (!user.validPassword(password)) {
              return done(null, false, { message: errorMessage });
            }
            return done(null, user);
          });
        }
    ));
    //Setup register strategy
    passport.use('local-register', new LocalStrategy(
      {
          usernameField: 'email',
          passReqToCallback : true
      },
      function(req, email, password, done) {
        //Check if email is null
        if (!email) {
          return done(null, false, { message: 'Email is required' });
        }
        if (!password) {
          return done(null, false, { message: 'Password is required' });
        }
        email = email.toLowerCase();
        User.findOne({ 'local.email': email }, function(err, user) {
          if (err) { return done(err); }
          if (user) {
            return done(null, false, { message: 'Email already exist' });
          }
          //Check if password matches
          if (password != req.body.confirmPassword) {
            return done(null, false, { message: 'Password must match' });
          }

          const newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.hashPassword(password);
          newUser.save(function(err){
            if (err) return done(err);
            return done(null, newUser);
          });
        });
      }
  ));
}

module.exports = { initLocalLoginInAndRegisterStrategies };