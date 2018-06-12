const LocalStrategy = require('passport-local');
const User = require('./models/user');

const errorMessage = 'Incorrect email or password.';

const initLocalLoginInAndRegisterStrategies = function (passport) {
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
        },
        function(email, password, done) {
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
}

module.exports = { initLocalLoginInAndRegisterStrategies };