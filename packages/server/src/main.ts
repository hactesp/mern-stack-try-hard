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

//configure passport.js to use the local strategy
passport.use(new Strategy(
  { usernameField:'userName' },
  async (email, password, done) => {
    console.log('Inside local strategy callback')
    const user = await UserModel.findOne({userName: email}).exec().catch(error => done(error));
    console.log('User fetched: ',email, user);
    if (!user) {
      return done(null, false, { message: 'Invalid credentials.\n' });
    }
    if (password != user.password) {
      return done(null, false, { message: 'Invalid credentials.\n' });
    }
    return done(null, user);
  }
));

//tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user['_id']);
});

passport.deserializeUser(async (id, done) => {
  const user = await UserModel.findOne({_id: id}).exec();
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
  res.send({message: 'Hello API'});
});

app.get('/login', (req, res,next) => {
  if(req.isAuthenticated()) {
    res.redirect('/home-page')
  } else {
    res.send('You see login again')
  }
});

app.post('/login',(req, res, next) => {
  passport.authenticate('local', (err, user) => {
    req.login(user, (err) => {
      if (err || !user) {
        return res.send(err);
      }
      return res.redirect('/authrequired');
    })
  })(req, res, next);
});

app.get('/authrequired', (req, res) => {
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

app.get('/user/:userID', async (req, res) => {
  const result =  UserModel.findById(req.user['id']);
  res.send(result);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${ host }:${ port }`);
});
