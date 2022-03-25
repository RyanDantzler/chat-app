const passport = require('passport');
const bcrypt = require('bcrypt');

const avatars = [
  'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShaggyMullet&accessoriesType=Sunglasses&hairColor=Blonde&facialHairType=BeardMajestic&facialHairColor=Blonde&clotheType=GraphicShirt&clotheColor=Gray01&graphicType=Pizza&eyeType=Wink&eyebrowType=SadConcernedNatural&mouthType=Smile&skinColor=Light',
  'https://avataaars.io/?avatarStyle=Circle&topType=WinterHat3&accessoriesType=Kurt&hatColor=PastelRed&facialHairType=BeardMedium&facialHairColor=Brown&clotheType=CollarSweater&clotheColor=Gray01&eyeType=Close&eyebrowType=RaisedExcited&mouthType=Tongue&skinColor=Light',
  'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Sunglasses&hairColor=Red&facialHairType=MoustacheFancy&facialHairColor=Auburn&clotheType=CollarSweater&clotheColor=Red&eyeType=Squint&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Tanned',
  'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
  'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraightStrand&accessoriesType=Prescription01&hairColor=Blue&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Black&graphicType=Cumbia&eyeType=Wink&eyebrowType=UpDown&mouthType=Smile&skinColor=Light',
  'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight2&accessoriesType=Kurt&hairColor=BlondeGolden&facialHairType=Blank&clotheType=CollarSweater&clotheColor=Gray02&eyeType=Surprised&eyebrowType=UpDownNatural&mouthType=Sad&skinColor=Tanned'
];

module.exports = function (app, myDatabase) {
  app.route('/').get((req, res) => {
    if(req.isAuthenticated()) {
      console.log(req);
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Logged In', 
        message: 'Welcome back, ' + req.user.username, 
        showLogin: false,
        showRegistration: false,
        showSocialAuth: false,
        loggedIn: true
      });
    } else {
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Connected to Database', 
        message: 'Please login', 
        showLogin: true,
        showRegistration: false,
        showSocialAuth: true
      });
    }
  });

    app.route('/login').get((req, res) => {
    if(req.isAuthenticated()) {
      console.log(req);
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Logged In', 
        message: 'Welcome back, ' + req.user.username, 
        showLogin: false,
        showRegistration: false,
        showSocialAuth: false,
        loggedIn: true
      });
    } else {
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Connected to Database', 
        message: 'Please login', 
        showLogin: true,
        showRegistration: false,
        showSocialAuth: true
      });
    }
  });

  app.route('/register').get((req, res) => {
    if(req.isAuthenticated()) {
      console.log(req);
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Logged In', 
        message: 'Welcome back, ' + req.user.username, 
        showLogin: false,
        showRegistration: false,
        showSocialAuth: false,
        loggedIn: true
      });
    } else {
      res.render(process.cwd() + '/views/pug/index', {
        title: 'Connected to Database', 
        message: 'Please login', 
        showLogin: false,
        showRegistration: true,
        showSocialAuth: false
      });
    }
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });
  
  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', { loggedIn: true, username: req.user.username, avatar: req.user.avatar });
  });

  app.route('/chat').get(ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/chat', { loggedIn: true, user: req.user });
  });

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });
  
  app.route('/register').post(
    (req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDatabase.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          let rand = Math.floor(Math.random() * 6);
          myDatabase.insertOne({
            username: req.body.username,
            password: hash,
            avatar: avatars[rand]
          }, (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                // The inserted document is held within
                // the ops property of the doc
                next(null, doc.ops[0]);
              }
            }
          );
        }
      });
    }, 
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.route('/auth/github').get(passport.authenticate('github'));
  app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    req.session.user_id = req.user.id;
    res.redirect('/chat');
  });

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not Found');
  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};