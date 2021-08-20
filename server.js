const cors = require('cors');
require('dotenv').config();
const {CLIENT_ID, CLIENT_SECRET, EXPRESS_PORT, CLIENT_URL, NODE_ENV} = process.env,
SlackStrategy = require('passport-slack').Strategy,
passport = require('passport');
const express = NODE_ENV === 'development' ? require('https-localhost') : require('express');
const app = express();

app.use(require("express-session")({
  secret: "This is the secret line",
  resave: false,
  saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());
//CORS
app.use(cors())
app.use(require('body-parser').urlencoded({ extended: true }));

// setup the strategy using defaults 
passport.use(new SlackStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: '/auth/slack/callback',
  scope: ['identity.basic', 'identity.email', 'identity.avatar'] // default
}, (accessToken, refreshToken, profile, done) => {
  // optionally persist profile data
  done(null, profile);
}
));

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((id, done) => {
  return done(null, id);
});

// path to start the OAuth flow
app.get('/auth/slack', passport.authenticate('slack'))

//Error
app.get('/auth/error', (req, res) => res.send('Unknown Error'))
// OAuth callback url
app.get('/auth/slack/callback', 
  passport.authenticate('slack', { failureRedirect: '/auth/error'}),(req, res) => {
    res.redirect(CLIENT_URL)
  }
);

//Main page
app.get('/user',(req,res)=>{
  res.status(200).json({
    user: req.user
  })
  
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect(CLIENT_URL);
});

// This displays message that the server running and listening to specified port
app.listen(EXPRESS_PORT, () => console.log(`Listening on port ${EXPRESS_PORT}`));