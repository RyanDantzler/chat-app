require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GitHubStrategy = require('passport-github').Strategy;
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;

module.exports = function (app, myDatabase) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    myDatabase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      if (err) return console.error(err);
      done(null, doc);
    });
  });
  passport.use(new LocalStrategy({ passReqToCallback: true },
    function(req, username, password, done) {      
      myDatabase.findOne({ username: username }, function(err, user) {
        req.session.messages = [];
        if (err) { return done(err); }
        if (!user) { 
          return done(null, false, { message: 'Incorrect username or password' }); 
        }
        if (!bcrypt.compareSync(password, user.password)) { 
          return done(null, false, { message: 'Incorrect username or password' }); 
        }
        return done(null, user);
      });
    }
  ));
  
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: 'https://chat-app.ryandantzler.repl.co/auth/github/callback'
  },
    function(accessToken, refreshToken, profile, cb) {
      myDatabase.findOneAndUpdate(
        { id: profile.id },
        {
          $setOnInsert: {
            
            id: profile.id,
            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, returnDocument: 'after' },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
    }
  ));

    passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://chat-app.ryandantzler.repl.co/auth/google/callback"
  },
    function(accessToken, refreshToken, profile, cb) {
      myDatabase.findOneAndUpdate(
        { id: profile.id },
        {
          $setOnInsert: {
            
            id: profile.id,
            name: profile.displayName || 'John Doe',
            photo: profile.photos[0].value || '',
            email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
            created_on: new Date(),
            provider: profile.provider || ''
          },
          $set: {
            last_login: new Date()
          },
          $inc: {
            login_count: 1
          }
        },
        { upsert: true, returnDocument: 'after' },
        (err, doc) => {
          return cb(null, doc.value);
        }
      );
    }
  ));
}