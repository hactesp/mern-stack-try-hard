import express, { Express } from 'express';
import { UserModel } from "./schemas/user.schema";
import session from 'express-session';
import { dbConnectEstablish, ses } from "./conf";
import helmet from "helmet";
import passport from 'passport';
import {Strategy} from 'passport-local';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app: Express = express();
void dbConnectEstablish();

app.use(session(ses));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
const users = [
  {id:'2f24vvg', email:'test@test.com', password:'password'}
]
//configure passport.js to use the local strategy
passport.use(new Strategy(
  { usernameField:'email' },
  (email, password, done) => {
    console.log('Inside local strategy callback')
    //here is where you make a call to the database
    //to find the user based on their username or email address
    //for now, we'll just pretend we found that it was users[0]
    const user = users[0]
    if(email === user.email && password === user.password) {
      console.log('Local strategy returned true')
      return done(null, user)
    }
    return done("error")
  }
));

//tell passport how to serialize the user
passport.serializeUser((user, done) => {
  console.log('Inside serializeUser callback. User id is save to the session file store here')
  done(null, user['id']);
});

passport.deserializeUser((id, done) => {
  console.log('Inside deserializeUser callback')
  console.log(`The user id passport saved in the session file store is:${id}`)
  const user = users[0].id === id ? users[0] :false;
  done(null, user);
});

// Authentication
app.use(passport.initialize());
app.use(passport.session());

// Clickjacking
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  })
);


app.get('/', (req, res) => {
  console.log('Inside the homepage callback function')
  console.log(req.sessionID)
  res.send({message: 'Hello API'});
});

app.get('/login', (req, res) => {
  console.log('Inside GET /login callback function')
  console.log(req.sessionID)
  res.send(`You got the login page!\n`)
});

app.post('/login',(req, res, next) => {
  console.log('Inside POST /login callback')
  passport.authenticate('local', (err, user, info) => {
    console.log('Inside passport.authenticate() callback');
    console.log(`req.session.passport:${JSON.stringify(req.session['passport'])}`)
    console.log(`req.user:${JSON.stringify(req.user)}`)
    req.login(user, (err) => {
      console.log('Inside req.login() callback')
      console.log(`req.session.passport:${JSON.stringify(req.session['passport'])}`)
      console.log(`req.user:${JSON.stringify(req.user)}`)
      return res.send('You were authenticated & logged in!\n');
    })
  })(req, res, next);
});

app.get('/authrequired', (req, res) => {
  console.log('Inside GET /authrequired callback')
  console.log(`User authenticated? ${req.isAuthenticated()}`)
  if(req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n')
  } else {
    res.redirect('/')
  }
})

app.post('/user', async (req, res) => {
  const payload = new UserModel(req.body);
  await payload.save().then(value => res.send(value)).catch((err) => res.send(err));
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${ host }:${ port }`);
});
